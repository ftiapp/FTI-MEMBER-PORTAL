import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkUserSession } from "../../../../../lib/auth";
import { query } from "../../../../../lib/db";

const BUSINESS_TYPE_MAP = {
  manufacturer: "ผู้ผลิต",
  distributor: "ผู้จัดจำหน่าย",
  importer: "ผู้นำเข้า",
  exporter: "ผู้ส่งออก",
  service: "ผู้ให้บริการ",
  other: "อื่นๆ",
};

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Fetch main AM data
    const mainResult = await query("SELECT * FROM MemberRegist_AM_Main WHERE id = ?", [id]);

    if (!mainResult || mainResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "AM application not found",
        },
        { status: 404 },
      );
    }

    const amData = mainResult[0];

    // Fetch applicant user account via user_id
    let applicantUser = null;
    if (amData?.user_id) {
      const userRows = await query(
        "SELECT id, firstname, lastname, email, phone FROM FTI_Portal_User WHERE id = ? LIMIT 1",
        [amData.user_id],
      );
      applicantUser = userRows?.[0] || null;
    }

    // Fetch all addresses (multi-address support)
    const addressResult = await query(
      "SELECT * FROM MemberRegist_AM_Address WHERE main_id = ? ORDER BY address_type",
      [id],
    );

    // Fetch representatives
    const representativesResult = await query(
      "SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?",
      [id],
    );

    // Fetch contact persons (order by type_contact_id = 1 first for main contact)
    const contactPersonsResult = await query(
      "SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ? ORDER BY (type_contact_id = 1) DESC, id ASC",
      [id],
    );

    // Fetch business types
    const businessTypesResult = await query(
      "SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?",
      [id],
    );

    // Fetch business type other if exists
    let businessTypeOther = null;
    const hasOtherBusinessType = businessTypesResult?.find((bt) => bt.business_type === "other");
    if (hasOtherBusinessType) {
      const otherResult = await query(
        "SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?",
        [id],
      );
      businessTypeOther = otherResult?.[0] || null;
    }

    // Fetch products/services
    const productsResult = await query("SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?", [
      id,
    ]);

    // ✅ Fetch industry groups - ใช้ข้อมูลจากตารางโดยตรง
    const industryGroupsResult = await query(
      "SELECT * FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?",
      [id],
    );

    // ✅ Fetch province chapters - ใช้ข้อมูลจากตารางโดยตรง
    const provinceChaptersResult = await query(
      "SELECT * FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?",
      [id],
    );

    // Fetch authorized signatory name & position
    const signatureNameRows = await query(
      "SELECT prename_th, prename_en, prename_other, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en FROM MemberRegist_AM_Signature_Name WHERE main_id = ? ORDER BY id DESC LIMIT 1",
      [id],
    );
    const signatureName =
      Array.isArray(signatureNameRows) && signatureNameRows.length ? signatureNameRows[0] : null;

    // Fetch documents
    const documentsResult = await query(
      "SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?",
      [id],
    );

    // 🔥 FIXED: ใช้ข้อมูลจากตารางย่อยที่มีอยู่แล้ว แทนการ fetch จาก master tables ที่ไม่มี
    // สร้าง lookup data จากข้อมูลที่มีอยู่ในตารางย่อย
    const allIndustrialGroupsResult = (industryGroupsResult || []).map((ig) => ({
      id: ig.industry_group_id,
      name_th: ig.industry_group_name || `กลุ่มอุตสาหกรรม ${ig.industry_group_id}`,
    }));

    const allProvincialChaptersResult = (provinceChaptersResult || []).map((pc) => ({
      id: pc.province_chapter_id,
      name_th: pc.province_chapter_name || `สภาอุตสาหกรรมจังหวัด ${pc.province_chapter_id}`,
    }));

    console.log("🔍 Debug - Industry groups from DB:", industryGroupsResult);
    console.log("🔍 Debug - Province chapters from DB:", provinceChaptersResult);
    console.log("🔍 Debug - Generated industrial groups lookup:", allIndustrialGroupsResult);
    console.log("🔍 Debug - Generated provincial chapters lookup:", allProvincialChaptersResult);

    // Process addresses into multi-address format
    const addressesFormatted = {};
    (addressResult || []).forEach((addr) => {
      const addressType = addr.address_type || "2"; // Default to type 2 if not specified
      addressesFormatted[addressType] = {
        addressType: addressType,
        address_number: addr.address_number || "",
        addressNumber: addr.address_number || "",
        building: addr.building || "",
        moo: addr.moo || "",
        soi: addr.soi || "",
        // Keep both keys to match OC and ensure compatibility
        street: addr.street || addr.road || "",
        road: addr.road || addr.street || "",
        sub_district: addr.sub_district || "",
        subDistrict: addr.sub_district || "",
        district: addr.district || "",
        province: addr.province || "",
        postal_code: addr.postal_code || "",
        postalCode: addr.postal_code || "",
        phone: addr.phone || "",
        phone_extension: addr.phone_extension || "",
        phoneExtension: addr.phone_extension || "",
        email: addr.email || "",
        website: addr.website || "",
      };
    });

    // Get main address data (fallback to legacy single address or type 2)
    const mainAddress =
      (addressResult || []).find((addr) => addr.address_type === "2") ||
      (addressResult || [])[0] ||
      {};

    // Transform data to match the format expected by the frontend
    const transformedData = {
      id: amData.id,
      userId: amData.user_id || null,
      memberCode: amData.member_code,
      associationName: amData.company_name_th,
      associationNameEng: amData.company_name_en,
      associationNameEn: amData.company_name_en, // Alternative key
      company_name_th: amData.company_name_th, // DB key
      company_name_en: amData.company_name_en, // DB key
      associationRegistrationNumber: amData.association_registration_number,
      associationEmail: amData.company_email || mainAddress?.email || "",
      associationPhone: amData.company_phone || mainAddress?.phone || "",
      associationPhoneExtension: amData.company_phone_extension || "",
      associationWebsite: mainAddress?.website || "",
      website: mainAddress?.website || "", // Alternative key
      // Tax ID
      taxId: amData.tax_id || "",
      tax_id: amData.tax_id || "", // DB key
      // Employee/Member counts (map to both camelCase and snake_case expected by SummarySection)
      numberOfEmployees: amData.number_of_employees ?? null,
      number_of_employees: amData.number_of_employees ?? null,
      memberCount: amData.number_of_member ?? null,
      number_of_member: amData.number_of_member ?? null,
      status: amData.status,
      createdAt: amData.created_at,
      updatedAt: amData.updated_at,

      // Multi-address data
      addresses: addressesFormatted,

      // Legacy single address fields (for backward compatibility)
      addressNumber: mainAddress?.address_number || "",
      address_number: mainAddress?.address_number || "", // DB key
      moo: mainAddress?.moo || "",
      soi: mainAddress?.soi || "",
      // Provide both street and road for compatibility with OC components
      street: mainAddress?.street || mainAddress?.road || "",
      road: mainAddress?.road || mainAddress?.street || "",
      subDistrict: mainAddress?.sub_district || "",
      sub_district: mainAddress?.sub_district || "", // DB key
      district: mainAddress?.district || "",
      province: mainAddress?.province || "",
      postalCode: mainAddress?.postal_code || "",
      postal_code: mainAddress?.postal_code || "", // DB key

      // Multiple contact persons
      contactPersons: (contactPersonsResult || []).map((cp, index) => ({
        id: cp.id || index + 1,
        prename_th: cp.prename_th || "",
        prename_en: cp.prename_en || "",
        prename_other: cp.prename_other || "",
        first_name_th: cp.first_name_th || "",
        last_name_th: cp.last_name_th || "",
        first_name_en: cp.first_name_en || "",
        last_name_en: cp.last_name_en || "",
        firstNameTh: cp.first_name_th || "",
        lastNameTh: cp.last_name_th || "",
        firstNameEn: cp.first_name_en || "",
        lastNameEn: cp.last_name_en || "",
        position: cp.position || "",
        email: cp.email || "",
        phone: cp.phone || "",
        phone_extension: cp.phone_extension || "",
        phoneExtension: cp.phone_extension || "",
        type_contact_id: cp.type_contact_id || null,
        typeContactId: cp.type_contact_id || null,
        type_contact_name: cp.type_contact_name || "",
        typeContactName: cp.type_contact_name || "",
        type_contact_other_detail: cp.type_contact_other_detail || "",
        typeContactOtherDetail: cp.type_contact_other_detail || "",
        isMain: cp.type_contact_id === 1 || index === 0,
      })),

      // Legacy single contact person fields (for backward compatibility)
      contactPersonFirstName: contactPersonsResult?.[0]?.first_name_th || "",
      contactPersonLastName: contactPersonsResult?.[0]?.last_name_th || "",
      contactPersonFirstNameEng: contactPersonsResult?.[0]?.first_name_en || "",
      contactPersonLastNameEng: contactPersonsResult?.[0]?.last_name_en || "",
      contactPersonPosition: contactPersonsResult?.[0]?.position || "",
      contactPersonEmail: contactPersonsResult?.[0]?.email || "",
      contactPersonPhone: contactPersonsResult?.[0]?.phone || "",

      // Representatives - align keys with SummarySection expectations
      representatives: (representativesResult || []).map((rep) => ({
        id: rep.id,
        prename_th: rep.prename_th || "",
        prename_en: rep.prename_en || "",
        prename_other: rep.prename_other || "",
        // snake_case
        first_name_th: rep.first_name_th,
        last_name_th: rep.last_name_th,
        first_name_en: rep.first_name_en,
        last_name_en: rep.last_name_en,
        phone_extension: rep.phone_extension || "",
        // camelCase fallbacks
        firstNameTh: rep.first_name_th,
        lastNameTh: rep.last_name_th,
        firstNameEn: rep.first_name_en,
        lastNameEn: rep.last_name_en,
        phoneExtension: rep.phone_extension || "",
        // common
        email: rep.email,
        phone: rep.phone,
        position: rep.position,
        isPrimary: rep.is_primary === 1,
      })),

      // Business Types - transform to match frontend format
      businessTypes: (businessTypesResult || []).reduce((acc, bt) => {
        acc[bt.business_type] = true;
        return acc;
      }, {}),

      // Other business type detail
      otherBusinessTypeDetail: businessTypeOther?.detail,

      // Products/Services
      products: (productsResult || []).map((product) => ({
        name_th: product.name_th,
        nameTh: product.name_th,
        name_en: product.name_en,
        nameEn: product.name_en,
      })),

      // 🔥 เพิ่มข้อมูลทางการเงิน
      registeredCapital: amData.registered_capital || "",
      registered_capital: amData.registered_capital || "",
      productionCapacityValue: amData.production_capacity_value || "",
      production_capacity_value: amData.production_capacity_value || "",
      productionCapacityUnit: amData.production_capacity_unit || "",
      production_capacity_unit: amData.production_capacity_unit || "",
      revenueLastYear: amData.revenue_last_year || "",
      revenuePreviousYear: amData.revenue_previous_year || "",
      salesDomestic: amData.sales_domestic || "",
      sales_domestic: amData.sales_domestic || "",
      salesExport: amData.sales_export || "",
      sales_export: amData.sales_export || "",
      shareholderThaiPercent: amData.shareholder_thai_percent || "",
      shareholder_thai_percent: amData.shareholder_thai_percent || "",
      shareholderForeignPercent: amData.shareholder_foreign_percent || "",
      shareholder_foreign_percent: amData.shareholder_foreign_percent || "",

      // Applicant account (for PDF section: ข้อมูลบัญชีผู้สมัคร)
      user: applicantUser
        ? {
            id: applicantUser.id,
            firstname: applicantUser.firstname,
            lastname: applicantUser.lastname,
            email: applicantUser.email,
            phone: applicantUser.phone,
          }
        : null,
      // Flat fallbacks so frontend/PDF can read even if not using nested user
      firstname: applicantUser?.firstname || null,
      lastname: applicantUser?.lastname || null,
      email: applicantUser?.email || null,
      phone: applicantUser?.phone || null,

      // Authorized signatory (names & positions)
      authorizedSignatoryPrenameTh: signatureName?.prename_th || null,
      authorizedSignatoryPrenameEn: signatureName?.prename_en || null,
      authorizedSignatoryPrenameOther: signatureName?.prename_other || null,
      authorizedSignatoryFirstNameTh: signatureName?.first_name_th || null,
      authorizedSignatoryLastNameTh: signatureName?.last_name_th || null,
      authorizedSignatoryFirstNameEn: signatureName?.first_name_en || null,
      authorizedSignatoryLastNameEn: signatureName?.last_name_en || null,
      authorizedSignatoryPositionTh: signatureName?.position_th || null,
      authorizedSignatoryPositionEn: signatureName?.position_en || null,

      // Signature name object for PDF utility
      signatureName: signatureName
        ? {
            prenameTh: signatureName.prename_th,
            prenameEn: signatureName.prename_en,
            prenameOther: signatureName.prename_other,
            firstNameTh: signatureName.first_name_th,
            lastNameTh: signatureName.last_name_th,
            firstNameEn: signatureName.first_name_en,
            lastNameEn: signatureName.last_name_en,
            positionTh: signatureName.position_th,
            positionEn: signatureName.position_en,
          }
        : null,

      // ✅ Industry Groups / Province Chapters
      // Keep arrays of IDs for backward compatibility
      industrialGroups: (industryGroupsResult || []).map((ig) => ig.industry_group_id),
      industrialGroupIds: (industryGroupsResult || []).map((ig) => ig.industry_group_id), // Alternative key
      provincialCouncils: (provinceChaptersResult || []).map((pc) => pc.province_chapter_id),
      provincialChapterIds: (provinceChaptersResult || []).map((pc) => pc.province_chapter_id), // Alternative key
      provincialChapters: (provinceChaptersResult || []).map((pc) => pc.province_chapter_id), // Alternative key for API compatibility
      // Provide explicit name arrays so UIs/PDF can directly render names
      industrialGroupNames: (industryGroupsResult || [])
        .map((ig) => ig.industry_group_name)
        .filter(Boolean),
      provincialChapterNames: (provinceChaptersResult || [])
        .map((pc) => pc.province_chapter_name)
        .filter(Boolean),

      // Documents
      associationCertificate: documentsResult?.find(
        (doc) => doc.document_type === "associationCertificate",
      )
        ? {
            name:
              documentsResult.find((doc) => doc.document_type === "associationCertificate")
                ?.file_name || "ไฟล์ถูกอัปโหลดแล้ว",
            file_name:
              documentsResult.find((doc) => doc.document_type === "associationCertificate")
                ?.file_name || "ไฟล์ถูกอัปโหลดแล้ว",
            fileUrl:
              documentsResult.find((doc) => doc.document_type === "associationCertificate")
                ?.cloudinary_url ||
              documentsResult.find((doc) => doc.document_type === "associationCertificate")
                ?.file_path,
            cloudinary_url: documentsResult.find(
              (doc) => doc.document_type === "associationCertificate",
            )?.cloudinary_url,
            file_path: documentsResult.find((doc) => doc.document_type === "associationCertificate")
              ?.file_path,
          }
        : null,

      memberList: documentsResult?.find((doc) => doc.document_type === "memberList")
        ? {
            name:
              documentsResult.find((doc) => doc.document_type === "memberList")?.file_name ||
              "ไฟล์ถูกอัปโหลดแล้ว",
            file_name:
              documentsResult.find((doc) => doc.document_type === "memberList")?.file_name ||
              "ไฟล์ถูกอัปโหลดแล้ว",
            fileUrl:
              documentsResult.find((doc) => doc.document_type === "memberList")?.cloudinary_url ||
              documentsResult.find((doc) => doc.document_type === "memberList")?.file_path,
            cloudinary_url: documentsResult.find((doc) => doc.document_type === "memberList")
              ?.cloudinary_url,
            file_path: documentsResult.find((doc) => doc.document_type === "memberList")?.file_path,
          }
        : null,

      // Company stamp document (new required document)
      companyStamp: documentsResult?.find((doc) => doc.document_type === "companyStamp")
        ? {
            name:
              documentsResult.find((doc) => doc.document_type === "companyStamp")?.file_name ||
              "ไฟล์ถูกอัปโหลดแล้ว",
            file_name:
              documentsResult.find((doc) => doc.document_type === "companyStamp")?.file_name ||
              "ไฟล์ถูกอัปโหลดแล้ว",
            fileUrl:
              documentsResult.find((doc) => doc.document_type === "companyStamp")?.cloudinary_url ||
              documentsResult.find((doc) => doc.document_type === "companyStamp")?.file_path,
            cloudinary_url: documentsResult.find((doc) => doc.document_type === "companyStamp")
              ?.cloudinary_url,
            file_path: documentsResult.find((doc) => doc.document_type === "companyStamp")
              ?.file_path,
            fileType: documentsResult.find((doc) => doc.document_type === "companyStamp")
              ?.mime_type,
            fileSize: documentsResult.find((doc) => doc.document_type === "companyStamp")
              ?.file_size,
            cloudinaryId: documentsResult.find((doc) => doc.document_type === "companyStamp")
              ?.cloudinary_id,
          }
        : null,

      // Authorized signature document (new required document)
      authorizedSignature: documentsResult?.find(
        (doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures",
      )
        ? {
            name:
              documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
                ?.file_name || "ไฟล์ถูกอัปโหลดแล้ว",
            file_name:
              documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
                ?.file_name || "ไฟล์ถูกอัปโหลดแล้ว",
            fileUrl:
              documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
                ?.cloudinary_url ||
              documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")?.file_path,
            cloudinary_url: documentsResult.find(
              (doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures",
            )?.cloudinary_url,
            file_path: documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
              ?.file_path,
            fileType: documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
              ?.mime_type,
            fileSize: documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
              ?.file_size,
            cloudinaryId: documentsResult.find((doc) => doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures")
              ?.cloudinary_id,
          }
        : null,
    };

    // ✅ FIXED: ส่งข้อมูลรวมทั้ง lookup data จาก master tables
    const responseData = {
      success: true,
      data: transformedData,
      // ส่งข้อมูล lookup ทั้งหมดจาก master tables สำหรับ SummarySection ใช้ค้นหาชื่อ
      industrialGroups: allIndustrialGroupsResult || [],
      provincialChapters: allProvincialChaptersResult || [],
    };

    console.log("🚀 Final Response Data:", {
      selectedIndustrialGroups: transformedData.industrialGroups,
      selectedProvincialChapters: transformedData.provincialCouncils,
      lookupIndustrialGroups: allIndustrialGroupsResult?.length || 0,
      lookupProvincialChapters: allProvincialChaptersResult?.length || 0,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching AM summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
