import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkUserSession } from "../../../../../lib/auth";
import { query } from "../../../../../lib/db";

const BUSINESS_TYPE_MAP = {
  1: "ผู้ผลิต",
  2: "ผู้จัดจำหน่าย",
  3: "ผู้นำเข้า",
  4: "ผู้ส่งออก",
  5: "ผู้ให้บริการ",
  6: "อื่นๆ",
};

// Helper function to normalize database results
function normalizeDbResult(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result[0])) return result[0];
  return [result];
}

// Helper function to get single record
function getSingleRecord(result) {
  const normalized = normalizeDbResult(result);
  return normalized.length > 0 ? normalized[0] : null;
}

// 🔥 แก้ไข: Helper function สำหรับจัดการเอกสารแนบ
function formatDocumentForResponse(document) {
  if (!document) return null;

  return {
    name: document.file_name || document.original_name || "ไฟล์ถูกอัปโหลดแล้ว",
    fileName: document.file_name || document.original_name,
    fileUrl: document.cloudinary_url || document.file_path,
    cloudinaryId: document.cloudinary_id,
    fileType: document.mime_type,
    fileSize: document.file_size,
    uploadedAt: document.created_at,
  };
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    console.log("OC Summary API called with params:", resolvedParams);

    const { id } = resolvedParams;
    console.log("Fetching OC data for ID:", id);

    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter", success: false }, { status: 400 });
    }

    // Check authentication
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    // Fetch main OC data
    console.log("Querying main OC data...");
    const mainQueryResult = await query("SELECT * FROM MemberRegist_OC_Main WHERE id = ?", [id]);

    const ocData = getSingleRecord(mainQueryResult);
    console.log("Main OC data result:", ocData ? "Found" : "Not found");

    if (!ocData) {
      return NextResponse.json(
        {
          error: "OC application not found",
          success: false,
        },
        { status: 404 },
      );
    }

    // Fetch related data
    const fetchRelatedData = async () => {
      try {
        console.log("Fetching related data...");

        // Fetch all addresses (multi-address support)
        const addressResult = await query(
          "SELECT * FROM MemberRegist_OC_Address WHERE main_id = ? ORDER BY address_type",
          [id],
        );
        const addresses = normalizeDbResult(addressResult);

        // Fetch all contact persons (order by type_contact_id = 1 first for main contact)
        const contactPersonResult = await query(
          "SELECT * FROM MemberRegist_OC_ContactPerson WHERE main_id = ? ORDER BY (type_contact_id = 1) DESC, id ASC",
          [id],
        );
        const contactPersons = normalizeDbResult(contactPersonResult);

        // Fetch representatives
        const representativesResult = await query(
          "SELECT * FROM MemberRegist_OC_Representatives WHERE main_id = ?",
          [id],
        );
        const representatives = normalizeDbResult(representativesResult);

        // Fetch business types
        const businessTypesResult = await query(
          "SELECT * FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?",
          [id],
        );
        const businessTypesRows = normalizeDbResult(businessTypesResult);

        // Fetch business type other if exists
        let businessTypeOther = null;
        const hasOtherBusinessType = businessTypesRows.some(
          (bt) =>
            bt.business_type === "other" ||
            bt.business_type_id === 6 ||
            bt.business_type_id === "6",
        );
        if (hasOtherBusinessType) {
          const otherQueryResult = await query(
            "SELECT * FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?",
            [id],
          );
          businessTypeOther = getSingleRecord(otherQueryResult);
        }

        // Fetch products/services
        const productsResult = await query(
          "SELECT * FROM MemberRegist_OC_Products WHERE main_id = ?",
          [id],
        );
        const products = normalizeDbResult(productsResult);

        // ✅ Fetch industry groups - ใช้ข้อมูลจากตารางโดยตรง
        const industryGroupsResult = await query(
          "SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?",
          [id],
        );
        const industryGroupsRows = normalizeDbResult(industryGroupsResult);

        // ✅ Fetch province chapters - ใช้ข้อมูลจากตารางโดยตรง
        const provinceChaptersResult = await query(
          "SELECT * FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?",
          [id],
        );
        const provinceChaptersRows = normalizeDbResult(provinceChaptersResult);

        // Fetch documents
        const documentsResult = await query(
          "SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ?",
          [id],
        );
        const documents = normalizeDbResult(documentsResult);

        return {
          addresses,
          contactPersons,
          representatives,
          businessTypesRows,
          businessTypeOther,
          products,
          industryGroupsRows,
          provinceChaptersRows,
          documents,
        };
      } catch (error) {
        console.error("Error fetching related data:", error);
        throw error;
      }
    };

    // Fetch applicant user via user_id (for PDF applicant info)
    let applicantUser = null;
    if (ocData?.user_id) {
      const userRows = await query(
        "SELECT id, firstname, lastname, email, phone FROM FTI_Portal_User WHERE id = ? LIMIT 1",
        [ocData.user_id],
      );
      const normalized = Array.isArray(userRows) ? userRows : userRows ? [userRows] : [];
      applicantUser = normalized?.[0] || null;
    }

    const relatedData = await fetchRelatedData();

    // Fetch authorized signatory name & position (latest)
    const signatureNameRows = await query(
      "SELECT prename_th, prename_en, prename_other, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en FROM MemberRegist_OC_Signature_Name WHERE main_id = ? ORDER BY id DESC LIMIT 1",
      [id],
    );
    const signatureName =
      Array.isArray(signatureNameRows) && signatureNameRows.length ? signatureNameRows[0] : null;

    // Fetch multiple signatories for signature support
    const signatoryRows = await query(
      "SELECT id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en FROM MemberRegist_OC_Signature_Name WHERE main_id = ? ORDER BY id ASC",
      [id],
    );
    const signatories = normalizeDbResult(signatoryRows);

    // Fetch signature files for multiple signatories
    const signatureFileRows = await query(
      "SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ? AND document_type LIKE 'authorizedSignature%' ORDER BY id ASC",
      [id],
    );
    const signatureFiles = normalizeDbResult(signatureFileRows);

    // ✅ Process industry groups - ใช้ industry_group_name จากตารางโดยตรง
    const industryGroupsWithNames = relatedData.industryGroupsRows.map((ig) => ({
      id: ig.industry_group_id,
      industryGroupName: ig.industry_group_name || ig.industry_group_id,
      name_th: ig.industry_group_name || ig.industry_group_id,
    }));

    // ✅ Process province chapters - ใช้ province_chapter_name จากตารางโดยตรง
    const provinceChaptersWithNames = relatedData.provinceChaptersRows.map((pc) => ({
      id: pc.province_chapter_id,
      provinceChapterName: pc.province_chapter_name || pc.province_chapter_id,
      name_th: pc.province_chapter_name || pc.province_chapter_id,
    }));

    // ===== สร้างข้อมูลในรูปแบบที่ SummarySection คาดหวัง =====

    // Convert business types to checkbox format that SummarySection expects
    const businessTypesObject = {};
    let otherBusinessTypeDetail = "";

    relatedData.businessTypesRows.forEach((bt) => {
      const typeId = bt.business_type; // ใช้ business_type แทน business_type_id
      if (typeId === "manufacturer") businessTypesObject.manufacturer = true;
      else if (typeId === "distributor") businessTypesObject.distributor = true;
      else if (typeId === "importer") businessTypesObject.importer = true;
      else if (typeId === "exporter") businessTypesObject.exporter = true;
      else if (typeId === "service") businessTypesObject.service = true;
      else if (typeId === "other") {
        businessTypesObject.other = true;
        if (relatedData.businessTypeOther) {
          otherBusinessTypeDetail = relatedData.businessTypeOther.detail || "";
        }
      }
    });

    // Convert products to the format SummarySection expects
    const productsFormatted = relatedData.products.map((product, index) => ({
      id: index + 1,
      nameTh: product.name_th || "",
      nameEn: product.name_en || "",
    }));

    // Convert representatives to the format SummarySection expects
    const representativesFormatted = relatedData.representatives.map((rep, index) => ({
      id: `rep_${rep.id || index}`,
      prenameTh: rep.prename_th || "",
      prenameEn: rep.prename_en || "",
      prenameOther: rep.prename_other || "",
      firstNameThai: rep.first_name_th || "",
      lastNameThai: rep.last_name_th || "",
      firstNameEnglish: rep.first_name_en || "",
      lastNameEnglish: rep.last_name_en || "",
      position: rep.position || "",
      email: rep.email || "",
      phone: rep.phone || "",
      phoneExtension: rep.phone_extension || "", // 🔥 เพิ่ม phone extension
      isPrimary: rep.is_primary === 1 || index === 0,
    }));

    // Process addresses into multi-address format
    const addressesFormatted = {};
    relatedData.addresses.forEach((addr) => {
      const addressType = addr.address_type || "2"; // Default to type 2 if not specified
      addressesFormatted[addressType] = {
        addressType: addressType,
        addressNumber: addr.address_number || "",
        building: addr.building || "",
        moo: addr.moo || "",
        soi: addr.soi || "",
        street: addr.street || "",
        subDistrict: addr.sub_district || "",
        district: addr.district || "",
        province: addr.province || "",
        postalCode: addr.postal_code || "",
        phone: addr.phone || "",
        phoneExtension: addr.phone_extension || "", // 🔥 เพิ่ม phone extension
        email: addr.email || "",
        website: addr.website || "",
      };
    });

    // Get main address data (fallback to legacy single address or type 2)
    const mainAddress =
      relatedData.addresses.find((addr) => addr.address_type === "2") ||
      relatedData.addresses[0] ||
      {};

    // 🔥 แก้ไข: จัดการเอกสารแนบให้ถูกต้อง - ใช้ชื่อที่ตรงกับฐานข้อมูล
    const factoryLicenseDoc = relatedData.documents.find(
      (doc) => doc.document_type === "factoryLicense",
    );
    const industrialEstateLicenseDoc = relatedData.documents.find(
      (doc) => doc.document_type === "industrialEstateLicense",
    );
    const productionImageDocs = relatedData.documents.filter(
      (doc) => doc.document_type === "productionImages",
    );
    const companyStampDoc = relatedData.documents.find(
      (doc) => doc.document_type === "companyStamp",
    );
    const authorizedSignatureDoc = relatedData.documents.find(
      (doc) =>
        doc.document_type === "authorizedSignature" || doc.document_type === "authorizedSignatures",
    );
    // 🔥 เพิ่ม: หนังสือรับรองบริษัท
    const companyCertificateDoc = relatedData.documents.find(
      (doc) => doc.document_type === "companyCertificate",
    );

    // Build response in the format that SummarySection expects
    const response = {
      // Company basic info
      companyName: ocData.company_name_th || "",
      companyNameEng: ocData.company_name_en || "",
      taxId: ocData.tax_id || "",
      companyEmail: ocData.company_email || mainAddress?.email || "",
      companyPhone: ocData.company_phone || mainAddress?.phone || "",
      companyPhoneExtension: ocData.company_phone_extension || "", // 🔥 เพิ่ม phone extension
      companyWebsite: mainAddress?.website || "",

      // Multi-address data
      addresses: addressesFormatted,

      // Legacy single address fields (for backward compatibility)
      addressNumber: mainAddress?.address_number || "",
      moo: mainAddress?.moo || "",
      soi: mainAddress?.soi || "",
      street: mainAddress?.street || "",
      subDistrict: mainAddress?.sub_district || "",
      district: mainAddress?.district || "",
      province: mainAddress?.province || "",
      postalCode: mainAddress?.postal_code || "",

      // Address contact information
      phone: mainAddress?.phone || "",
      phoneExtension: mainAddress?.phone_extension || "",
      email: mainAddress?.email || "",
      website: mainAddress?.website || "",

      // Multiple contact persons
      contactPersons: relatedData.contactPersons.map((cp, index) => ({
        id: cp.id || index + 1,
        prenameTh: cp.prename_th || "",
        prenameEn: cp.prename_en || "",
        prenameOther: cp.prename_other || "",
        firstNameTh: cp.first_name_th || "",
        lastNameTh: cp.last_name_th || "",
        firstNameEn: cp.first_name_en || "",
        lastNameEn: cp.last_name_en || "",
        position: cp.position || "",
        email: cp.email || "",
        phone: cp.phone || "",
        phoneExtension: cp.phone_extension || "", // 🔥 เพิ่ม phone extension
        typeContactId: cp.type_contact_id || null,
        typeContactName: cp.type_contact_name || "",
        typeContactOtherDetail: cp.type_contact_other_detail || "",
        isMain: cp.type_contact_id === 1 || index === 0,
      })),

      // Legacy single contact person fields (for backward compatibility)
      contactPersonFirstName: relatedData.contactPersons[0]?.first_name_th || "",
      contactPersonLastName: relatedData.contactPersons[0]?.last_name_th || "",
      contactPersonFirstNameEng: relatedData.contactPersons[0]?.first_name_en || "",
      contactPersonLastNameEng: relatedData.contactPersons[0]?.last_name_en || "",
      contactPersonPosition: relatedData.contactPersons[0]?.position || "",
      contactPersonEmail: relatedData.contactPersons[0]?.email || "",
      contactPersonPhone: relatedData.contactPersons[0]?.phone || "",
      contactPersonPhoneExtension: relatedData.contactPersons[0]?.phone_extension || "", // 🔥 เพิ่ม phone extension

      // Representatives
      representatives: representativesFormatted,

      // Business types
      businessTypes: businessTypesObject,
      otherBusinessTypeDetail: otherBusinessTypeDetail,

      // Products
      products: productsFormatted,
      numberOfEmployees: ocData.number_of_employees || "",

      // 🔥 เพิ่มข้อมูลทางการเงิน
      registeredCapital: ocData.registered_capital || "",
      productionCapacityValue: ocData.production_capacity_value || "",
      productionCapacityUnit: ocData.production_capacity_unit || "",
      revenueLastYear: ocData.revenue_last_year || "",
      revenuePreviousYear: ocData.revenue_previous_year || "",
      salesDomestic: ocData.sales_domestic || "",
      salesExport: ocData.sales_export || "",
      shareholderThaiPercent: ocData.shareholder_thai_percent || "",
      shareholderForeignPercent: ocData.shareholder_foreign_percent || "",

      // ✅ Industry groups - ใช้ข้อมูลจากตารางโดยตรง
      industryGroups: industryGroupsWithNames,
      industrialGroupIds: relatedData.industryGroupsRows.map((ig) => ig.industry_group_id),
      industrialGroupNames: industryGroupsWithNames.map((ig) => ig.name_th),

      // ✅ Province chapters - ใช้ข้อมูลจากตารางโดยตรง
      provinceChapters: provinceChaptersWithNames,
      provincialChapterIds: relatedData.provinceChaptersRows.map((pc) => pc.province_chapter_id),
      provincialChapterNames: provinceChaptersWithNames.map((pc) => pc.name_th),

      // 🔥 แก้ไข: Factory type and documents ให้ถูกต้อง
      factoryType: ocData.factory_type || "",

      // Factory license document
      factoryLicense: formatDocumentForResponse(factoryLicenseDoc),

      // Industrial estate license document
      industrialEstateLicense: formatDocumentForResponse(industrialEstateLicenseDoc),

      // Production images - แปลงเป็นรูปแบบที่ SummarySection คาดหวัง
      productionImages:
        productionImageDocs.length > 0
          ? productionImageDocs.map((doc) => ({
              name: doc.file_name || doc.original_name || "ไฟล์รูปภาพ",
              fileName: doc.file_name || doc.original_name,
              fileUrl: doc.cloudinary_url || doc.file_path,
              cloudinaryId: doc.cloudinary_id,
              fileType: doc.mime_type,
              fileSize: doc.file_size,
            }))
          : [],

      // Company stamp document (new required document)
      companyStamp: formatDocumentForResponse(companyStampDoc),

      // Company certificate document (new required document)
      companyCertificate: formatDocumentForResponse(companyCertificateDoc),

      // Authorized signature document (new required document)
      authorizedSignature: formatDocumentForResponse(authorizedSignatureDoc),

      // Meta data
      id: ocData.id,
      memberCode: ocData.member_code,
      status: ocData.status,
      createdAt: ocData.created_at,
      updatedAt: ocData.updated_at,

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

      // Multiple signatories for PDF generation
      signatories: signatories.map((sig) => ({
        id: sig.id,
        prenameTh: sig.prename_th || "",
        prenameEn: sig.prename_en || "",
        prenameOther: sig.prename_other || "",
        prenameOtherEn: sig.prename_other_en || "",
        firstNameTh: sig.first_name_th || "",
        lastNameTh: sig.last_name_th || "",
        firstNameEn: sig.first_name_en || "",
        lastNameEn: sig.last_name_en || "",
        positionTh: sig.position_th || "",
        positionEn: sig.position_en || "",
      })),

      // Signature files for multiple signatories
      authorizedSignatures: signatureFiles.map((file) => formatDocumentForResponse(file)),
    };

    // Add applicant account info for PDF
    response.userId = ocData.user_id || null;
    response.user = applicantUser
      ? {
          id: applicantUser.id,
          firstname: applicantUser.firstname,
          lastname: applicantUser.lastname,
          email: applicantUser.email,
          phone: applicantUser.phone,
        }
      : null;
    // Flat fallbacks
    response.firstname = applicantUser?.firstname || null;
    response.lastname = applicantUser?.lastname || null;
    response.email = applicantUser?.email || response.email || null;
    response.phone = applicantUser?.phone || response.phone || null;

    console.log("=== OC API Debug ===");
    console.log("Factory Type:", response.factoryType);
    console.log("Factory License:", response.factoryLicense);
    console.log("Industrial Estate License:", response.industrialEstateLicense);
    console.log("Production Images:", response.productionImages);
    console.log("Company Stamp:", response.companyStamp);
    console.log("Authorized Signature:", response.authorizedSignature);
    console.log("Signatories Found:", response.signatories?.length || 0);
    console.log("Signature Files Found:", response.authorizedSignatures?.length || 0);
    console.log(
      "All Documents Found:",
      relatedData.documents.map((doc) => ({ type: doc.document_type, name: doc.file_name })),
    );

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error in OC summary API:", {
      message: error.message,
      stack: error.stack,
      id: resolvedParams?.id,
    });

    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        success: false,
        error: isDevelopment ? error.message : "Internal server error",
        ...(isDevelopment && { stack: error.stack }),
      },
      { status: 500 },
    );
  }
}
