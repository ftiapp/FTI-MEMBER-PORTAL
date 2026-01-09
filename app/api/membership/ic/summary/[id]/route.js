import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkUserSession, checkAdminSession } from "../../../../../lib/auth";
import { query } from "../../../../../lib/db";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    const admin = await checkAdminSession(cookieStore);

    // Allow both user and admin sessions
    if (!user && !admin) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    // ดึงข้อมูลหลักจาก MemberRegist_IC_Main
    // For admin, don't filter by user_id. For user, filter by user_id.
    let mainQuery = `SELECT m.* FROM MemberRegist_IC_Main m WHERE m.id = ?`;
    let queryParams = [id];

    if (user && !admin) {
      mainQuery += ` AND m.user_id = ?`;
      queryParams.push(user.id);
    }

    const mainResult = await query(mainQuery, queryParams);

    if (!mainResult || mainResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลใบสมัคร",
        },
        { status: 404 },
      );
    }

    const mainData = mainResult[0];

    // Fetch applicant user via user_id (for PDF applicant info)
    let applicantUser = null;
    if (mainData?.user_id) {
      const userRows = await query(
        "SELECT id, name, firstname, lastname, email, phone FROM FTI_Portal_User WHERE id = ? LIMIT 1",
        [mainData.user_id],
      );
      const u = userRows?.[0] || null;
      if (u) {
        // Derive firstname/lastname from name if missing
        let first = u.firstname;
        let last = u.lastname;
        if ((!first || !last) && u.name) {
          const parts = String(u.name).trim().split(/\s+/);
          if (!first) first = parts[0] || null;
          if (!last) last = parts.slice(1).join(" ") || null;
        }
        applicantUser = {
          id: u.id,
          name: u.name || null,
          firstname: first || null,
          lastname: last || null,
          email: u.email || null,
          phone: u.phone || null,
        };
      }
    }

    // ดึงข้อมูลที่อยู่ทั้งหมด (multi-address support)
    const addressQuery = `
      SELECT * FROM MemberRegist_IC_Address 
      WHERE main_id = ? ORDER BY address_type
    `;
    const addressResult = await query(addressQuery, [id]);

    // ดึงข้อมูลผู้แทน
    const representativeQuery = `
      SELECT * FROM MemberRegist_IC_Representatives 
      WHERE main_id = ?
    `;
    const representativeResult = await query(representativeQuery, [id]);

    // ดึงข้อมูล Business Types
    const BUSINESS_TYPES_MAP = {
      manufacturer: "ผู้ผลิต",
      distributor: "ผู้จัดจำหน่าย",
      importer: "ผู้นำเข้า",
      exporter: "ผู้ส่งออก",
      service_provider: "ผู้ให้บริการ",
      other: "อื่นๆ",
    };

    const businessTypesQuery = `
      SELECT * FROM MemberRegist_IC_BusinessTypes 
      WHERE main_id = ?
    `;
    const businessTypesRaw = await query(businessTypesQuery, [id]);

    // ดึงข้อมูลประเภทธุรกิจอื่นๆ
    const businessTypeOtherQuery = `
      SELECT * FROM MemberRegist_IC_BusinessTypeOther 
      WHERE main_id = ?
    `;
    const businessTypeOtherResult = await query(businessTypeOtherQuery, [id]);

    // แปลง business types
    const businessTypes = businessTypesRaw.map((bt) => {
      let mappedName = BUSINESS_TYPES_MAP[bt.business_type];

      if (bt.business_type === "other" && businessTypeOtherResult.length > 0) {
        const otherType = businessTypeOtherResult[0].other_type;
        mappedName = `อื่นๆ (${otherType})`;
      }

      return {
        ...bt,
        id: bt.business_type,
        businessTypeName: mappedName || bt.business_type,
        otherTypeDetail:
          bt.business_type === "other" && businessTypeOtherResult.length > 0
            ? businessTypeOtherResult[0].other_type
            : null,
      };
    });

    // ดึงข้อมูลผลิตภัณฑ์
    const productsQuery = `
      SELECT * FROM MemberRegist_IC_Products 
      WHERE main_id = ?
    `;
    const productsResult = await query(productsQuery, [id]);

    // ✅ ดึงข้อมูล Industry Groups - ใช้ข้อมูลจากตารางโดยตรง
    const industryGroupsQuery = `
      SELECT * FROM MemberRegist_IC_IndustryGroups 
      WHERE main_id = ?
    `;
    const industryGroupsResult = await query(industryGroupsQuery, [id]);

    // ✅ ดึงข้อมูลสภาอุตสาหกรรมจังหวัด - ใช้ข้อมูลจากตารางโดยตรง
    const provinceChaptersQuery = `
      SELECT * FROM MemberRegist_IC_ProvinceChapters 
      WHERE main_id = ?
    `;
    const provinceChaptersResult = await query(provinceChaptersQuery, [id]);

    // ดึงข้อมูลเอกสาร
    const documentsQuery = `
      SELECT * FROM MemberRegist_IC_Documents 
      WHERE main_id = ?
    `;
    const documentsResult = await query(documentsQuery, [id]);

    // ดึงชื่อผู้มีอำนาจลงนามจากตารางใหม่
    const signatureNameQuery = `
      SELECT prename_th, prename_en, prename_other, first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en FROM MemberRegist_IC_Signature_Name
      WHERE main_id = ?
      ORDER BY id DESC
      LIMIT 1
    `;
    const signatureNameResult = await query(signatureNameQuery, [id]);

    // ✅ Process Industry Groups และ Province Chapters - ใช้ข้อมูลจากตารางโดยตรง
    const industrialGroupsWithNames = industryGroupsResult.map((ig) => ({
      id: ig.industry_group_id,
      industryGroupName: ig.industry_group_name || ig.industry_group_id,
    }));

    const provinceChaptersWithNames = provinceChaptersResult.map((pc) => ({
      id: pc.province_chapter_id,
      provinceChapterName: pc.province_chapter_name || pc.province_chapter_id,
    }));

    // Process addresses into multi-address format
    const addressesFormatted = {};
    addressResult.forEach((addr) => {
      const addressType = addr.address_type || "2"; // Default to type 2 if not specified
      addressesFormatted[addressType] = {
        addressType: addressType,
        addressNumber: addr.address_number || "",
        building: addr.building || "",
        moo: addr.moo || "",
        soi: addr.soi || "",
        // Canonicalize to 'street' (DB uses 'street'). Keep 'road' alias for compatibility.
        street: addr.street || "",
        road: addr.street || "",
        subDistrict: addr.sub_district || "",
        district: addr.district || "",
        province: addr.province || "",
        postalCode: addr.postal_code || "",
        phone: addr.phone || "",
        phoneExtension: addr.phone_extension || "",
        email: addr.email || "",
        website: addr.website || "",
      };
    });

    // Get main address data (fallback to legacy single address or type 2)
    const mainAddress =
      addressResult.find((addr) => addr.address_type === "2") || addressResult[0] || {};

    // สร้างข้อมูลที่จะส่งกลับ
    const applicationData = {
      // ข้อมูลหลักของผู้สมัคร
      userId: mainData.user_id || null,
      idCardNumber: mainData.id_card_number,
      // คำนำหน้าชื่อ (เก็บทั้งแบบ camelCase และ snake_case เพื่อให้ frontend ใช้งานได้สะดวก)
      prenameTh: mainData.prename_th,
      prenameEn: mainData.prename_en,
      prenameOther: mainData.prename_other,
      prenameOtherEn: mainData.prename_other_en,
      prename_th: mainData.prename_th,
      prename_en: mainData.prename_en,
      prename_other: mainData.prename_other,
      prename_other_en: mainData.prename_other_en,
      firstNameTh: mainData.first_name_th,
      lastNameTh: mainData.last_name_th,
      firstNameEn: mainData.first_name_en,
      lastNameEn: mainData.last_name_en,
      fullNameTh: `${mainData.first_name_th || ""} ${mainData.last_name_th || ""}`.trim(),
      fullNameEn: `${mainData.first_name_en || ""} ${mainData.last_name_en || ""}`.trim(),
      phone: mainData.phone || mainAddress?.phone || "",
      phoneExtension: mainData.phone_extension || "",
      email: mainData.email || mainAddress?.email || "",
      website: mainData.website || mainAddress?.website || "",
      status: mainData.status,
      createdAt: mainData.created_at,
      updatedAt: mainData.updated_at,

      // Applicant account (nested)
      user: applicantUser
        ? {
            id: applicantUser.id,
            name: applicantUser.name || null,
            firstname: applicantUser.firstname || null,
            lastname: applicantUser.lastname || null,
            email: applicantUser.email || null,
            phone: applicantUser.phone || null,
          }
        : null,

      // Multi-address data
      addresses: addressesFormatted,

      // Legacy single address fields (for backward compatibility)
      address:
        addressResult.length > 0
          ? {
              addressNumber: mainAddress?.address_number || "",
              moo: mainAddress?.moo || "",
              soi: mainAddress?.soi || "",
              // Expose as 'street' canonically and keep 'road' alias
              street: mainAddress?.street || "",
              road: mainAddress?.street || "",
              subDistrict: mainAddress?.sub_district || "",
              district: mainAddress?.district || "",
              province: mainAddress?.province || "",
              postalCode: mainAddress?.postal_code || "",
              phone: mainAddress?.phone || "",
              phoneExtension: mainAddress?.phone_extension || "",
              email: mainAddress?.email || "",
              website: mainAddress?.website || "",
            }
          : null,

      // ข้อมูลผู้แทน
      representative:
        representativeResult.length > 0
          ? {
              // คำนำหน้าชื่อผู้แทน (เก็บทั้งแบบ camelCase และ snake_case ให้ hook ใช้งานได้)
              prenameTh: representativeResult[0].prename_th || null,
              prenameEn: representativeResult[0].prename_en || null,
              prenameOther: representativeResult[0].prename_other || null,
              prenameOtherEn: representativeResult[0].prename_other_en || null,
              prename_th: representativeResult[0].prename_th || null,
              prename_en: representativeResult[0].prename_en || null,
              prename_other: representativeResult[0].prename_other || null,
              prename_other_en: representativeResult[0].prename_other_en || null,

              firstNameTh: representativeResult[0].first_name_th,
              lastNameTh: representativeResult[0].last_name_th,
              firstNameEn: representativeResult[0].first_name_en,
              lastNameEn: representativeResult[0].last_name_en,
              fullNameTh:
                `${representativeResult[0].first_name_th || ""} ${representativeResult[0].last_name_th || ""}`.trim(),
              fullNameEn:
                `${representativeResult[0].first_name_en || ""} ${representativeResult[0].last_name_en || ""}`.trim(),
              position: representativeResult[0].position,
              email: representativeResult[0].email,
              phone: representativeResult[0].phone,
              phoneExtension: representativeResult[0].phone_extension || "",
            }
          : null,

      // ข้อมูลประเภทธุรกิจ
      businessTypes: businessTypes.map((bt) => ({
        id: bt.business_type,
        businessTypeName: bt.businessTypeName || bt.business_type,
      })),

      // ข้อมูลประเภทธุรกิจอื่นๆ
      businessTypeOther: businessTypeOtherResult.map((bto) => ({
        otherType: bto.other_type,
      })),

      // ข้อมูลผลิตภัณฑ์
      products: productsResult.map((p) => ({
        nameTh: p.name_th,
        nameEn: p.name_en,
      })),

      // ✅ ข้อมูลกลุ่มอุตสาหกรรม - ใช้ข้อมูลจากตารางโดยตรง
      industryGroups: industrialGroupsWithNames,

      // ✅ ข้อมูลสภาอุตสาหกรรมจังหวัด - ใช้ข้อมูลจากตารางโดยตรง
      provinceChapters: provinceChaptersWithNames,

      // ข้อมูลเอกสาร (generic format)
      documents: documentsResult.map((d) => ({
        fileName: d.file_name,
        fileUrl: d.cloudinary_url || d.file_path,
        fileType: d.mime_type,
        documentType: d.document_type,
        fileSize: d.file_size,
        cloudinaryId: d.cloudinary_id,
      })),

      // ชื่อผู้มีอำนาจลงนาม (flattened fields for compatibility)
      authorizedSignatoryPrenameTh: signatureNameResult?.[0]?.prename_th || null,
      authorizedSignatoryPrenameEn: signatureNameResult?.[0]?.prename_en || null,
      authorizedSignatoryPrenameOther: signatureNameResult?.[0]?.prename_other || null,
      authorizedSignatoryFirstNameTh: signatureNameResult?.[0]?.first_name_th || null,
      authorizedSignatoryLastNameTh: signatureNameResult?.[0]?.last_name_th || null,
      authorizedSignatoryFirstNameEn: signatureNameResult?.[0]?.first_name_en || null,
      authorizedSignatoryLastNameEn: signatureNameResult?.[0]?.last_name_en || null,
      authorizedSignatoryPositionTh: signatureNameResult?.[0]?.position_th || null,
      authorizedSignatoryPositionEn: signatureNameResult?.[0]?.position_en || null,
      authorizedSignatoryFullNameTh:
        `${signatureNameResult?.[0]?.first_name_th || ""} ${signatureNameResult?.[0]?.last_name_th || ""}`.trim() ||
        null,
      authorizedSignatoryFullNameEn:
        `${signatureNameResult?.[0]?.first_name_en || ""} ${signatureNameResult?.[0]?.last_name_en || ""}`.trim() ||
        null,

      // Signature name object for PDF utility
      signatureName: signatureNameResult?.[0]
        ? {
            prenameTh: signatureNameResult[0].prename_th,
            prenameEn: signatureNameResult[0].prename_en,
            prenameOther: signatureNameResult[0].prename_other,
            firstNameTh: signatureNameResult[0].first_name_th,
            lastNameTh: signatureNameResult[0].last_name_th,
            firstNameEn: signatureNameResult[0].first_name_en,
            lastNameEn: signatureNameResult[0].last_name_en,
            positionTh: signatureNameResult[0].position_th,
            positionEn: signatureNameResult[0].position_en,
          }
        : null,

      // ID Card document (existing)
      idCardDocument: documentsResult?.find((doc) => doc.document_type === "idCard")
        ? {
            name:
              documentsResult.find((doc) => doc.document_type === "idCard")?.file_name ||
              "ไฟล์ถูกอัปโหลดแล้ว",
            fileUrl:
              documentsResult.find((doc) => doc.document_type === "idCard")?.cloudinary_url ||
              documentsResult.find((doc) => doc.document_type === "idCard")?.file_path,
            fileType: documentsResult.find((doc) => doc.document_type === "idCard")?.mime_type,
            fileSize: documentsResult.find((doc) => doc.document_type === "idCard")?.file_size,
            cloudinaryId: documentsResult.find((doc) => doc.document_type === "idCard")
              ?.cloudinary_id,
          }
        : null,

      // Authorized signature document (new required document - IC only has this, no company stamp)
      authorizedSignature: documentsResult?.find(
        (doc) =>
          doc.document_type === "authorizedSignature" ||
          doc.document_type === "authorizedSignatures",
      )
        ? {
            name:
              documentsResult.find(
                (doc) =>
                  doc.document_type === "authorizedSignature" ||
                  doc.document_type === "authorizedSignatures",
              )?.file_name || "ไฟล์ถูกอัปโหลดแล้ว",
            fileUrl:
              documentsResult.find(
                (doc) =>
                  doc.document_type === "authorizedSignature" ||
                  doc.document_type === "authorizedSignatures",
              )?.cloudinary_url ||
              documentsResult.find(
                (doc) =>
                  doc.document_type === "authorizedSignature" ||
                  doc.document_type === "authorizedSignatures",
              )?.file_path,
            fileType: documentsResult.find(
              (doc) =>
                doc.document_type === "authorizedSignature" ||
                doc.document_type === "authorizedSignatures",
            )?.mime_type,
            fileSize: documentsResult.find(
              (doc) =>
                doc.document_type === "authorizedSignature" ||
                doc.document_type === "authorizedSignatures",
            )?.file_size,
            cloudinaryId: documentsResult.find(
              (doc) =>
                doc.document_type === "authorizedSignature" ||
                doc.document_type === "authorizedSignatures",
            )?.cloudinary_id,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: applicationData,
    });
  } catch (error) {
    console.error("Error fetching IC application data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      },
      { status: 500 },
    );
  }
}
