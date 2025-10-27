import { getConnection } from "./db";
import { addComment } from "./membership";

export async function updateICApplication(
  membershipId,
  updatedData,
  userId,
  rejectionId,
  userComment,
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    const {
      main,
      address,
      representative,
      businessTypes,
      businessTypeOther,
      products,
      industryGroups,
      provinceChapters,
      documents,
      signatureName,
    } = updatedData;

    // 1. Update MemberRegist_IC_Main
    await connection.execute(
      `UPDATE MemberRegist_IC_Main 
       SET first_name_th = ?, last_name_th = ?, first_name_en = ?, last_name_en = ?, 
           phone = ?, email = ?, website = ?, status = 3 
       WHERE id = ?`,
      [
        main.firstNameTh,
        main.lastNameTh,
        main.firstNameEn,
        main.lastNameEn,
        main.phone,
        main.email,
        main.website,
        membershipId,
      ],
    );

    // 2. Update MemberRegist_IC_Address
    await connection.execute("DELETE FROM MemberRegist_IC_Address WHERE main_id = ?", [
      membershipId,
    ]);
    await connection.execute(
      `INSERT INTO MemberRegist_IC_Address (main_id, address_number, moo, soi, road, sub_district, district, province, postal_code, address_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        membershipId,
        address.addressNumber,
        address.moo,
        address.soi,
        address.road,
        address.subDistrict,
        address.district,
        address.province,
        address.postalCode,
        "2", // Defaulting to document delivery address
      ],
    );

    // 3. Update MemberRegist_IC_Representatives
    await connection.execute("DELETE FROM MemberRegist_IC_Representatives WHERE main_id = ?", [
      membershipId,
    ]);
    if (representative) {
      await connection.execute(
        `INSERT INTO MemberRegist_IC_Representatives (main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone, phone_extension, rep_order, is_primary) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          membershipId,
          representative.prenameTh || null,
          representative.prenameEn || null,
          representative.prenameOther || null,
          representative.prenameOtherEn || null,
          representative.firstNameThai,
          representative.lastNameThai,
          representative.firstNameEng || null,
          representative.lastNameEng || null,
          representative.position || null,
          representative.email || null,
          representative.phone || null,
          representative.phoneExtension || null,
          1, // rep_order always 1 for single representative
          representative.isPrimary ? 1 : 0,
        ],
      );
    }

    // 4. Update Business Information
    await connection.execute("DELETE FROM MemberRegist_IC_BusinessTypes WHERE main_id = ?", [
      membershipId,
    ]);
    if (businessTypes && businessTypes.length > 0) {
      for (const type of businessTypes) {
        await connection.execute(
          "INSERT INTO MemberRegist_IC_BusinessTypes (main_id, business_type) VALUES (?, ?)",
          [membershipId, type],
        );
      }
    }

    await connection.execute("DELETE FROM MemberRegist_IC_BusinessTypeOther WHERE main_id = ?", [
      membershipId,
    ]);
    if (businessTypeOther) {
      await connection.execute(
        "INSERT INTO MemberRegist_IC_BusinessTypeOther (main_id, other_type) VALUES (?, ?)",
        [membershipId, businessTypeOther],
      );
    }

    await connection.execute("DELETE FROM MemberRegist_IC_Products WHERE main_id = ?", [
      membershipId,
    ]);
    if (products && products.length > 0) {
      for (const product of products) {
        await connection.execute(
          "INSERT INTO MemberRegist_IC_Products (main_id, name_th, name_en) VALUES (?, ?, ?)",
          [membershipId, product.nameTh, product.nameEn],
        );
      }
    }

    // 5. Update Industry Groups and Provincial Chapters
    await connection.execute("DELETE FROM MemberRegist_IC_IndustryGroups WHERE main_id = ?", [
      membershipId,
    ]);
    if (industryGroups && industryGroups.length > 0) {
      for (const group of industryGroups) {
        await connection.execute(
          "INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)",
          [membershipId, group.id, group.name],
        );
      }
    }

    await connection.execute("DELETE FROM MemberRegist_IC_ProvinceChapters WHERE main_id = ?", [
      membershipId,
    ]);
    if (provinceChapters && provinceChapters.length > 0) {
      for (const chapter of provinceChapters) {
        await connection.execute(
          "INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)",
          [membershipId, chapter.id, chapter.name],
        );
      }
    }

    // 6. Update Documents
    await connection.execute("DELETE FROM MemberRegist_IC_Documents WHERE main_id = ?", [
      membershipId,
    ]);
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await connection.execute(
          `INSERT INTO MemberRegist_IC_Documents (
            main_id, document_type, file_name, file_path, 
            file_size, mime_type, cloudinary_id, cloudinary_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            membershipId,
            doc.document_type,
            doc.file_name,
            doc.file_path,
            doc.file_size,
            doc.mime_type,
            doc.cloudinary_id,
            doc.cloudinary_url,
          ],
        );
      }
    }

    // 7. Update Signature Name
    await connection.execute("DELETE FROM MemberRegist_IC_Signature_Name WHERE main_id = ?", [
      membershipId,
    ]);
    if (signatureName) {
      await connection.execute(
        `INSERT INTO MemberRegist_IC_Signature_Name (
          main_id, prename_th, prename_en, prename_other, prename_other_en,
          first_name_th, last_name_th, first_name_en, last_name_en,
          position_th, position_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          membershipId,
          signatureName.prename_th || null,
          signatureName.prename_en || null,
          signatureName.prename_other || null,
          signatureName.prename_other_en || null,
          signatureName.first_name_th || null,
          signatureName.last_name_th || null,
          signatureName.first_name_en || null,
          signatureName.last_name_en || null,
          signatureName.position_th || null,
          signatureName.position_en || null,
        ],
      );
    }

    // 8. Add a comment for resubmission
    const commentText = userComment || "Resubmitted the application for review.";
    await addComment(
      connection,
      "ic",
      membershipId,
      userId,
      null,
      "user_resubmission",
      commentText,
      null,
      JSON.stringify(updatedData),
    );

    // 7. Mark rejection as processed
    await connection.execute(
      "UPDATE MemberRegist_Reject_DATA SET is_active = 0, resubmitted_at = NOW() WHERE id = ?",
      [rejectionId],
    );

    // Log user action
    await connection.execute(
      `INSERT INTO FTI_Portal_User_Logs (user_id, action, details) VALUES (?, 'resubmit_membership', ?)`,
      [userId, JSON.stringify({ membershipType: "ic", membershipId, rejectionId })],
    );

    await connection.commit();
    console.log(`IC application ${membershipId} updated and resubmitted successfully.`);
    return { success: true, message: "Application updated successfully." };
  } catch (error) {
    await connection.rollback();
    console.error("Failed to update IC application:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
