import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import {
  beginTransaction,
  executeQuery,
  commitTransaction,
  rollbackTransaction,
  executeQueryWithoutTransaction,
} from "@/app/lib/db";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { sendMembershipConfirmationEmail } from "@/app/lib/postmark";

export async function POST(request) {
  let trx;
  let uploadResult = null;

  try {
    console.log("--- Received IC Membership Submission ---");

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const userId = session.user.id;

    let formData;
    try {
      formData = await request.formData();

      // Debug: Log all form data keys
      console.log("FormData Keys:");
      for (const [key] of formData.entries()) {
        console.log(`${key}: ${formData.get(key)}`);
      }
    } catch (formError) {
      console.error("FormData Error:", formError);
      return NextResponse.json(
        {
          error: "ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้",
          details: formError.message,
        },
        { status: 400 },
      );
    }

    trx = await beginTransaction();

    // Extract data from FormData
    const data = {};
    const files = {};
    const products = JSON.parse(formData.get("products") || "[]");

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else if (key !== "products") {
        data[key] = value;
      }
    }

    console.log("Extracted data:", data);
    console.log("Products:", products);

    // Server-side validation: Require authorized signatory position if names are provided
    try {
      const sigFirstTh =
        data.authorizedSignatoryFirstNameTh || data.authorizedSignatureFirstNameTh || "";
      const sigLastTh =
        data.authorizedSignatoryLastNameTh || data.authorizedSignatureLastNameTh || "";
      const sigFirstEn =
        data.authorizedSignatoryFirstNameEn || data.authorizedSignatureFirstNameEn || "";
      const sigLastEn =
        data.authorizedSignatoryLastNameEn || data.authorizedSignatureLastNameEn || "";
      const posTh = data.authorizedSignatoryPositionTh || data.authorizedSignaturePositionTh || "";
      const posEn = data.authorizedSignatoryPositionEn || data.authorizedSignaturePositionEn || "";

      const hasNames = (sigFirstTh + sigLastTh + sigFirstEn + sigLastEn).trim().length > 0;
      const hasPosition = (posTh && posTh.trim().length > 0) || (posEn && posEn.trim().length > 0);

      if (hasNames && !hasPosition) {
        await rollbackTransaction(trx);
        return NextResponse.json(
          {
            error: "กรุณาระบุตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทยหรือภาษาอังกฤษ)",
          },
          { status: 400 },
        );
      }
    } catch (vErr) {
      // If any unexpected error occurs during validation, proceed to normal flow
    }

    // Extract email, phone, and website from document delivery address (type 2)
    let userEmail = data.email || "";
    let userPhone = data.phone || "";
    let userPhoneExtension = data.phoneExtension || null;
    let userWebsite = data.website || "";

    // If using multi-address structure, get email, phone, and website from document delivery address (type 2)
    if (data.addresses) {
      try {
        const addresses = JSON.parse(data.addresses);
        const documentAddress = addresses["2"]; // Document delivery address
        if (documentAddress) {
          userEmail = documentAddress.email || userEmail;
          userPhone = documentAddress.phone || userPhone;
          userPhoneExtension = documentAddress.phoneExtension || userPhoneExtension;
          userWebsite = documentAddress.website || userWebsite;
        }
      } catch (error) {
        console.error("Error parsing addresses:", error);
      }
    }

    // Resolve prename fields from either camelCase or snake_case
    const prenameTh = data.prenameTh || data.prename_th || null;
    const prenameEn = data.prenameEn || data.prename_en || null;
    const prenameOther = data.prenameOther || data.prename_other || null;
    const prenameOtherEn = data.prenameOtherEn || data.prename_other_en || null;

    // ✅ FIX: เพิ่ม website และ prename ในตาราง Main
    const result = await executeQuery(
      trx,
      `INSERT INTO MemberRegist_IC_Main (
        user_id, id_card_number,
        prename_th, prename_en, prename_other, prename_other_en,
        first_name_th, last_name_th,
        first_name_en, last_name_en,
        phone, phone_extension, email, website, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        data.idCardNumber,
        prenameTh,
        prenameEn,
        prenameOther,
        prenameOtherEn,
        data.firstNameTh,
        data.lastNameTh,
        data.firstNameEn,
        data.lastNameEn,
        userPhone,
        userPhoneExtension,
        userEmail,
        userWebsite,
      ],
    );

    const icMemberId = result.insertId;
    console.log("Created IC Member ID:", icMemberId);
    console.log(
      "Saved main data - phone:",
      data.phone,
      "email:",
      data.email,
      "website:",
      data.website,
    );

    // Insert addresses (Multi-address support)
    console.log("🏠 [IC] Inserting address data...");
    if (data.addresses) {
      const addresses = JSON.parse(data.addresses);
      for (const [addressType, addressData] of Object.entries(addresses)) {
        if (addressData && Object.keys(addressData).length > 0) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_Address (
              main_id, address_number, building, moo, soi, street,
              sub_district, district, province, postal_code,
              phone, phone_extension, email, website, address_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              icMemberId,
              addressData.addressNumber || "",
              addressData.building || "",
              addressData.moo || "",
              addressData.soi || "",
              addressData.street || addressData.road || "",
              addressData.subDistrict || "",
              addressData.district || "",
              addressData.province || "",
              addressData.postalCode || "",
              addressData.phone || data.phone || "",
              addressData.phoneExtension || data.phoneExtension || "",
              addressData.email || data.email || "",
              addressData.website || data.website || "",
              addressType,
            ],
          );
        }
      }
    } else {
      // Fallback for old single address format
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_IC_Address (
          main_id, address_number, moo, soi, street,
          sub_district, district, province, postal_code,
          phone, phone_extension, email, website, address_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          icMemberId,
          data.addressNumber || "",
          data.moo || "",
          data.soi || "",
          data.street || data.road || "",
          data.subDistrict || "",
          data.district || "",
          data.province || "",
          data.postalCode || "",
          data.phone || "",
          data.phoneExtension || "",
          data.email || "",
          data.website || "",
          "2", // Default to document delivery address
        ],
      );
    }

    console.log("Address saved with street:", data.street || data.road);

    // Handle business types with correct mapping
    if (data.businessTypes) {
      try {
        const businessTypes = JSON.parse(data.businessTypes) || [];
        console.log("Business types received:", businessTypes);

        // Map from frontend IDs to database values
        const businessTypeMap = {
          manufacturer: "manufacturer",
          distributor: "distributor",
          importer: "importer",
          exporter: "exporter",
          service: "service_provider",
          other: "other",
        };

        for (const type of businessTypes) {
          if (type && businessTypeMap[type]) {
            const businessType = businessTypeMap[type];
            await executeQuery(
              trx,
              `INSERT INTO MemberRegist_IC_BusinessTypes (main_id, business_type) VALUES (?, ?)`,
              [icMemberId, businessType],
            );
            console.log("Saved business type:", businessType);
          }
        }
      } catch (error) {
        console.error("Error processing business types:", error);
      }
    }

    // Handle business category other
    if (data.businessCategoryOther) {
      try {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_IC_BusinessTypeOther (main_id, other_type) VALUES (?, ?)`,
          [icMemberId, data.businessCategoryOther],
        );
        console.log("Saved other business category:", data.businessCategoryOther);
      } catch (error) {
        console.error("Error processing business category other:", error);
      }
    }

    // Insert products with correct field mapping
    if (products && products.length > 0) {
      console.log("Inserting products:", products);
      for (const product of products) {
        const nameTh = product.nameTh || product.name_th || "";
        const nameEn = product.nameEn || product.name_en || "";

        if (nameTh.trim()) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_Products (main_id, name_th, name_en) VALUES (?, ?, ?)`,
            [icMemberId, nameTh, nameEn],
          );
          console.log("Saved product:", { nameTh, nameEn });
        }
      }
    }

    // Insert representative (now includes prename fields, including prename_other_en)
    if (data.representativeFirstNameTh) {
      const repPrenameTh = data.representativePrenameTh || data.representative_prename_th || null;
      const repPrenameEn = data.representativePrenameEn || data.representative_prename_en || null;
      const repPrenameOther =
        data.representativePrenameOther || data.representative_prename_other || null;
      const repPrenameOtherEn =
        data.representativePrenameOtherEn || data.representative_prename_other_en || null;
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_IC_Representatives (
          main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en,
          phone, phone_extension, email, position, rep_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          icMemberId,
          repPrenameTh,
          repPrenameEn,
          repPrenameOther,
          repPrenameOtherEn,
          data.representativeFirstNameTh || "",
          data.representativeLastNameTh || "",
          data.representativeFirstNameEn || "",
          data.representativeLastNameEn || "",
          data.representativePhone || "",
          data.representativePhoneExtension || null,
          data.representativeEmail || "",
          data.relationship || "",
          1,
        ],
      );
    }

    // Insert authorized signatory name (if provided)
    try {
      const sigFirstTh =
        data.authorizedSignatoryFirstNameTh || data.authorizedSignatureFirstNameTh || "";
      const sigLastTh =
        data.authorizedSignatoryLastNameTh || data.authorizedSignatureLastNameTh || "";
      const sigFirstEn =
        data.authorizedSignatoryFirstNameEn || data.authorizedSignatureFirstNameEn || "";
      const sigLastEn =
        data.authorizedSignatoryLastNameEn || data.authorizedSignatureLastNameEn || "";
      const sigPosTh =
        data.authorizedSignatoryPositionTh || data.authorizedSignaturePositionTh || null;
      const sigPosEn =
        data.authorizedSignatoryPositionEn || data.authorizedSignaturePositionEn || null;

      if ((sigFirstTh + sigLastTh + sigFirstEn + sigLastEn).trim()) {
        // Enforce at least one position (TH/EN)
        if (!((sigPosTh && String(sigPosTh).trim()) || (sigPosEn && String(sigPosEn).trim()))) {
          await rollbackTransaction(trx);
          return NextResponse.json(
            {
              error: "กรุณาระบุตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทยหรือภาษาอังกฤษ)",
            },
            { status: 400 },
          );
        }
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_IC_Signature_Name (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [icMemberId, sigFirstTh, sigLastTh, sigFirstEn, sigLastEn, sigPosTh, sigPosEn],
        );
        console.log("Saved authorized signatory name:", {
          sigFirstTh,
          sigLastTh,
          sigFirstEn,
          sigLastEn,
        });
      } else {
        console.log("No authorized signatory name provided. Skipping insert.");
      }
    } catch (sigErr) {
      console.error("Error inserting authorized signatory name:", sigErr.message);
    }

    // ✅ FIX: แก้ไขการบันทึก province chapters ให้ตรงกับ field ที่ส่งมา
    console.log("=== Processing Province Chapters ===");
    console.log("Raw provinceChapters data:", data.provinceChapters);

    if (data.provinceChapters) {
      try {
        const provinceChapters = JSON.parse(data.provinceChapters) || [];
        const provinceChapterNames = data.provinceChapterNames
          ? JSON.parse(data.provinceChapterNames)
          : [];
        console.log("Parsed province chapters:", provinceChapters);
        console.log("Parsed province chapter names:", provinceChapterNames);

        if (provinceChapters.length === 0) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
            [icMemberId, "000", "ไม่ระบุ"],
          );
          console.log("Saved default province chapter: 000");
        } else {
          for (let i = 0; i < provinceChapters.length; i++) {
            const chapterId = provinceChapters[i];
            const chapterName = provinceChapterNames[i] || "ไม่ระบุ";
            if (chapterId) {
              await executeQuery(
                trx,
                `INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
                [icMemberId, chapterId.toString(), chapterName],
              );
              console.log("Saved province chapter:", chapterId, "Name:", chapterName);
            }
          }
        }
      } catch (error) {
        console.error("Error processing province chapters:", error);
        console.error("Error details:", error.message);
      }
    } else {
      // ไม่มีข้อมูล province chapters ส่งมา
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
        [icMemberId, "000", "ไม่ระบุ"],
      );
      console.log("No province chapters data, saved default: 000");
    }

    // ✅ FIX: แก้ไขการบันทึก industry groups ให้ตรงกับ field ที่ส่งมา
    console.log("=== Processing Industry Groups ===");
    console.log("Raw industryGroups data:", data.industryGroups);
    console.log("Raw industryGroupNames data:", data.industryGroupNames);

    if (data.industryGroups) {
      try {
        const industryGroups = JSON.parse(data.industryGroups) || [];
        const industryGroupNames = data.industryGroupNames
          ? JSON.parse(data.industryGroupNames)
          : [];
        console.log("Parsed industry groups:", industryGroups);
        console.log("Parsed industry group names:", industryGroupNames);

        if (industryGroups.length === 0) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
            [icMemberId, "000", "ไม่ระบุ"],
          );
          console.log("Saved default industry group: 000");
        } else {
          for (let i = 0; i < industryGroups.length; i++) {
            const groupId = industryGroups[i];
            const groupName = industryGroupNames[i] || "ไม่ระบุ";
            if (groupId) {
              await executeQuery(
                trx,
                `INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
                [icMemberId, groupId.toString(), groupName],
              );
              console.log("Saved industry group:", groupId, "Name:", groupName);
            }
          }
        }
      } catch (error) {
        console.error("Error processing industry groups:", error);
        console.error("Error details:", error.message);
      }
    } else {
      // ไม่มีข้อมูล industry groups ส่งมา
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
        [icMemberId, "000", "ไม่ระบุ"],
      );
      console.log("No industry groups data, saved default: 000");
    }

    // ✅ Phase 2: Handle Document Uploads - Move Cloudinary upload to backend like OC
    console.log("=== Processing document uploads ===");
    const uploadedDocuments = {};
    // Process ID Card Document
    if (files.idCardDocument) {
      try {
        console.log("📤 Uploading ID card document:", files.idCardDocument.name);
        const buffer = await files.idCardDocument.arrayBuffer();
        const result = await uploadToCloudinary(
          Buffer.from(buffer),
          files.idCardDocument.name,
          "FTI_PORTAL_IC_member_DOC",
        );

        if (result.success) {
          uploadedDocuments.idCardDocument = {
            document_type: "idCardDocument",
            file_name: files.idCardDocument.name,
            file_path: result.url,
            file_size: files.idCardDocument.size,
            mime_type: files.idCardDocument.type,
            cloudinary_id: result.public_id,
            cloudinary_url: result.url,
          };
          console.log("✅ Successfully uploaded ID card:", result.url);
        } else {
          console.error("❌ Failed to upload ID card:", result.error);
        }
      } catch (uploadError) {
        console.error("❌ Error uploading ID card:", uploadError);
      }
    }

    // Process Authorized Signature Document
    if (files.authorizedSignature) {
      try {
        console.log("📤 Uploading authorized signature:", files.authorizedSignature.name);
        const buffer = await files.authorizedSignature.arrayBuffer();
        const result = await uploadToCloudinary(
          Buffer.from(buffer),
          files.authorizedSignature.name,
          "FTI_PORTAL_IC_member_DOC",
        );

        if (result.success) {
          uploadedDocuments.authorizedSignature = {
            document_type: "authorizedSignature",
            file_name: files.authorizedSignature.name,
            file_path: result.url,
            file_size: files.authorizedSignature.size,
            mime_type: files.authorizedSignature.type,
            cloudinary_id: result.public_id,
            cloudinary_url: result.url,
          };
          console.log("✅ Successfully uploaded authorized signature:", result.url);
        } else {
          console.error("❌ Failed to upload authorized signature:", result.error);
        }
      } catch (uploadError) {
        console.error("❌ Error uploading authorized signature:", uploadError);
      }
    }

    // Process Company Registration Document
    if (files.companyRegistrationDocument) {
      try {
        console.log(
          "📤 Uploading company registration document:",
          files.companyRegistrationDocument.name,
        );
        const buffer = await files.companyRegistrationDocument.arrayBuffer();
        const result = await uploadToCloudinary(
          Buffer.from(buffer),
          files.companyRegistrationDocument.name,
          "FTI_PORTAL_IC_member_DOC",
        );

        if (result.success) {
          uploadedDocuments.companyRegistrationDocument = {
            document_type: "companyRegistrationDocument",
            file_name: files.companyRegistrationDocument.name,
            file_path: result.url,
            file_size: files.companyRegistrationDocument.size,
            mime_type: files.companyRegistrationDocument.type,
            cloudinary_id: result.public_id,
            cloudinary_url: result.url,
          };
          console.log("✅ Successfully uploaded company registration:", result.url);
        } else {
          console.error("❌ Failed to upload company registration:", result.error);
        }
      } catch (uploadError) {
        console.error("❌ Error uploading company registration:", uploadError);
      }
    }

    // Process Tax Registration Document
    if (files.taxRegistrationDocument) {
      try {
        console.log("📤 Uploading tax registration document:", files.taxRegistrationDocument.name);
        const buffer = await files.taxRegistrationDocument.arrayBuffer();
        const result = await uploadToCloudinary(
          Buffer.from(buffer),
          files.taxRegistrationDocument.name,
          "FTI_PORTAL_IC_member_DOC",
        );

        if (result.success) {
          uploadedDocuments.taxRegistrationDocument = {
            document_type: "taxRegistrationDocument",
            file_name: files.taxRegistrationDocument.name,
            file_path: result.url,
            file_size: files.taxRegistrationDocument.size,
            mime_type: files.taxRegistrationDocument.type,
            cloudinary_id: result.public_id,
            cloudinary_url: result.url,
          };
          console.log("✅ Successfully uploaded tax registration:", result.url);
        } else {
          console.error("❌ Failed to upload tax registration:", result.error);
        }
      } catch (uploadError) {
        console.error("❌ Error uploading tax registration:", uploadError);
      }
    }

    // Store document metadata in database like OC
    console.log("=== Storing document metadata ===");
    for (const [key, document] of Object.entries(uploadedDocuments)) {
      try {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_IC_Documents (
            main_id, document_type, file_name, file_path, 
            file_size, mime_type, cloudinary_id, cloudinary_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            icMemberId,
            document.document_type,
            document.file_name,
            document.file_path,
            document.file_size,
            document.mime_type,
            document.cloudinary_id,
            document.cloudinary_url,
          ],
        );
        console.log(`✅ Document metadata stored: ${document.document_type}`);
      } catch (dbError) {
        console.error(`❌ Error storing document metadata: ${document.document_type}`, dbError);
      }
    }

    // Delete draft before committing transaction
    try {
      const idcardFromData = data.idCardNumber;

      if (idcardFromData) {
        const deleteResult = await executeQuery(
          trx,
          "DELETE FROM MemberRegist_IC_Draft WHERE idcard = ? AND user_id = ?",
          [idcardFromData, userId],
        );
        console.log(
          `✅ Draft deleted by idcard: ${idcardFromData}, affected rows: ${deleteResult.affectedRows || 0}`,
        );
      }
    } catch (draftError) {
      console.error("❌ Error deleting draft:", draftError.message);
      // Rollback if draft deletion fails
      await rollbackTransaction(trx);
      return NextResponse.json(
        {
          error: "เกิดข้อผิดพลาดในการลบข้อมูล Draft",
          details: draftError.message,
        },
        { status: 500 },
      );
    }

    await commitTransaction(trx);
    console.log("Transaction committed successfully");

    // Record user log (outside transaction)
    try {
      const logDetails = `ID CARD: ${data.idCardNumber} - ${data.firstNameTh} ${data.lastNameTh} (TH)`;

      await executeQueryWithoutTransaction(
        "INSERT INTO FTI_Portal_User_Logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "IC_membership_submit",
          logDetails,
          request.headers.get("x-forwarded-for") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ],
      );
      console.log("User log recorded successfully");
    } catch (logError) {
      console.error("Error recording user log:", logError.message);
    }

    // ส่งอีเมลแจ้งการสมัครสมาชิกสำเร็จ
    try {
      // ดึงข้อมูล user จาก FTI_Portal_User table
      const userQuery = `SELECT firstname, lastname, email FROM FTI_Portal_User WHERE id = ?`;
      const userResult = await executeQueryWithoutTransaction(userQuery, [userId]);

      if (userResult && userResult.length > 0) {
        const user = userResult[0];
        const userEmail = user.email;
        const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "ผู้สมัคร";
        const applicantName = userName; // IC เป็นบุคคลธรรมดา ใช้ชื่อผู้สมัครแทนชื่อบริษัท

        await sendMembershipConfirmationEmail(userEmail, userName, "IC", applicantName);
        console.log("✅ [IC] Membership confirmation email sent to:", userEmail);
      }
    } catch (emailError) {
      console.error("❌ [IC] Error sending membership confirmation email:", emailError);
      // ไม่ต้องหยุดการทำงานหากส่งอีเมลไม่สำเร็จ
    }

    return NextResponse.json({
      success: true,
      message: "ส่งแบบฟอร์มสมัครสมาชิกเรียบร้อยแล้ว",
      data: {
        memberId: icMemberId,
        document: {
          idCard: uploadResult ? uploadResult.url : null,
        },
      },
    });
  } catch (error) {
    console.error("Error submitting IC membership:", error);

    if (trx) {
      await rollbackTransaction(trx);
      console.log("Transaction rolled back due to error");
    }

    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
