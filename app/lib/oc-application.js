import { getConnection } from "./db";

/**
 * อัปเดตข้อมูลการสมัครสมาชิก OC ทั้งหมด
 * @param {number} membershipId - ID ของใบสมัครหลัก
 * @param {Object} formData - ข้อมูลฟอร์มที่แก้ไขแล้ว
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} rejectionId - ID ของ rejection record
 * @param {string} userComment - Comment จากผู้ใช้
 * @returns {Promise<boolean>} - สำเร็จหรือไม่
 */
export async function updateOCApplication(
  membershipId,
  formData,
  userId,
  rejectionId,
  userComment,
) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. Update main info
    await updateMainInfo(connection, membershipId, formData);

    // 2. Update address
    await updateAddress(connection, membershipId, formData);

    // 3. Update contact person
    await updateContactPerson(connection, membershipId, formData);

    // 4. Update representatives
    await updateRepresentatives(connection, membershipId, formData.representatives);

    // 5. Update business types
    await updateBusinessTypes(connection, membershipId, formData.businessTypes);

    // บันทึก comment ว่า user ได้ resubmit แล้ว
    await addComment(
      connection,
      "oc",
      membershipId,
      userId,
      null,
      "user_resubmit",
      "ผู้ใช้ได้แก้ไขข้อมูลและส่งใบสมัครใหม่",
      null,
      formData,
    );

    // บันทึก comment จากผู้ใช้ (ถ้ามี)
    if (userComment && userComment.trim() !== "") {
      await addComment(
        connection,
        "oc",
        membershipId,
        userId,
        null,
        "user_message",
        userComment,
        null,
        null,
      );
    }

    // อัปเดตสถานะใบสมัครกลับเป็น pending
    await connection.execute(
      `
      UPDATE MemberRegist_OC_Main 
      SET status = 0, 
          resubmission_count = resubmission_count + 1,
          rejection_reason = NULL,
          updated_at = NOW()
      WHERE id = ?
    `,
      [membershipId],
    );

    // ทำให้ rejection record เป็น inactive
    await connection.execute(
      `
      UPDATE MemberRegist_Reject_DATA 
      SET is_active = 0, resubmitted_at = NOW(), updated_at = NOW() 
      WHERE id = ?
    `,
      [rejectionId],
    );

    // บันทึก log ของผู้ใช้
    await connection.execute(
      `
      INSERT INTO Member_portal_User_log (user_id, action_type, details, created_at)
      VALUES (?, 'resubmit_membership', ?, NOW())
    `,
      [userId, JSON.stringify({ membershipType: "oc", membershipId, rejectionId })],
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error updating OC application:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * เพิ่ม comment ในตาราง MemberRegist_Comments
 */
async function updateMainInfo(connection, membershipId, formData) {
  const {
    companyName,
    companyNameEng,
    taxId,
    companyEmail,
    companyPhone,
    industrialGroup,
    provincialChapter,
    products,
    otherBusinessType,
  } = formData;

  await connection.execute(
    `
    UPDATE MemberRegist_OC_Main
    SET company_name_th = ?, company_name_en = ?, tax_id = ?, company_email = ?, company_phone = ?,
        industrial_group_id = ?, provincial_chapter_id = ?, products_services_description = ?, other_business_type = ?
    WHERE id = ?
  `,
    [
      companyName,
      companyNameEng,
      taxId,
      companyEmail,
      companyPhone,
      industrialGroup || null,
      provincialChapter || null,
      products,
      otherBusinessType,
      membershipId,
    ],
  );
}

async function updateAddress(connection, membershipId, formData) {
  const { addressNumber, street, subDistrict, district, province, postalCode } = formData;

  // Assuming one address record per membership, linked by membership_id
  await connection.execute(
    `
    UPDATE MemberRegist_OC_Address
    SET address_no = ?, street = ?, sub_district = ?, district = ?, province = ?, postal_code = ?
    WHERE membership_id = ?
  `,
    [addressNumber, street, subDistrict, district, province, postalCode, membershipId],
  );
}

async function updateContactPerson(connection, membershipId, formData) {
  const {
    contactPersonFirstName,
    contactPersonLastName,
    contactPersonPosition,
    contactPersonEmail,
    contactPersonPhone,
  } = formData;

  await connection.execute(
    `
    UPDATE MemberRegist_OC_Contact
    SET first_name = ?, last_name = ?, position = ?, email = ?, phone_number = ?
    WHERE membership_id = ?
  `,
    [
      contactPersonFirstName,
      contactPersonLastName,
      contactPersonPosition,
      contactPersonEmail,
      contactPersonPhone,
      membershipId,
    ],
  );
}

async function updateRepresentatives(connection, membershipId, representatives) {
  // Delete existing representatives
  await connection.execute("DELETE FROM MemberRegist_OC_Representative WHERE membership_id = ?", [
    membershipId,
  ]);

  // Insert new representatives
  if (representatives && representatives.length > 0) {
    const query = `
      INSERT INTO MemberRegist_OC_Representative (
        membership_id, id_card_number, first_name_th, last_name_th, 
        first_name_en, last_name_en, position, email, phone_number, is_primary
      ) VALUES ?
    `;
    const values = representatives.map((rep) => [
      membershipId,
      rep.idCardNumber,
      rep.firstNameThai,
      rep.lastNameThai,
      rep.firstNameEnglish,
      rep.lastNameEnglish,
      rep.position,
      rep.email,
      rep.phone,
      rep.isPrimary || false,
    ]);
    await connection.query(query, [values]);
  }
}

async function updateBusinessTypes(connection, membershipId, businessTypes) {
  // Delete existing business types
  await connection.execute("DELETE FROM MemberRegist_OC_Business_Type WHERE membership_id = ?", [
    membershipId,
  ]);

  // Insert new business types
  if (businessTypes && businessTypes.length > 0) {
    const query =
      "INSERT INTO MemberRegist_OC_Business_Type (membership_id, business_type_id) VALUES ?";
    const values = businessTypes.map((typeId) => [membershipId, typeId]);
    await connection.query(query, [values]);
  }
}

/**
 * เพิ่ม comment ในตาราง MemberRegist_Comments
 */
async function addComment(
  connection,
  membershipType,
  membershipId,
  userId,
  adminId,
  commentType,
  commentText,
  rejectionReason = null,
  dataChanges = null,
) {
  await connection.execute(
    `
    INSERT INTO MemberRegist_Comments (
      membership_type, membership_id, user_id, admin_id, comment_type, 
      comment_text, rejection_reason, data_changes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      membershipType,
      membershipId,
      userId,
      adminId,
      commentType,
      commentText,
      rejectionReason,
      dataChanges ? JSON.stringify(dataChanges) : null,
    ],
  );
}
