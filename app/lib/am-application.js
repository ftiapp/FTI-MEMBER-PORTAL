import { getConnection } from "./db";
import { addComment } from "./membership"; // Assuming addComment will be generalized

/**
 * Updates an Associate Member (AM) application after resubmission.
 * @param {string} membershipId - The ID of the membership application.
 * @param {object} formData - The updated form data from the user.
 * @param {string} userId - The ID of the user submitting the changes.
 * @returns {Promise<void>}
 */
async function updateMainData(connection, membershipId, data) {
  const {
    associationName,
    associationNameEng,
    taxId,
    memberCount,
    associationEmail,
    associationPhone,
  } = data;

  const query = `
    UPDATE MemberRegist_AM_Main
    SET 
      company_name_th = ?, company_name_en = ?,
      tax_id = ?, number_of_member = ?,
      company_email = ?, company_phone = ?,
      status = 3, updated_at = NOW()
    WHERE id = ?
  `;

  await connection.query(query, [
    associationName,
    associationNameEng,
    taxId,
    memberCount,
    associationEmail,
    associationPhone,
    membershipId,
  ]);
}

async function updateAddress(connection, membershipId, data) {
  const { addressNumber, street, subDistrict, district, province, postalCode } = data;

  // For AM, we assume one primary address, so we update it.
  // If multiple addresses were possible, we would clear and re-insert.
  const query = `
    UPDATE MemberRegist_AM_Address
    SET
      address_number = ?, street = ?, sub_district = ?,
      district = ?, province = ?, postal_code = ?
    WHERE main_id = ? AND address_type = 'main'
  `;
  await connection.query(query, [
    addressNumber,
    street,
    subDistrict,
    district,
    province,
    postalCode,
    membershipId,
  ]);
}

async function updateRepresentatives(connection, membershipId, representatives) {
  if (!representatives || representatives.length === 0) return;

  await connection.query("DELETE FROM MemberRegist_AM_Representatives WHERE main_id = ?", [
    membershipId,
  ]);

  const repValues = representatives.map((rep, index) => [
    membershipId,
    rep.idCardNumber,
    rep.firstNameThai,
    rep.lastNameThai,
    rep.firstNameEnglish,
    rep.lastNameEnglish,
    rep.position,
    rep.email,
    rep.phone,
    index,
    rep.isPrimary,
  ]);

  const query = `
    INSERT INTO MemberRegist_AM_Representatives (
      main_id, id_card, first_name_th, last_name_th, 
      first_name_en, last_name_en, position, 
      email, phone, rep_order, is_primary
    ) VALUES ?
  `;
  await connection.query(query, [repValues]);
}

async function updateBusinessInfo(connection, membershipId, data) {
  const { businessTypes, otherBusinessType, products } = data;

  // Update Business Types
  await connection.query("DELETE FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?", [
    membershipId,
  ]);
  if (businessTypes && businessTypes.length > 0) {
    const businessTypeValues = businessTypes.map((type) => [membershipId, type]);
    await connection.query(
      "INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type) VALUES ?",
      [businessTypeValues],
    );
  }

  // Update Other Business Type
  await connection.query("DELETE FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?", [
    membershipId,
  ]);
  if (otherBusinessType) {
    await connection.query(
      "INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, detail) VALUES (?, ?)",
      [membershipId, otherBusinessType],
    );
  }

  // Update Products
  await connection.query("DELETE FROM MemberRegist_AM_Products WHERE main_id = ?", [membershipId]);
  if (products && products.length > 0) {
    const productValues = products.map((p) => [membershipId, p.nameTh, p.nameEn]);
    await connection.query(
      "INSERT INTO MemberRegist_AM_Products (main_id, product_name_th, product_name_en) VALUES ?",
      [productValues],
    );
  }
}

export async function updateAMApplication(
  membershipId,
  formData,
  userId,
  rejectionId,
  userComment,
) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    console.log(`Updating AM application ${membershipId} for user ${userId}`);

    // Update all relevant tables
    await updateMainData(connection, membershipId, formData);
    await updateAddress(connection, membershipId, formData);
    await updateRepresentatives(connection, membershipId, formData.representatives);
    await updateBusinessInfo(connection, membershipId, formData);

    // Log the resubmission event
    const commentText = userComment || "ผู้ใช้ส่งใบสมัครกลับมาเพื่อพิจารณาใหม่";
    await addComment(
      connection,
      "am",
      membershipId,
      userId,
      null, // No admin involved in user resubmission
      "user_resubmit",
      commentText,
      null, // No rejection reason
      JSON.stringify(formData), // Store all changes
    );

    // Mark rejection as processed
    await connection.execute(
      "UPDATE MemberRegist_Reject_DATA SET is_active = 0, resubmitted_at = NOW() WHERE id = ?",
      [rejectionId],
    );

    // Log user action
    await connection.execute(
      `INSERT INTO FTI_Portal_User_Logs (user_id, action, details) VALUES (?, 'resubmit_membership', ?)`,
      [userId, JSON.stringify({ membershipType: "am", membershipId, rejectionId })],
    );

    await connection.commit();
    console.log(`Successfully updated AM application ${membershipId}`);
  } catch (error) {
    await connection.rollback();
    console.error(`Error updating AM application ${membershipId}:`, error);
    throw new Error("Failed to update AM application.");
  } finally {
    connection.release();
  }
}
