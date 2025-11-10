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
import { createSnapshot } from "@/app/lib/history-snapshot";

// Helpers for numeric sanitization/validation
function sanitizeDecimal(
  raw,
  { field = "value", min = 0, max = Number.POSITIVE_INFINITY, scale = 2, allowNull = true } = {},
) {
  if (raw === undefined || raw === null || raw === "")
    return allowNull
      ? null
      : (() => {
          throw new Error(`${field} is required`);
        })();
  // Strip commas, spaces, currency symbols
  const cleaned = String(raw).replace(/[,\s฿]/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num)) throw new Error(`${field} is not a valid number`);
  // Round to scale
  const factor = Math.pow(10, scale);
  const rounded = Math.round(num * factor) / factor;
  if (rounded < min || rounded > max) throw new Error(`${field} out of allowed range`);
  return rounded;
}

function sanitizePercent(raw, { field = "percent", allowNull = true } = {}) {
  return sanitizeDecimal(raw, { field, min: 0, max: 100, scale: 2, allowNull });
}

export async function POST(request) {
  let trx;
  let signatoriesToInsert = []; // Declare at function level to make it accessible throughout

  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const userId = session.user.id;

    // ✅ ตรวจสอบ Content-Type และ FormData
    let formData;
    try {
      formData = await request.formData();
      console.log("📥 FormData received successfully");
    } catch (formError) {
      console.error("❌ Error parsing FormData:", formError);
      return NextResponse.json(
        {
          error: "ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้",
          details: formError.message,
        },
        { status: 400 },
      );
    }

    trx = await beginTransaction();
    console.log("🔄 Database transaction started");

    // Step 1: Extract all data and files from FormData
    const data = {};
    const files = {};
    const productionImages = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key.startsWith("productionImages[")) {
          productionImages.push(value);
        } else {
          files[key] = value;
        }
      } else {
        data[key] = value;
      }
    }

    if (productionImages.length > 0) {
      files["productionImages"] = productionImages;
    }

    console.log("📁 Files detected:", Object.keys(files));
    console.log("📄 Data fields:", Object.keys(data));

    // Debug: Check if signatories array is received
    if (data.signatories) {
      console.log("🔍 DEBUG - Signatories Array:");
      try {
        const signatories = JSON.parse(data.signatories);
        console.log("  Number of signatories:", signatories.length);
        signatories.forEach((sig, i) => {
          console.log(`  Signatory ${i + 1}:`, {
            prenameTh: sig.prenameTh,
            prenameOther: sig.prenameOther,
            firstNameTh: sig.firstNameTh,
            lastNameTh: sig.lastNameTh,
            positionTh: sig.positionTh,
          });
        });
      } catch (e) {
        console.error("  Error parsing signatories:", e);
      }
    } else {
      // Fallback: Check old single signatory fields
      console.log("🔍 DEBUG - Signature Name Fields (Legacy):");
      console.log("  authorizedSignatoryPrenameTh:", data.authorizedSignatoryPrenameTh);
      console.log("  authorizedSignatoryPrenameEn:", data.authorizedSignatoryPrenameEn);
      console.log("  authorizedSignatoryPrenameOther:", data.authorizedSignatoryPrenameOther);
      console.log("  authorizedSignatoryPrenameOtherEn:", data.authorizedSignatoryPrenameOtherEn);
      console.log("  authorizedSignatoryFirstNameTh:", data.authorizedSignatoryFirstNameTh);
      console.log("  authorizedSignatoryLastNameTh:", data.authorizedSignatoryLastNameTh);
    }

    // Validation: Require authorized signatory position if names are provided
    try {
      let hasSignatoryNames = false;
      let hasSignatoryPosition = false;

      // Check if we have new signatories array format
      if (data.signatories) {
        try {
          const signatories = JSON.parse(data.signatories);
          hasSignatoryNames = signatories.some(
            (sig) =>
              (sig.firstNameTh && sig.firstNameTh.trim()) ||
              (sig.lastNameTh && sig.lastNameTh.trim()),
          );
          hasSignatoryPosition = signatories.some(
            (sig) =>
              (sig.positionTh && sig.positionTh.trim()) ||
              (sig.positionEn && sig.positionEn.trim()),
          );
        } catch (e) {
          console.error("Error parsing signatories for validation:", e);
        }
      } else {
        // Legacy format: single signatory fields
        const sigFirstTh =
          data.authorizedSignatoryFirstNameTh || data.authorizedSignatureFirstNameTh || "";
        const sigLastTh =
          data.authorizedSignatoryLastNameTh || data.authorizedSignatureLastNameTh || "";
        const sigFirstEn =
          data.authorizedSignatoryFirstNameEn || data.authorizedSignatureFirstNameEn || "";
        const sigLastEn =
          data.authorizedSignatoryLastNameEn || data.authorizedSignatureLastNameEn || "";
        const posTh =
          data.authorizedSignatoryPositionTh || data.authorizedSignaturePositionTh || "";
        const posEn =
          data.authorizedSignatoryPositionEn || data.authorizedSignaturePositionEn || "";

        hasSignatoryNames = (sigFirstTh + sigLastTh + sigFirstEn + sigLastEn).trim().length > 0;
        hasSignatoryPosition =
          (posTh && posTh.trim().length > 0) || (posEn && posEn.trim().length > 0);
      }

      if (hasSignatoryNames && !hasSignatoryPosition) {
        await rollbackTransaction(trx);
        return NextResponse.json(
          {
            error: "กรุณาระบุตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทยหรือภาษาอังกฤษ)",
          },
          { status: 400 },
        );
      }
    } catch (e) {
      // proceed if validation parsing fails; subsequent insert guard will enforce again
    }

    // Step 2: Check for duplicate Tax ID (cross-table OC/AC/AM)
    const { taxId } = data;
    const [ocDup] = await executeQuery(
      trx,
      "SELECT status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1",
      [taxId],
    );
    const [acDup] = await executeQuery(
      trx,
      "SELECT status FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1",
      [taxId],
    );
    const [amDup] = await executeQuery(
      trx,
      `SELECT status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1`,
      [taxId],
    );

    if (ocDup || acDup || amDup) {
      await rollbackTransaction(trx);
      const isPending =
        (amDup && Number(amDup.status) === 0) ||
        (acDup && Number(acDup.status) === 0) ||
        (ocDup && Number(ocDup.status) === 0);
      const message = isPending
        ? `คำขอสมัครสมาชิกของท่านสำหรับเลขประจำตัวผู้เสียภาษี ${taxId} อยู่ระหว่างการพิจารณา`
        : `เลขประจำตัวผู้เสียภาษี ${taxId} นี้ได้เป็นสมาชิกแล้ว`;
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Step 3: Extract company email and phone from document delivery address (type 2)
    let companyEmail = data.companyEmail || "";
    let companyPhone = data.companyPhone || "";
    let companyPhoneExtension = data.companyPhoneExtension || null;

    // If using multi-address structure, get email and phone from document delivery address (type 2)
    if (data.addresses) {
      try {
        const addresses = JSON.parse(data.addresses);
        const documentAddress = addresses["2"]; // Document delivery address
        if (documentAddress) {
          // Support dynamic keys like email-2, phone-2, phoneExtension-2 with fallback to generic keys
          companyEmail = documentAddress["email-2"] || documentAddress.email || companyEmail;
          companyPhone = documentAddress["phone-2"] || documentAddress.phone || companyPhone;
          companyPhoneExtension =
            documentAddress["phoneExtension-2"] ||
            documentAddress.phoneExtension ||
            companyPhoneExtension;
        }
      } catch (error) {
        console.error("Error parsing addresses:", error);
      }
    }

    // Step 4: Sanitize numerics and Insert Main Data
    // Sanitize DECIMAL fields; map errors to 400 Bad Request
    let registeredCapital = null;
    let productionCapacityValue = null;
    let salesDomestic = null;
    let salesExport = null;
    let revenueLastYear = null;
    let revenuePreviousYear = null;
    let shareholderThaiPercent = null;
    let shareholderForeignPercent = null;

    try {
      registeredCapital = sanitizeDecimal(data.registeredCapital, {
        field: "registeredCapital",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      productionCapacityValue = sanitizeDecimal(data.productionCapacityValue, {
        field: "productionCapacityValue",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      salesDomestic = sanitizeDecimal(data.salesDomestic, {
        field: "salesDomestic",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      salesExport = sanitizeDecimal(data.salesExport, {
        field: "salesExport",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      revenueLastYear = sanitizeDecimal(data.revenueLastYear, {
        field: "revenueLastYear",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      revenuePreviousYear = sanitizeDecimal(data.revenuePreviousYear, {
        field: "revenuePreviousYear",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      shareholderThaiPercent = sanitizePercent(data.shareholderThaiPercent, {
        field: "shareholderThaiPercent",
        allowNull: true,
      });
      shareholderForeignPercent = sanitizePercent(data.shareholderForeignPercent, {
        field: "shareholderForeignPercent",
        allowNull: true,
      });
    } catch (numErr) {
      await rollbackTransaction(trx);
      return NextResponse.json(
        { error: "ข้อมูลตัวเลขไม่ถูกต้อง", details: String(numErr.message) },
        { status: 400 },
      );
    }

    const mainResult = await executeQuery(
      trx,
      `INSERT INTO MemberRegist_OC_Main (
        user_id, company_name_th, company_name_en, tax_id, company_email, company_phone, company_phone_extension,
        factory_type, number_of_employees, registered_capital, production_capacity_value, 
        production_capacity_unit, sales_domestic, sales_export, revenue_last_year, revenue_previous_year, shareholder_thai_percent, 
        shareholder_foreign_percent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        userId,
        data.companyName,
        data.companyNameEng,
        data.taxId,
        companyEmail,
        companyPhone,
        companyPhoneExtension,
        data.factoryType,
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
        registeredCapital,
        productionCapacityValue,
        data.productionCapacityUnit || null,
        salesDomestic,
        salesExport,
        revenueLastYear,
        revenuePreviousYear,
        shareholderThaiPercent,
        shareholderForeignPercent,
      ],
    );
    const mainId = mainResult.insertId;
    console.log("✅ Main record created with ID:", mainId);

    // Step 5: Insert Addresses (3 types)
    if (data.addresses) {
      const addresses = JSON.parse(data.addresses);

      // Insert all three address types
      for (const addressType of ["1", "2", "3"]) {
        const address = addresses[addressType];
        if (address) {
          // Normalize dynamic contact keys to generic fields per address type
          const phoneKey = `phone-${addressType}`;
          const phoneExtKey = `phoneExtension-${addressType}`;
          const emailKey = `email-${addressType}`;
          const websiteKey = `website-${addressType}`;

          const phoneVal = address[phoneKey] || address.phone || "";
          const phoneExtVal = address[phoneExtKey] || address.phoneExtension || "";
          const emailVal = address[emailKey] || address.email || "";
          const websiteVal = address[websiteKey] || address.website || "";

          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_OC_Address (
              main_id, address_number, building, moo, soi, street, 
              sub_district, district, province, postal_code, 
              phone, phone_extension, email, website, address_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              mainId,
              address.addressNumber || "",
              address.building || "",
              address.moo || "",
              address.soi || "",
              address.street || "",
              address.subDistrict || "",
              address.district || "",
              address.province || "",
              address.postalCode || "",
              phoneVal,
              phoneExtVal,
              emailVal,
              websiteVal,
              addressType,
            ],
          );
        }
      }
    } else {
      // Fallback for old single address format
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_OC_Address (
          main_id, address_number, building, moo, soi, street, 
          sub_district, district, province, postal_code, 
          phone, phone_extension, email, website, address_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId,
          data.addressNumber || "",
          data.building || "",
          data.moo || "",
          data.soi || "",
          data.street || "",
          data.subDistrict || "",
          data.district || "",
          data.province || "",
          data.postalCode || "",
          data.companyPhone || "",
          data.companyPhoneExtension || "",
          data.companyEmail || "",
          data.companyWebsite || "",
          "2", // Default to document delivery address
        ],
      );
    }

    // Step 5: Insert Contact Persons (with type support)
    if (data.contactPersons) {
      const contactPersons = JSON.parse(data.contactPersons);
      // English names are now optional for contact persons - no validation required
      for (let index = 0; index < contactPersons.length; index++) {
        const contact = contactPersons[index];
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_ContactPerson (
            main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId,
            contact.prenameTh || null,
            contact.prenameEn || "",
            contact.prenameOther || null,
            contact.prenameOtherEn || null,
            contact.firstNameTh || null,
            contact.lastNameTh || null,
            contact.firstNameEn || "",
            contact.lastNameEn || "",
            contact.position || null,
            contact.email || null,
            contact.phone || null,
            contact.phoneExtension || null,
            contact.typeContactId || "MAIN",
            contact.typeContactName || "ผู้ประสานงานหลัก",
            contact.typeContactOtherDetail || null,
          ],
        );
      }
    } else {
      // Fallback for old single contact person format
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_OC_ContactPerson (
          main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, 
          position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId,
          null,
          "",
          null,
          null,
          data.contactPersonFirstName || null,
          data.contactPersonLastName || null,
          data.contactPersonFirstNameEng || "",
          data.contactPersonLastNameEng || "",
          data.contactPersonPosition || null,
          data.contactPersonEmail || null,
          data.contactPersonPhone || null,
          data.contactPersonPhoneExtension || null,
          "MAIN",
          "ผู้ประสานงานหลัก",
          null,
        ],
      );
    }

    // Step 6: Insert Representatives
    if (data.representatives) {
      const representatives = JSON.parse(data.representatives);
      console.log("🔍 DEBUG OC Representatives - Raw data:", representatives);

      // Enforce English names for all representatives
      for (let i = 0; i < representatives.length; i++) {
        const r = representatives[i] || {};
        console.log(`🔍 DEBUG OC Representative ${i + 1}:`, r);
        console.log(`🔍 Available fields:`, Object.keys(r));

        const firstTh = r.firstNameThai || r.firstNameTh || r.first_name_th;
        const lastTh = r.lastNameThai || r.lastNameTh || r.last_name_th;
        const firstEn = r.firstNameEn || r.first_name_en || r.firstNameEnglish; // Check firstNameEn first (what form sends)
        const lastEn = r.lastNameEn || r.last_name_en || r.lastNameEnglish; // Check lastNameEn first (what form sends)
        const prenameEn = r.prenameEn || r.prename_en; // Check prenameEn

        console.log(
          `🔍 Mapped fields - prenameEn: ${prenameEn}, firstTh: ${firstTh}, lastTh: ${lastTh}, firstEn: ${firstEn}, lastEn: ${lastEn}`,
        );

        // Validate Thai names (required)
        if (!firstTh || !String(firstTh).trim() || !lastTh || !String(lastTh).trim()) {
          await rollbackTransaction(trx);
          return NextResponse.json(
            { error: `กรุณากรอกชื่อ-นามสกุลภาษาไทยของผู้แทนคนที่ ${i + 1}` },
            { status: 400 },
          );
        }

        // English names are now optional - no validation required
      }
      for (let index = 0; index < representatives.length; index++) {
        const rep = representatives[index];

        console.log(`🔍 INSERTING Rep ${index + 1}:`, {
          prenameEn: rep.prenameEn || rep.prename_en,
          firstNameEn: rep.firstNameEn || rep.first_name_en || rep.firstNameEnglish,
          lastNameEn: rep.lastNameEn || rep.last_name_en || rep.lastNameEnglish,
          firstNameThai: rep.firstNameThai || rep.firstNameTh || rep.first_name_th,
          lastNameThai: rep.lastNameThai || rep.lastNameTh || rep.last_name_th,
        });

        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_Representatives (
            main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, phone_extension, is_primary, rep_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId,
            rep.prenameTh || rep.prename_th || null,
            rep.prenameEn || rep.prename_en || "",
            rep.prenameOther || rep.prename_other || null,
            rep.prenameOtherEn || rep.prename_other_en || null,
            rep.firstNameThai || rep.firstNameTh || rep.first_name_th || null,
            rep.lastNameThai || rep.lastNameTh || rep.last_name_th || null,
            rep.firstNameEn || rep.first_name_en || rep.firstNameEnglish || "",
            rep.lastNameEn || rep.last_name_en || rep.lastNameEnglish || "",
            rep.position || null,
            rep.email || null,
            rep.phone || null,
            rep.phoneExtension || rep.phone_extension || null,
            rep.isPrimary,
            index + 1,
          ],
        );
      }
    }

    // Helper function to parse and ensure data is an array
    const parseAndEnsureArray = (input) => {
      if (!input) return [];
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [input];
      }
    };

    // Step 7: Insert Business Types
    if (data.businessTypes) {
      const businessTypesObject = JSON.parse(data.businessTypes);
      const selectedTypes = Object.keys(businessTypesObject).filter(
        (key) => businessTypesObject[key] === true,
      );

      for (const type of selectedTypes) {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_BusinessTypes (main_id, business_type) VALUES (?, ?);`,
          [mainId, type],
        );
      }
    }
    if (data.otherBusinessTypeDetail) {
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_OC_BusinessTypeOther (main_id, detail) VALUES (?, ?);`,
        [mainId, data.otherBusinessTypeDetail],
      );
    }

    // Step 8: Insert Products
    const products = parseAndEnsureArray(data.products);
    if (products.length > 0) {
      for (const product of products) {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`,
          [mainId, product.nameTh, product.nameEn],
        );
      }
    } else {
      console.log("No products provided, skipping insertion");
    }

    // Step 9: Insert Industry Groups
    console.log("Inserting industry groups...");
    console.log("Raw industrialGroupIds data:", data.industrialGroupIds);
    console.log("Raw industrialGroupNames data:", data.industrialGroupNames);

    const industrialGroupIds = parseAndEnsureArray(data.industrialGroupIds);
    const industrialGroupNames = parseAndEnsureArray(data.industrialGroupNames);

    if (industrialGroupIds.length > 0) {
      for (let i = 0; i < industrialGroupIds.length; i++) {
        const groupId = industrialGroupIds[i];
        const groupName = industrialGroupNames[i] || "ไม่ระบุ";
        console.log(`Inserting industrial group ID: ${groupId}, Name: ${groupName}`);
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`,
          [mainId, groupId, groupName],
        );
      }
      console.log(`Inserted ${industrialGroupIds.length} industry groups with names`);
    } else {
      console.log("No industrial groups selected, skipping insertion");
    }

    // Step 10: Insert Province Chapters
    console.log("Inserting provincial chapters...");
    console.log("Raw provincialChapterIds data:", data.provincialChapterIds);
    console.log("Raw provincialChapterNames data:", data.provincialChapterNames);

    const provincialChapterIds = parseAndEnsureArray(data.provincialChapterIds);
    const provincialChapterNames = parseAndEnsureArray(data.provincialChapterNames);

    if (provincialChapterIds.length > 0) {
      for (let i = 0; i < provincialChapterIds.length; i++) {
        const chapterId = provincialChapterIds[i];
        const chapterName = provincialChapterNames[i] || "ไม่ระบุ";
        console.log(`Inserting provincial chapter ID: ${chapterId}, Name: ${chapterName}`);
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`,
          [mainId, chapterId, chapterName],
        );
      }
      console.log(`Inserted ${provincialChapterIds.length} provincial chapters with names`);
    } else {
      console.log("No provincial chapters selected, skipping insertion");
    }

    // Step 11: Insert Authorized Signatory Names
    console.log("Inserting authorized signatory names...");

    // Check if we have new signatories array or old single signatory fields
    if (data.signatories) {
      // New format: signatories array
      try {
        signatoriesToInsert = JSON.parse(data.signatories);
        console.log("✅ Using signatories array with", signatoriesToInsert.length, "signatories");
      } catch (e) {
        console.error("Error parsing signatories array:", e);
        signatoriesToInsert = [];
      }
    } else {
      // Legacy format: single signatory fields
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

      if (sigFirstTh && sigLastTh) {
        signatoriesToInsert = [
          {
            prenameTh: data.authorizedSignatoryPrenameTh || null,
            prenameEn: data.authorizedSignatoryPrenameEn || "",
            prenameOther: data.authorizedSignatoryPrenameOther || null,
            prenameOtherEn: data.authorizedSignatoryPrenameOtherEn || null,
            firstNameTh: sigFirstTh,
            lastNameTh: sigLastTh,
            firstNameEn: sigFirstEn || "",
            lastNameEn: sigLastEn || "",
            positionTh: posTh || null,
            positionEn: posEn || "",
          },
        ];
        console.log("✅ Using legacy single signatory format");
      }
    }

    // Insert all signatories
    if (signatoriesToInsert.length > 0) {
      for (const signatory of signatoriesToInsert) {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_OC_Signature_Name (
            main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId,
            signatory.prenameTh || null,
            signatory.prenameEn || "",
            signatory.prenameOther || null,
            signatory.prenameOtherEn || null,
            signatory.firstNameTh || null,
            signatory.lastNameTh || null,
            signatory.firstNameEn || "",
            signatory.lastNameEn || "",
            signatory.positionTh && String(signatory.positionTh).trim()
              ? signatory.positionTh
              : null,
            signatory.positionEn && String(signatory.positionEn).trim() ? signatory.positionEn : "",
          ],
        );
      }
      console.log(`✅ Inserted ${signatoriesToInsert.length} authorized signatory(ies)`);
    } else {
      console.log("⚠️ No authorized signatory data provided, skipping signature name insertion");
    }

    // Step 12: Handle Document Uploads
    console.log("Processing document uploads...");
    const uploadedDocuments = {};

    // Part 1: Upload files to Cloudinary
    for (const fieldName of Object.keys(files)) {
      const fileValue = files[fieldName];

      // ✅ จัดการ productionImages (multiple files)
      if (fieldName === "productionImages" && Array.isArray(fileValue)) {
        console.log(`📷 Processing ${fileValue.length} production images`);

        for (let index = 0; index < fileValue.length; index++) {
          const file = fileValue[index];
          try {
            console.log(`📤 Uploading production image ${index + 1}: ${file.name}`);
            const buffer = await file.arrayBuffer();
            const result = await uploadToCloudinary(
              Buffer.from(buffer),
              file.name,
              "FTI_PORTAL_OC_member_DOC",
            );

            // ✅ ตรวจสอบผลลัพธ์การอัปโหลด
            if (result.success) {
              const documentKey = `productionImages_${index}`;
              uploadedDocuments[documentKey] = {
                document_type: "productionImages",
                file_name: file.name,
                file_path: result.url,
                file_size: file.size,
                mime_type: file.type,
                cloudinary_id: result.public_id,
                cloudinary_url: result.url,
              };
              console.log(`✅ Successfully uploaded production image ${index + 1}: ${result.url}`);
            } else {
              console.error(`❌ Failed to upload production image ${index + 1}:`, result.error);
            }
          } catch (uploadError) {
            console.error(`❌ Error uploading production image ${index + 1}:`, uploadError);
          }
        }
      }
      // ✅ จัดการ authorizedSignatures (multiple files)
      else if (fieldName.startsWith("authorizedSignatures[") && fileValue instanceof File) {
        // Extract index from field name like "authorizedSignatures[0]"
        const indexMatch = fieldName.match(/authorizedSignatures\[(\d+)\]/);
        if (indexMatch) {
          const signatoryIndex = parseInt(indexMatch[1], 10);
          try {
            console.log(
              `📤 Uploading signature for signatory ${signatoryIndex + 1}: ${fileValue.name}`,
            );
            const buffer = await fileValue.arrayBuffer();
            const result = await uploadToCloudinary(
              Buffer.from(buffer),
              fileValue.name,
              "FTI_PORTAL_OC_member_DOC",
            );

            // ✅ ตรวจสอบผลลัพธ์การอัปโหลด
            if (result.success) {
              const documentKey = `authorizedSignatures_${signatoryIndex}`;
              uploadedDocuments[documentKey] = {
                document_type: "authorizedSignatures",
                file_name: fileValue.name,
                file_path: result.url,
                file_size: fileValue.size,
                mime_type: fileValue.type,
                cloudinary_id: result.public_id,
                cloudinary_url: result.url,
                signatory_index: signatoryIndex, // Track which signatory this belongs to
              };
              console.log(
                `✅ Successfully uploaded signature for signatory ${signatoryIndex + 1}: ${result.url}`,
              );
            } else {
              console.error(
                `❌ Failed to upload signature for signatory ${signatoryIndex + 1}:`,
                result.error,
              );
            }
          } catch (uploadError) {
            console.error(
              `❌ Error uploading signature for signatory ${signatoryIndex + 1}:`,
              uploadError,
            );
          }
        }
      }
      // ✅ จัดการไฟล์เดี่ยว
      else if (fileValue instanceof File) {
        try {
          console.log(`📤 Uploading ${fieldName}: ${fileValue.name}`);
          const buffer = await fileValue.arrayBuffer();
          const result = await uploadToCloudinary(
            Buffer.from(buffer),
            fileValue.name,
            "FTI_PORTAL_OC_member_DOC",
          );

          // ✅ ตรวจสอบผลลัพธ์การอัปโหลด
          if (result.success) {
            uploadedDocuments[fieldName] = {
              document_type: fieldName,
              file_name: fileValue.name,
              file_path: result.url,
              file_size: fileValue.size,
              mime_type: fileValue.type,
              cloudinary_id: result.public_id,
              cloudinary_url: result.url,
            };
            console.log(`✅ Successfully uploaded ${fieldName}: ${result.url}`);
          } else {
            console.error(`❌ Failed to upload ${fieldName}:`, result.error);
          }
        } catch (uploadError) {
          console.error(`❌ Error uploading file for ${fieldName}:`, uploadError);
        }
      }
    }

    // Step 12: Add status log
    await executeQuery(
      trx,
      `INSERT INTO MemberRegist_OC_StatusLogs (main_id, status, note, created_by) VALUES (?, ?, ?, ?);`,
      [
        mainId,
        0, // Pending approval
        "สมัครสมาชิกใหม่",
        userId,
      ],
    );

    await commitTransaction(trx);
    console.log("🎉 [OC API] Transaction committed successfully");

    // ✅ Insert uploaded document info into the database AFTER commit (ensure FK visibility)
    console.log(
      `💾 Inserting ${Object.keys(uploadedDocuments).length} documents into database (post-commit)`,
    );

    // Get signature name IDs for linking signature files
    const signatureNameIds = [];
    if (signatoriesToInsert.length > 0) {
      try {
        const signatureRecords = await executeQueryWithoutTransaction(
          `SELECT id, prename_th, first_name_th, last_name_th 
           FROM MemberRegist_OC_Signature_Name 
           WHERE main_id = ? 
           ORDER BY id`,
          [mainId],
        );

        // Map signature records by their order
        signatoriesToInsert.forEach((signatory, index) => {
          const matchingRecord = signatureRecords.find((record) => {
            // Match by name fields
            return (
              record.prename_th === signatory.prenameTh &&
              record.first_name_th === signatory.firstNameTh &&
              record.last_name_th === signatory.lastNameTh
            );
          });

          if (matchingRecord) {
            signatureNameIds[index] = matchingRecord.id;
          }
        });

        console.log("🔗 Signature name IDs for linking:", signatureNameIds);
      } catch (error) {
        console.error("❌ Error fetching signature name IDs:", error);
      }
    }

    for (const documentKey in uploadedDocuments) {
      const doc = uploadedDocuments[documentKey];
      try {
        let signatureNameId = null;

        // Link signature files to signature names
        if (doc.document_type === "authorizedSignatures" && doc.signatory_index !== undefined) {
          signatureNameId = signatureNameIds[doc.signatory_index] || null;
          console.log(
            `🔗 Linking signature file for signatory ${doc.signatory_index + 1} to signature_name_id: ${signatureNameId}`,
          );
        }

        const insertResult = await executeQueryWithoutTransaction(
          `INSERT INTO MemberRegist_OC_Documents 
            (main_id, document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url, signature_name_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId,
            doc.document_type,
            doc.file_name,
            doc.file_path,
            doc.file_size,
            doc.mime_type,
            doc.cloudinary_id,
            doc.cloudinary_url,
            signatureNameId,
          ],
        );
        console.log(
          `✅ Document inserted: ${doc.document_type} - ID: ${insertResult.insertId}${signatureNameId ? ` (linked to signature_name_id: ${signatureNameId})` : ""}`,
        );
      } catch (dbError) {
        console.error(`❌ Error inserting document ${documentKey} into database:`, dbError);
      }
    }

    // บันทึก user log สำหรับการสมัครสมาชิก OC
    try {
      const logDetails = `TAX_ID: ${data.taxId} - ${data.companyName}`;
      await executeQueryWithoutTransaction(
        "INSERT INTO FTI_Portal_User_Logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "OC_membership_submit",
          logDetails,
          request.headers.get("x-forwarded-for") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ],
      );
      console.log("✅ [OC API] User log recorded successfully");
    } catch (logError) {
      console.error("❌ [OC API] Error recording user log:", logError.message);
    }

    // ลบ draft หลังจากสมัครสำเร็จ
    const taxIdFromData = data.taxId;

    console.log("🗑️ [OC API] Attempting to delete draft...");
    console.log("🗑️ [OC API] taxId from data:", taxIdFromData);

    try {
      let deletedRows = 0;

      if (taxIdFromData) {
        // ลบ draft ทั้งหมดที่ใช้ tax id เดียวกันในทุกประเภทสมาชิกและทุก user (หลังจากส่งข้อมูลสำเร็จ)
        const allMemberTypes = ["ic", "oc", "am", "ac"];

        for (const memberType of allMemberTypes) {
          const deleteDraftQuery =
            memberType === "ic"
              ? `DELETE FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE idcard = ? AND status = 3`
              : `DELETE FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE tax_id = ? AND status = 3`;

          const deleteResult = await executeQueryWithoutTransaction(deleteDraftQuery, [
            taxIdFromData,
          ]);
          const affectedRows = deleteResult.affectedRows || 0;
          deletedRows += affectedRows;
          console.log(
            `✅ [OC API] Deleted ALL drafts for ${memberType} by tax_id: ${taxIdFromData}, affected rows: ${affectedRows} (all users)`,
          );
        }
      } else {
        console.warn("⚠️ [OC API] No taxId provided, cannot delete draft");
      }
    } catch (draftError) {
      console.error("❌ [OC API] Error deleting draft:", draftError.message);
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
        const companyName = data.companyName || "บริษัท";

        await sendMembershipConfirmationEmail(userEmail, userName, "OC", companyName);
        console.log("✅ Membership confirmation email sent to:", userEmail);
      }
    } catch (emailError) {
      console.error("❌ Error sending membership confirmation email:", emailError);
      // ไม่ต้องหยุดการทำงานหากส่งอีเมลไม่สำเร็จ
    }

    console.log("🎉 OC Membership submission completed successfully");

    // Create history snapshot for initial submission
    try {
      console.log(`📸 Creating initial submission snapshot for OC ${mainId}`);
      const historyId = await createSnapshot(trx, "oc", mainId, "manual", userId);
      console.log(`✅ OC initial submission snapshot created: ${historyId}`);
    } catch (snapshotError) {
      console.error("❌ Error creating history snapshot:", snapshotError);
      // Don't fail the submission if snapshot creation fails
    }

    return NextResponse.json(
      {
        message: "การสมัครสมาชิก OC สำเร็จ",
        registrationId: mainId,
        documentsUploaded: Object.keys(uploadedDocuments).length,
        timestamp: new Date().toISOString(),
      },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ OC Membership Submission Error:", error);

    // ✅ Rollback transaction if it exists
    if (trx) {
      try {
        await rollbackTransaction(trx);
        console.log("🔄 Transaction rolled back successfully");
      } catch (rollbackError) {
        console.error("❌ Rollback error:", rollbackError);
      }
    }

    // ✅ ส่ง JSON response ที่ถูกต้องเสมอ
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
