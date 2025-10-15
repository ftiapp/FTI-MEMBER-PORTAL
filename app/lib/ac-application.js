import { getConnection } from "./db";
import { addComment } from "./membership";

/**
 * อัปเดตข้อมูลการสมัครสมาชิก AC ทั้งหมด
 * @param {number} membershipId - ID ของใบสมัครหลัก
 * @param {Object} formData - ข้อมูลฟอร์มที่แก้ไขแล้ว
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} rejectionId - ID ของ rejection record
 * @returns {Promise<boolean>} - สำเร็จหรือไม่
 */
export async function updateACApplication(
  membershipId,
  formData,
  userId,
  rejectionId,
  userComment,
  apiData = {},
) {
  const { industrialGroups: allIndustrialGroups, provincialChapters: allProvincialChapters } =
    apiData;
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. อัปเดตข้อมูลหลักในตาราง MemberRegist_AC_Main
    await updateMainInfo(connection, membershipId, formData);

    // 2. อัปเดตข้อมูลที่อยู่
    await updateAddresses(connection, membershipId, formData);

    // 3. อัปเดตข้อมูลผู้ให้ข้อมูล (Contact Persons)
    await updateContactPersons(connection, membershipId, formData);

    // 4. อัปเดตข้อมูลผู้แทน (Representatives)
    await updateRepresentatives(connection, membershipId, formData);

    // 5. อัปเดตประเภทธุรกิจ
    await updateBusinessTypes(connection, membershipId, formData);

    // 6. อัปเดตข้อมูลผลิตภัณฑ์
    await updateProducts(connection, membershipId, formData);

    // 7. อัปเดตกลุ่มอุตสาหกรรม
    await updateIndustrialGroups(connection, membershipId, formData, allIndustrialGroups);

    // 8. อัปเดตสภาอุตสาหกรรมจังหวัด
    await updateProvinceChapters(connection, membershipId, formData, allProvincialChapters);

    // 9. บันทึก comment การ resubmit
    let commentText = "ผู้ใช้ได้แก้ไขข้อมูลและส่งใบสมัครใหม่";
    if (userComment && userComment.trim() !== "") {
      commentText += `\n\nข้อความจากผู้ใช้:\n${userComment}`;
    }
    await addComment(
      connection,
      "ac",
      membershipId,
      userId,
      null,
      "user_resubmit",
      commentText,
      null,
      formData,
    );

    // 10. อัปเดตสถานะใบสมัครกลับเป็น pending
    await connection.execute(
      `
      UPDATE MemberRegist_AC_Main 
      SET status = 0, 
          resubmission_count = resubmission_count + 1,
          rejection_reason = NULL,
          updated_at = NOW()
      WHERE id = ?
    `,
      [membershipId],
    );

    // 11. ทำให้ rejection record เป็น inactive
    await connection.execute(
      `
      UPDATE MemberRegist_Reject_DATA 
      SET is_active = 0, resubmitted_at = NOW(), updated_at = NOW() 
      WHERE id = ?
    `,
      [rejectionId],
    );

    // 12. บันทึก log ของผู้ใช้
    await connection.execute(
      `
      INSERT INTO FTI_Portal_User_Logs (user_id, action, details, created_at)
      VALUES (?, 'resubmit_membership', ?, NOW())
    `,
      [userId, JSON.stringify({ membershipType: "ac", membershipId, rejectionId })],
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error updating AC application:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * อัปเดตข้อมูลหลักในตาราง MemberRegist_AC_Main
 */
async function updateMainInfo(connection, membershipId, formData) {
  await connection.execute(
    `
    UPDATE MemberRegist_AC_Main SET
      company_name_th = ?,
      company_name_en = ?,
      tax_id = ?,
      company_email = ?,
      company_phone = ?,
      company_phone_extension = ?,
      company_website = ?,
      number_of_employees = ?,
      registered_capital = ?,
      production_capacity_value = ?,
      production_capacity_unit = ?,
      sales_domestic = ?,
      sales_export = ?,
      shareholder_thai_percent = ?,
      shareholder_foreign_percent = ?,
      updated_at = NOW()
    WHERE id = ?
  `,
    [
      formData.companyName || "",
      formData.companyNameEn || "",
      formData.taxId || "",
      formData.companyEmail || "",
      formData.companyPhone || "",
      formData.companyPhoneExtension || "",
      formData.companyWebsite || "",
      formData.numberOfEmployees || 0,
      formData.registeredCapital || "",
      formData.productionCapacityValue || "",
      formData.productionCapacityUnit || "",
      formData.salesDomestic || "",
      formData.salesExport || "",
      formData.shareholderThaiPercent || "",
      formData.shareholderForeignPercent || "",
      membershipId,
    ],
  );
}

/**
 * อัปเดตข้อมูลที่อยู่
 */
async function updateAddresses(connection, membershipId, formData) {
  // ลบที่อยู่เก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_Address WHERE main_id = ?`, [membershipId]);

  // เพิ่มที่อยู่ใหม่
  if (formData.addresses) {
    for (const [addressType, addressData] of Object.entries(formData.addresses)) {
      if (addressData && addressData.addressNumber) {
        await connection.execute(
          `
          INSERT INTO MemberRegist_AC_Address (
            main_id, address_type, building, address_number, moo, soi, road,
            sub_district, district, province, postal_code, phone, email, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            membershipId,
            addressType,
            addressData.building || "",
            addressData.addressNumber || "",
            addressData.moo || "",
            addressData.soi || "",
            addressData.street || "",
            addressData.subDistrict || "",
            addressData.district || "",
            addressData.province || "",
            addressData.postalCode || "",
            addressData.phone || "",
            addressData.email || "",
            addressData.website || "",
          ],
        );
      }
    }
  }
}

/**
 * อัปเดตข้อมูลผู้ให้ข้อมูล
 */
async function updateContactPersons(connection, membershipId, formData) {
  // ลบผู้ให้ข้อมูลเก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_ContactPerson WHERE main_id = ?`, [
    membershipId,
  ]);

  // เพิ่มผู้ให้ข้อมูลใหม่
  if (formData.contactPersons && formData.contactPersons.length > 0) {
    for (const contact of formData.contactPersons) {
      await connection.execute(
        `
        INSERT INTO MemberRegist_AC_ContactPerson (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en,
          position, email, phone, phone_extension, type_contact_id, 
          type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          membershipId,
          contact.firstNameTh || "",
          contact.lastNameTh || "",
          contact.firstNameEn || "",
          contact.lastNameEn || "",
          contact.position || "",
          contact.email || "",
          contact.phone || "",
          contact.phoneExtension || "",
          contact.typeContactId || null,
          contact.typeContactName || "",
          contact.typeContactOtherDetail || "",
        ],
      );
    }
  }
}

/**
 * อัปเดตข้อมูลผู้แทน
 */
async function updateRepresentatives(connection, membershipId, formData) {
  // ลบผู้แทนเก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_Representatives WHERE main_id = ?`, [
    membershipId,
  ]);

  // เพิ่มผู้แทนใหม่
  if (formData.representatives && formData.representatives.length > 0) {
    for (const rep of formData.representatives) {
      await connection.execute(
        `
        INSERT INTO MemberRegist_AC_Representatives (
          main_id, first_name_th, last_name_th, 
          first_name_en, last_name_en, position, phone, phone_extension, email, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          membershipId,
          rep.firstNameThai || "",
          rep.lastNameThai || "",
          rep.firstNameEnglish || "",
          rep.lastNameEnglish || "",
          rep.position || "",
          rep.phone || "",
          rep.phoneExtension || "",
          rep.email || "",
          rep.isPrimary || false,
        ],
      );
    }
  }
}

/**
 * อัปเดตประเภทธุรกิจ
 */
async function updateBusinessTypes(connection, membershipId, formData) {
  // ลบประเภทธุรกิจเก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?`, [
    membershipId,
  ]);
  await connection.execute(`DELETE FROM MemberRegist_AC_BusinessTypeOther WHERE main_id = ?`, [
    membershipId,
  ]);

  // เพิ่มประเภทธุรกิจใหม่
  if (formData.businessTypes) {
    for (const [type, selected] of Object.entries(formData.businessTypes)) {
      if (selected && type !== "other") {
        await connection.execute(
          `
          INSERT INTO MemberRegist_AC_BusinessTypes (main_id, business_type)
          VALUES (?, ?)
        `,
          [membershipId, type],
        );
      }
    }

    // เพิ่มประเภทธุรกิจอื่นๆ
    if (formData.businessTypes.other && formData.otherBusinessTypeDetail) {
      await connection.execute(
        `
        INSERT INTO MemberRegist_AC_BusinessTypeOther (main_id, detail)
        VALUES (?, ?)
      `,
        [membershipId, formData.otherBusinessTypeDetail],
      );
    }
  }
}

/**
 * อัปเดตข้อมูลผลิตภัณฑ์
 */
async function updateProducts(connection, membershipId, formData) {
  // ลบผลิตภัณฑ์เก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_Products WHERE main_id = ?`, [
    membershipId,
  ]);

  // เพิ่มผลิตภัณฑ์ใหม่
  if (formData.products && formData.products.length > 0) {
    for (const product of formData.products) {
      await connection.execute(
        `
        INSERT INTO MemberRegist_AC_Products (main_id, name_th, name_en)
        VALUES (?, ?, ?)
      `,
        [membershipId, product.nameTh || product.name || "", product.nameEn || ""],
      );
    }
  }
}

/**
 * อัปเดตกลุ่มอุตสาหกรรม
 */
async function updateIndustrialGroups(
  connection,
  membershipId,
  formData,
  allIndustrialGroups = [],
) {
  // ลบกลุ่มอุตสาหกรรมเก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?`, [
    membershipId,
  ]);

  // เพิ่มกลุ่มอุตสาหกรรมใหม่
  if (formData.industrialGroups && formData.industrialGroups.length > 0) {
    for (const groupId of formData.industrialGroups) {
      const group = allIndustrialGroups.find((g) => g.id === groupId);
      await connection.execute(
        `
        INSERT INTO MemberRegist_AC_IndustryGroups (main_id, industry_group_id, industry_group_name)
        VALUES (?, ?, ?)
      `,
        [membershipId, groupId, group ? group.name_th : "ไม่ระบุ"],
      );
    }
  }
}

/**
 * อัปเดตสภาอุตสาหกรรมจังหวัด
 */
async function updateProvinceChapters(
  connection,
  membershipId,
  formData,
  allProvincialChapters = [],
) {
  // ลบสภาอุตสาหกรรมจังหวัดเก่าทั้งหมด
  await connection.execute(`DELETE FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?`, [
    membershipId,
  ]);

  // เพิ่มสภาอุตสาหกรรมจังหวัดใหม่
  if (formData.provincialChapters && formData.provincialChapters.length > 0) {
    for (const chapterId of formData.provincialChapters) {
      const chapter = allProvincialChapters.find((c) => c.id === chapterId);
      await connection.execute(
        `
        INSERT INTO MemberRegist_AC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name)
        VALUES (?, ?, ?)
      `,
        [membershipId, chapterId, chapter ? chapter.name_th : "ไม่ระบุ"],
      );
    }
  }
}

/**
 * เพิ่ม admin comment เมื่อปฏิเสธใบสมัคร
 */
export async function addAdminRejectionComment(
  membershipType,
  membershipId,
  adminId,
  rejectionReason,
  adminNote = null,
) {
  const connection = await getConnection();

  try {
    await addComment(
      connection,
      membershipType,
      membershipId,
      null,
      adminId,
      "admin_rejection",
      adminNote || "ใบสมัครถูกปฏิเสธ",
      rejectionReason,
    );
  } finally {
    connection.release();
  }
}

/**
 * เพิ่ม admin comment เมื่ออนุมัติใบสมัคร
 */
export async function addAdminApprovalComment(
  membershipType,
  membershipId,
  adminId,
  adminNote = null,
) {
  const connection = await getConnection();

  try {
    await addComment(
      connection,
      membershipType,
      membershipId,
      null,
      adminId,
      "admin_approval",
      adminNote || "ใบสมัครได้รับการอนุมัติ",
    );
  } finally {
    connection.release();
  }
}
