import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import {
  query,
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  executeQueryWithoutTransaction,
} from "@/app/lib/db";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { sendMembershipConfirmationEmail } from "@/app/lib/postmark";

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
  const cleaned = String(raw).replace(/[\,\s฿]/g, "");
  const num = Number(cleaned);
  if (!Number.isFinite(num)) throw new Error(`${field} is not a valid number`);
  const factor = Math.pow(10, scale);
  const rounded = Math.round(num * factor) / factor;
  if (rounded < min || rounded > max) throw new Error(`${field} out of allowed range`);
  return rounded;
}
function sanitizePercent(raw, { field = "percent", allowNull = true } = {}) {
  return sanitizeDecimal(raw, { field, min: 0, max: 100, scale: 2, allowNull });
}

// Ensure Node.js runtime (required for Buffer and other Node APIs)
export const runtime = "nodejs";

export async function GET(request, { params }) {
  // ... existing code ...
}

export async function POST(request) {
  let trx;

  try {
    console.log("🚀 [AM Membership Submit] Starting submission process...");

    // ตรวจสอบ session
    const session = await getSession();
    if (!session || !session.user) {
      console.log("❌ [AM Membership Submit] Unauthorized access attempt");
      return NextResponse.json(
        {
          success: false,
          error: "ไม่ได้รับอนุญาต",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    console.log("👤 [AM Membership Submit] User ID:", userId);

    // อนุญาตให้ผู้ใช้ส่งใบสมัคร AM ได้หลายครั้ง (ไม่บล็อคตาม user_id)
    // หมายเหตุ: ยังกันซ้ำโดยใช้เลขประจำตัวผู้เสียภาษีด้านล่าง

    // Parse form data
    const formData = await request.formData();
    console.log("📋 [AM Membership Submit] Form data received");

    // Extract basic data
    const associationName = formData.get("associationName");
    const associationNameEn =
      formData.get("associationNameEn") || formData.get("associationNameEng");
    const taxId = formData.get("taxId");
    const memberCount = formData.get("memberCount");
    const numberOfEmployees = formData.get("numberOfEmployees");
    const registeredCapitalRaw = formData.get("registeredCapital");
    const productionCapacityValueRaw = formData.get("productionCapacityValue");

    const productionCapacityUnit = formData.get("productionCapacityUnit");
    const salesDomesticRaw = formData.get("salesDomestic");
    const salesExportRaw = formData.get("salesExport");
    const revenueLastYearRaw = formData.get("revenueLastYear");
    const revenuePreviousYearRaw = formData.get("revenuePreviousYear");
    const shareholderThaiPercentRaw = formData.get("shareholderThaiPercent");
    const shareholderForeignPercentRaw = formData.get("shareholderForeignPercent");

    const factoryType = formData.get("factoryType");

    // Extract authorized signatory name/prename fields
    const authorizedSignatoryFirstNameTh = formData.get("authorizedSignatoryFirstNameTh");
    const authorizedSignatoryLastNameTh = formData.get("authorizedSignatoryLastNameTh");
    const authorizedSignatoryFirstNameEn = formData.get("authorizedSignatoryFirstNameEn");
    const authorizedSignatoryLastNameEn = formData.get("authorizedSignatoryLastNameEn");
    const authorizedSignatoryPositionTh = formData.get("authorizedSignatoryPositionTh");
    const authorizedSignatoryPositionEn = formData.get("authorizedSignatoryPositionEn");
    const authorizedSignatoryPrenameTh = formData.get("authorizedSignatoryPrenameTh");
    const authorizedSignatoryPrenameEn = formData.get("authorizedSignatoryPrenameEn");
    const authorizedSignatoryPrenameOther = formData.get("authorizedSignatoryPrenameOther");
    const authorizedSignatoryPrenameOtherEn = formData.get("authorizedSignatoryPrenameOtherEn");

    // Small helper to convert undefined to SQL NULL
    const toNull = (v) => (v === undefined ? null : v);

    // Helper for English fields - return empty string instead of null to satisfy DB constraints
    const toEmptyString = (v) => (v === undefined || v === null ? "" : v);

    // Validation: Require authorized signatory position if names are provided
    try {
      const hasNames =
        [
          authorizedSignatoryFirstNameTh,
          authorizedSignatoryLastNameTh,
          authorizedSignatoryFirstNameEn,
          authorizedSignatoryLastNameEn,
        ]
          .filter(Boolean)
          .join("")
          .trim().length > 0;
      const hasPosition =
        (authorizedSignatoryPositionTh && authorizedSignatoryPositionTh.trim().length > 0) ||
        (authorizedSignatoryPositionEn && authorizedSignatoryPositionEn.trim().length > 0);
      if (hasNames && !hasPosition) {
        return NextResponse.json(
          {
            success: false,
            error: "กรุณาระบุตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทยหรือภาษาอังกฤษ)",
          },
          { status: 400 },
        );
      }
    } catch (e) {
      // proceed; safeguard exists before DB insert
    }

    // Validate required fields
    if (!associationName || !taxId || !memberCount) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
        },
        { status: 400 },
      );
    }

    // ตรวจสอบเลขประจำตัวผู้เสียภาษีซ้ำ (เช็คข้ามตาราง AM/AC/OC และไม่ยกเว้น user เดิม)
    // AM (ใช้สถานะเป็นตัวเลข: 0=pending,1=approved)
    const [amDup] = await query(
      `SELECT status FROM MemberRegist_AM_Main 
       WHERE tax_id = ? AND (status = 0 OR status = 1)
       LIMIT 1`,
      [taxId],
    );
    // AC
    const [acDup] = await query(
      `SELECT status FROM MemberRegist_AC_Main 
       WHERE tax_id = ? AND (status = 0 OR status = 1) 
       LIMIT 1`,
      [taxId],
    );
    // OC
    const [ocDup] = await query(
      `SELECT status FROM MemberRegist_OC_Main 
       WHERE tax_id = ? AND (status = 0 OR status = 1) 
       LIMIT 1`,
      [taxId],
    );

    if (amDup || acDup || ocDup) {
      // จัดข้อความตามสถานะ ถ้าพบรายการที่สถานะกำลังพิจารณา ให้แจ้งตามนั้น มิฉะนั้นถือว่าเป็นสมาชิกแล้ว
      let isPending = false;
      if (amDup) {
        isPending = Number(amDup.status) === 0;
      } else if (acDup) {
        isPending = Number(acDup.status) === 0;
      } else if (ocDup) {
        isPending = Number(ocDup.status) === 0;
      }

      const message = isPending
        ? `คำขอสมัครสมาชิกของท่านสำหรับเลขประจำตัวผู้เสียภาษี ${taxId} อยู่ระหว่างการพิจารณา`
        : `เลขประจำตัวผู้เสียภาษี ${taxId} นี้ได้เป็นสมาชิกแล้ว`;

      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    // Begin transaction
    trx = await beginTransaction();
    console.log("🔄 [AM Membership Submit] Transaction started");

    // Extract company email and phone from document delivery address (type 2)
    let companyEmail = "";
    let companyPhone = "";
    let companyPhoneExtension = "";

    // If using multi-address structure, get email and phone from document delivery address (type 2)
    if (data.addresses) {
      try {
        const addresses = JSON.parse(data.addresses);
        const documentAddress = addresses["2"]; // Document delivery address
        if (documentAddress) {
          // Support dynamic keys like email-2, phone-2, phoneExtension-2 with fallback to generic keys
          companyEmail = documentAddress["email-2"] || documentAddress.email || "";
          companyPhone = documentAddress["phone-2"] || documentAddress.phone || "";
          companyPhoneExtension =
            documentAddress["phoneExtension-2"] || documentAddress.phoneExtension || "";
        }
      } catch (error) {
        console.error("Error parsing addresses:", error);
      }
    }

    // Insert main data (status ใช้ 0 = pending)
    // Sanitize DECIMAL fields
    let registeredCapital = null;
    let productionCapacityValue = null;
    let salesDomestic = null;
    let salesExport = null;
    let revenueLastYear = null;
    let revenuePreviousYear = null;
    let shareholderThaiPercent = null;
    let shareholderForeignPercent = null;

    try {
      registeredCapital = sanitizeDecimal(registeredCapitalRaw, {
        field: "registeredCapital",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      productionCapacityValue = sanitizeDecimal(productionCapacityValueRaw, {
        field: "productionCapacityValue",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      salesDomestic = sanitizeDecimal(salesDomesticRaw, {
        field: "salesDomestic",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      salesExport = sanitizeDecimal(salesExportRaw, {
        field: "salesExport",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      revenueLastYear = sanitizeDecimal(revenueLastYearRaw, {
        field: "revenueLastYear",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      revenuePreviousYear = sanitizeDecimal(revenuePreviousYearRaw, {
        field: "revenuePreviousYear",
        min: 0,
        max: 9999999999999.99,
        scale: 2,
        allowNull: true,
      });
      shareholderThaiPercent = sanitizePercent(shareholderThaiPercentRaw, {
        field: "shareholderThaiPercent",
        allowNull: true,
      });
      shareholderForeignPercent = sanitizePercent(shareholderForeignPercentRaw, {
        field: "shareholderForeignPercent",
        allowNull: true,
      });
    } catch (numErr) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลตัวเลขไม่ถูกต้อง", details: String(numErr.message) },
        { status: 400 },
      );
    }

    const mainInsertResult = await executeQuery(
      trx,
      `INSERT INTO MemberRegist_AM_Main (
        user_id, company_name_th, company_name_en, tax_id, 
        company_email, company_phone, company_phone_extension, number_of_member,
        number_of_employees, registered_capital, production_capacity_value, production_capacity_unit,
        sales_domestic, sales_export, revenue_last_year, revenue_previous_year, shareholder_thai_percent, shareholder_foreign_percent,
        factory_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [
        userId,
        associationName,
        associationNameEn,
        taxId,
        companyEmail,
        companyPhone,
        companyPhoneExtension,
        memberCount,
        numberOfEmployees,
        registeredCapital,
        productionCapacityValue,
        productionCapacityUnit,
        salesDomestic,
        salesExport,
        revenueLastYear,
        revenuePreviousYear,
        shareholderThaiPercent,
        shareholderForeignPercent,
        factoryType,
      ],
    );

    const mainId = mainInsertResult.insertId;
    console.log("✅ [AM Membership Submit] Main data inserted with ID:", mainId);

    // Insert authorized signatory name fields if Thai names are provided
    if (authorizedSignatoryFirstNameTh && authorizedSignatoryLastNameTh) {
      console.log("📝 [AM Membership Submit] Inserting authorized signatory names...");

      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_AM_Signature_Name (
          main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          mainId,
          toNull(authorizedSignatoryPrenameTh),
          toEmptyString(authorizedSignatoryPrenameEn),
          toNull(authorizedSignatoryPrenameOther),
          toNull(authorizedSignatoryPrenameOtherEn),
          toNull(authorizedSignatoryFirstNameTh),
          toNull(authorizedSignatoryLastNameTh),
          toEmptyString(authorizedSignatoryFirstNameEn),
          toEmptyString(authorizedSignatoryLastNameEn),
          authorizedSignatoryPositionTh && String(authorizedSignatoryPositionTh).trim()
            ? authorizedSignatoryPositionTh
            : null,
          authorizedSignatoryPositionEn && String(authorizedSignatoryPositionEn).trim()
            ? authorizedSignatoryPositionEn
            : "",
        ],
      );
      console.log("✅ [AM Membership Submit] Authorized signatory names inserted");
    } else {
      console.log(
        "⚠️ [AM Membership Submit] No authorized signatory Thai names provided, skipping signature name insertion",
      );
    }

    // Process addresses
    const addressesData = formData.get("addresses");
    if (addressesData) {
      const addresses = JSON.parse(addressesData);
      console.log("🏠 [AM Membership Submit] Processing addresses...");

      for (const [addressType, addressInfo] of Object.entries(addresses)) {
        if (addressInfo && addressInfo.addressNumber) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_AM_Address (
              main_id, address_type, address_number, building, moo, soi, street,
              sub_district, district, province, postal_code, phone, phone_extension,
              email, website, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              mainId,
              addressType,
              addressInfo.addressNumber,
              toNull(addressInfo.building),
              toNull(addressInfo.moo),
              toNull(addressInfo.soi),
              toNull(addressInfo.road ?? addressInfo.street),
              toNull(addressInfo.subDistrict),
              toNull(addressInfo.district),
              toNull(addressInfo.province),
              toNull(addressInfo.postalCode),
              toNull(addressInfo.phone),
              toNull(addressInfo.phoneExtension),
              toNull(addressInfo.email),
              toNull(addressInfo.website),
            ],
          );
        }
      }
    }

    // Process representatives
    const representativesData = formData.get("representatives");
    if (representativesData) {
      const representatives = JSON.parse(representativesData);
      console.log("👥 [AM Membership Submit] Processing representatives...");

      // Normalize keys from frontend (supports both firstNameTh/firstNameThai, etc.)
      for (let i = 0; i < representatives.length; i++) {
        const rep = representatives[i] || {};
        console.log(`🔍 DEBUG AM Representative ${i + 1}:`, rep);
        console.log(`🔍 Available fields:`, Object.keys(rep));

        const firstNameTh = rep.firstNameTh ?? rep.firstNameThai ?? rep.first_name_th ?? null;
        const lastNameTh = rep.lastNameTh ?? rep.lastNameThai ?? rep.last_name_th ?? null;
        const firstNameEn = rep.firstNameEn ?? rep.firstNameEnglish ?? rep.first_name_en ?? null;
        const lastNameEn = rep.lastNameEn ?? rep.lastNameEnglish ?? rep.last_name_en ?? null;
        const position = rep.position ?? null;
        const email = rep.email ?? null;
        const phone = rep.phone ?? null;
        const isPrimary = rep.isPrimary ? 1 : 0;

        console.log(
          `🔍 Mapped fields - firstNameTh: ${firstNameTh}, lastNameTh: ${lastNameTh}, firstNameEn: ${firstNameEn}, lastNameEn: ${lastNameEn}`,
        );

        // Require TH names and also EN names
        if (!firstNameTh || !lastNameTh) {
          console.warn(
            `⚠️ [AM Membership Submit] Skipping representative #${i} due to missing Thai name fields`,
            {
              keys: Object.keys(rep || {}),
            },
          );
          continue;
        }
        if (
          !firstNameEn ||
          !String(firstNameEn).trim() ||
          !lastNameEn ||
          !String(lastNameEn).trim()
        ) {
          await rollbackTransaction(trx);
          return NextResponse.json(
            { success: false, error: `กรุณากรอกชื่อ-นามสกุลภาษาอังกฤษของผู้แทนคนที่ ${i + 1}` },
            { status: 400 },
          );
        }

        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_Representatives (
            main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en,
            position, email, phone, phone_extension, rep_order, is_primary, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            mainId,
            toNull(rep.prenameTh ?? rep.prename_th),
            toEmptyString(rep.prenameEn ?? rep.prename_en),
            toNull(rep.prenameOther ?? rep.prename_other),
            toNull(rep.prenameOtherEn ?? rep.prename_other_en),
            toNull(firstNameTh),
            toNull(lastNameTh),
            toEmptyString(firstNameEn),
            toEmptyString(lastNameEn),
            toNull(position),
            toNull(email),
            toNull(phone),
            toNull(rep.phoneExtension),
            i,
            isPrimary,
          ],
        );
      }
    }

    // Process contact persons
    const contactPersonsData = formData.get("contactPersons");
    if (contactPersonsData) {
      const contactPersons = JSON.parse(contactPersonsData);
      console.log("📞 [AM Membership Submit] Processing contact persons...");

      for (let i = 0; i < contactPersons.length; i++) {
        const cp = contactPersons[i] || {};

        // Normalize expected keys from frontend
        const firstNameTh = cp.firstNameTh ?? cp.first_name_th ?? null;
        const lastNameTh = cp.lastNameTh ?? cp.last_name_th ?? null;
        const firstNameEn = cp.firstNameEn ?? cp.first_name_en ?? null;
        const lastNameEn = cp.lastNameEn ?? cp.last_name_en ?? null;
        const position = cp.position ?? null;
        const email = cp.email ?? null;
        const phone = cp.phone ?? null;
        const phoneExtension = cp.phoneExtension ?? cp.phone_extension ?? null;
        const typeContactId = cp.typeContactId ?? cp.type_contact_id ?? null;
        let typeContactName = cp.typeContactName ?? cp.type_contact_name ?? null;
        const typeContactOtherDetail =
          cp.typeContactOtherDetail ?? cp.type_contact_other_detail ?? null;

        // If we have typeContactId but no name, try to resolve from lookup table
        if (typeContactId && !typeContactName) {
          try {
            const rows = await query(
              "SELECT type_name_th FROM MemberRegist_ContactPerson_TYPE WHERE id = ? AND is_active = 1",
              [typeContactId],
            );
            if (rows && rows.length > 0) {
              typeContactName = rows[0].type_name_th || typeContactName;
            }
          } catch (e) {
            console.warn(
              "⚠️ [AM Membership Submit] contact person TYPE lookup failed, proceeding with provided data",
            );
          }
        }

        // Minimal validation for NOT NULL columns in DB (th names, email, phone) and require EN names
        if (!firstNameTh || !lastNameTh || !email || !phone) {
          console.warn(
            `⚠️ [AM Membership Submit] Skipping contact person #${i} due to missing required fields`,
            {
              hasFirstNameTh: !!firstNameTh,
              hasLastNameTh: !!lastNameTh,
              hasEmail: !!email,
              hasPhone: !!phone,
            },
          );
          continue;
        }
        if (
          !firstNameEn ||
          !String(firstNameEn).trim() ||
          !lastNameEn ||
          !String(lastNameEn).trim()
        ) {
          await rollbackTransaction(trx);
          return NextResponse.json(
            { success: false, error: `กรุณากรอกชื่อ-นามสกุลภาษาอังกฤษของผู้ติดต่อคนที่ ${i + 1}` },
            { status: 400 },
          );
        }

        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_ContactPerson (
            main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en,
            position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            mainId,
            toNull(cp.prenameTh),
            toEmptyString(cp.prenameEn),
            toNull(cp.prenameOther),
            toNull(cp.prenameOtherEn),
            firstNameTh,
            lastNameTh,
            toEmptyString(firstNameEn),
            toEmptyString(lastNameEn),
            toNull(position),
            email,
            phone,
            toNull(phoneExtension),
            toNull(typeContactId),
            toNull(typeContactName),
            toNull(typeContactOtherDetail),
          ],
        );
      }
    }

    // Process business types
    const businessTypesData = formData.get("businessTypes");
    if (businessTypesData) {
      const businessTypes = JSON.parse(businessTypesData);
      console.log("🏢 [AM Membership Submit] Processing business types...");

      for (const [businessType, isSelected] of Object.entries(businessTypes)) {
        if (isSelected) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type, created_at) 
             VALUES (?, ?, NOW())`,
            [mainId, businessType],
          );
        }
      }
    }

    // Process other business type
    const otherBusinessTypeDetail = formData.get("otherBusinessTypeDetail");
    if (otherBusinessTypeDetail) {
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, detail, created_at) 
         VALUES (?, ?, NOW())`,
        [mainId, otherBusinessTypeDetail],
      );
    }

    // Process products
    const productsData = formData.get("products");
    if (productsData) {
      const products = JSON.parse(productsData);
      console.log("📦 [AM Membership Submit] Processing products...");

      for (const product of products) {
        if (product.nameTh) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_AM_Products (main_id, name_th, name_en, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [mainId, product.nameTh, toNull(product.nameEn)],
          );
        }
      }
    }

    // Process industrial groups
    const industrialGroupsData = formData.get("industrialGroups");
    if (industrialGroupsData) {
      const industrialGroups = JSON.parse(industrialGroupsData);
      const industrialGroupNamesData = formData.get("industrialGroupNames");
      const industrialGroupNames = industrialGroupNamesData
        ? JSON.parse(industrialGroupNamesData)
        : [];
      console.log("🏭 [AM Membership Submit] Processing industrial groups...");
      // Build lookup map from DB as reliable source for names (fallback-safe)
      let igMap = new Map();
      try {
        const igLookupRows = await query("SELECT id, name_th FROM industrial_groups");
        igMap = new Map(igLookupRows.map((r) => [String(r.id), r.name_th]));
      } catch (e) {
        console.warn(
          "⚠️ [AM Membership Submit] industrial_groups table not available, using frontend names only",
        );
      }
      const namesByIndex = new Map(
        industrialGroups.map((id, idx) => [String(id), industrialGroupNames[idx]]),
      );

      for (const groupId of industrialGroups) {
        const idStr = String(groupId);
        const groupName = namesByIndex.get(idStr) || igMap.get(idStr) || null;
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id, industry_group_name, created_at) 
           VALUES (?, ?, ?, NOW())`,
          [mainId, groupId, toNull(groupName)],
        );
      }
    }

    // Process provincial chapters (accept alias: provincialCouncils)
    let provincialChaptersData = formData.get("provincialChapters");
    if (!provincialChaptersData) {
      provincialChaptersData = formData.get("provincialCouncils");
    }
    if (provincialChaptersData) {
      const provincialChapters = JSON.parse(provincialChaptersData);
      let provincialChapterNamesData = formData.get("provincialChapterNames");
      if (!provincialChapterNamesData) {
        provincialChapterNamesData = formData.get("provincialCouncilNames");
      }
      const provincialChapterNames = provincialChapterNamesData
        ? JSON.parse(provincialChapterNamesData)
        : [];
      console.log("🏛️ [AM Membership Submit] Processing provincial chapters...");

      // Build lookup map from DB for names (fallback-safe)
      let pcMap = new Map();
      try {
        const pcLookupRows = await query("SELECT id, name_th FROM provincial_chapters");
        pcMap = new Map(pcLookupRows.map((r) => [String(r.id), r.name_th]));
      } catch (e) {
        console.warn(
          "⚠️ [AM Membership Submit] provincial_chapters table not available, using frontend names only",
        );
      }
      const pcNamesByIndex = new Map(
        provincialChapters.map((id, idx) => [String(id), provincialChapterNames[idx]]),
      );

      for (const chapterId of provincialChapters) {
        const idStr = String(chapterId);
        const chapterName = pcNamesByIndex.get(idStr) || pcMap.get(idStr) || null;
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id, province_chapter_name, created_at) 
           VALUES (?, ?, ?, NOW())`,
          [mainId, chapterId, toNull(chapterName)],
        );
      }
    }

    // Process document uploads
    console.log("📄 [AM Membership Submit] Processing document uploads...");

    const documentTypes = [
      "associationCertificate",
      "memberList",
      "companyStamp",
      "authorizedSignature",
      "companyRegistration",
      "taxCertificate",
      "financialStatement",
      "productCatalog",
      "factoryLicense",
      "otherDocuments",
    ];

    for (const docType of documentTypes) {
      const file = formData.get(docType);
      if (file && typeof file.arrayBuffer === "function" && Number(file.size) > 0) {
        console.log(`📎 [AM Membership Submit] Uploading ${docType}:`, file.name);

        try {
          const fileBuffer = await file.arrayBuffer();
          const uploadResult = await uploadToCloudinary(Buffer.from(fileBuffer), file.name, {
            folder: `am-membership/${mainId}`,
            resource_type: "auto",
          });

          if (uploadResult.success) {
            await executeQuery(
              trx,
              `INSERT INTO MemberRegist_AM_Documents (
                main_id, document_type, file_name, file_path, cloudinary_url, created_at
              ) VALUES (?, ?, ?, ?, ?, NOW())`,
              [mainId, docType, file.name, uploadResult.url, uploadResult.url],
            );
            console.log(`✅ [AM Membership Submit] ${docType} uploaded successfully`);
          } else {
            console.error(
              `❌ [AM Membership Submit] Failed to upload ${docType}:`,
              uploadResult.error,
            );
          }
        } catch (uploadError) {
          console.error(`❌ [AM Membership Submit] Error uploading ${docType}:`, uploadError);
        }
      }
    }

    // Process production images
    const productionImagesCount = parseInt(formData.get("productionImagesCount") || "0");
    if (productionImagesCount > 0) {
      console.log(
        `🖼️ [AM Membership Submit] Processing ${productionImagesCount} production images...`,
      );

      for (let i = 0; i < productionImagesCount; i++) {
        const imageFile = formData.get(`productionImages[${i}]`);
        if (
          imageFile &&
          typeof imageFile.arrayBuffer === "function" &&
          Number(imageFile.size) > 0
        ) {
          try {
            const fileBuffer = await imageFile.arrayBuffer();
            const uploadResult = await uploadToCloudinary(Buffer.from(fileBuffer), imageFile.name, {
              folder: `am-membership/${mainId}/production-images`,
              resource_type: "image",
            });

            if (uploadResult.success) {
              await executeQuery(
                trx,
                `INSERT INTO MemberRegist_AM_Documents (
                  main_id, document_type, file_name, file_path, cloudinary_url, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())`,
                [mainId, "productionImage", imageFile.name, uploadResult.url, uploadResult.url],
              );
            }
          } catch (uploadError) {
            console.error(
              `❌ [AM Membership Submit] Error uploading production image ${i}:`,
              uploadError,
            );
          }
        }
      }
    }

    // Log user action
    await executeQuery(
      trx,
      `INSERT INTO FTI_Portal_User_Logs (
        user_id, action, details, created_at
      ) VALUES (?, 'submit_membership', ?, NOW())`,
      [
        userId,
        JSON.stringify({
          membershipType: "am",
          membershipId: mainId,
          associationName: associationName,
          taxId: taxId,
        }),
      ],
    );

    // Commit transaction
    await commitTransaction(trx);
    console.log(" [AM Membership Submit] Transaction committed successfully");

    // ลบ draft ทั้งหมดที่ใช้ tax id เดียวกันในทุกประเภทสมาชิกและทุก user (หลังจากส่งข้อมูลสำเร็จ)
    try {
      const allMemberTypes = ["ic", "oc", "am", "ac"];

      for (const memberType of allMemberTypes) {
        const deleteDraftQuery =
          memberType === "ic"
            ? `DELETE FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE idcard = ? AND status = 3`
            : `DELETE FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE tax_id = ? AND status = 3`;

        await executeQueryWithoutTransaction(deleteDraftQuery, [taxId]);
        console.log(
          `🗑️ [AM] Deleted ALL drafts for ${memberType} with tax_id: ${taxId} (all users)`,
        );
      }
    } catch (draftError) {
      console.error("❌ [AM] Error deleting drafts:", draftError);
      // ไม่ต้อง rollback transaction เพราะ main data บันทึกสำเร็จแล้ว
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
        const associationNameForEmail = associationName || "สมาคม";

        await sendMembershipConfirmationEmail(userEmail, userName, "AM", associationNameForEmail);
        console.log("✅ [AM] Membership confirmation email sent to:", userEmail);
      }
    } catch (emailError) {
      console.error("❌ [AM] Error sending membership confirmation email:", emailError);
      // ไม่ต้องหยุดการทำงานหากส่งอีเมลไม่สำเร็จ
    }

    return NextResponse.json(
      {
        success: true,
        message: "ส่งใบสมัครสมาชิก AM สำเร็จ",
        memberId: mainId,
        data: {
          id: mainId,
          associationName: associationName,
          taxId: taxId,
          status: "pending_review",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ [AM Membership Submit] Error:", error);

    if (trx) {
      try {
        await rollbackTransaction(trx);
        console.log("🔄 [AM Membership Submit] Transaction rolled back");
      } catch (rollbackError) {
        console.error("❌ [AM Membership Submit] Rollback error:", rollbackError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
