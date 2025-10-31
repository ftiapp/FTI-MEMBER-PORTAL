import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "@/app/lib/db";
import { createNotification } from "@/app/lib/notifications";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { memberType, draftData, currentStep } = await request.json();

    // ฟังก์ชันกรองไฟล์แนบออกจาก draft data เพื่อประหยัด Cloudinary storage
    const filterFileAttachments = (data) => {
      const filteredData = { ...data };

      // รายการฟิลด์ที่เป็นไฟล์แนบที่ต้องกรองออก
      const fileFields = [
        // OC Form files
        "factoryLicense",
        "industrialEstateLicense",
        "companyRegistration",
        "vatRegistration",
        // IC Form files
        "idCard",
        "additionalDocuments",
        // AC Form files
        "companyRegistration",
        "vatRegistration",
        // AM Form files
        "associationRegistration",
        "associationProfile",
        "memberList",
        "vatRegistration",
        "idCard",
        "authorityLetter",
      ];

      // ลบฟิลด์ไฟล์แนบออก
      fileFields.forEach((field) => {
        if (filteredData[field]) {
          delete filteredData[field];
        }
      });

      // กรองไฟล์แนบในอาร์เรย์ (เช่น representatives)
      if (filteredData.representatives && Array.isArray(filteredData.representatives)) {
        filteredData.representatives = filteredData.representatives.map((rep) => {
          const cleanRep = { ...rep };
          fileFields.forEach((field) => {
            if (cleanRep[field]) {
              delete cleanRep[field];
            }
          });
          return cleanRep;
        });
      }

      return filteredData;
    };

    // กรองไฟล์แนบออกจาก draft data
    const cleanDraftData = filterFileAttachments(draftData);

    // Extract unique identifier - taxId for OC/AC/AM, idcard for IC
    let uniqueId;
    if (memberType.toLowerCase() === "ic") {
      uniqueId = cleanDraftData.idCardNumber || cleanDraftData.idcard || null;
    } else {
      uniqueId = cleanDraftData.taxId || cleanDraftData.tax_id || null;
    }

    if (!uniqueId) {
      const fieldName = memberType.toLowerCase() === "ic" ? "เลขบัตรประชาชน" : "Tax ID";
      return NextResponse.json(
        {
          success: false,
          message: `${fieldName} จำเป็นสำหรับการบันทึก draft`,
        },
        { status: 400 },
      );
    }

    if (!memberType || !draftData) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if unique identifier exists in main tables
    let existingRecords = [];

    if (memberType.toLowerCase() === "ic") {
      // For IC, check ID card in IC main table only
      const checkICQuery = `SELECT 'ic' as member_type, status FROM MemberRegist_IC_Main WHERE id_card_number = ?`;
      existingRecords = await query(checkICQuery, [uniqueId]);
    } else {
      // For OC, AC, AM - check tax_id in respective main tables
      const checkTaxIdQuery = `
        SELECT 'oc' as member_type, status FROM MemberRegist_OC_Main WHERE tax_id = ?
        UNION ALL
        SELECT 'ac' as member_type, status FROM MemberRegist_AC_Main WHERE tax_id = ?
        UNION ALL
        SELECT 'am' as member_type, status FROM MemberRegist_AM_Main WHERE tax_id = ?
      `;
      existingRecords = await query(checkTaxIdQuery, [uniqueId, uniqueId, uniqueId]);
    }

    if (existingRecords.length > 0) {
      const record = existingRecords[0];
      // อนุญาตให้บันทึกร่างได้เมื่อเคยถูกปฏิเสธ (status = 2)
      if (record.status === 2) {
        // proceed without blocking
      } else {
        let message = "";
        switch (record.status) {
          case 0:
            message = `เลขประจำตัวผู้เสียภาษีนี้มีคำขอสมัคร${getMemberTypeName(memberType)}อยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน`;
            break;
          case 1:
            message = `เลขประจำตัวผู้เสียภาษีนี้ได้เป็นสมาชิก${getMemberTypeName(memberType)}แล้ว กรุณาตรวจสอบหน้าข้อมูลสมาชิก`;
            break;
          default:
            message = `เลขประจำตัวผู้เสียภาษีนี้มีอยู่ในระบบแล้ว`;
        }
        return NextResponse.json(
          {
            success: false,
            message: message,
          },
          { status: 409 },
        );
      }
    }

    // Helper function to get Thai member type name
    function getMemberTypeName(type) {
      switch (type.toLowerCase()) {
        case "oc":
          return "สามัญ-โรงงาน";
        case "ac":
          return "สมทบ-นิติบุคคล";
        case "am":
          return "สามัญ-สมาคมการค้า";
        case "ic":
          return "บุคคลธรรมดา";
        default:
          return "สมาชิก";
      }
    }

    // ตรวจสอบว่ามี draft อยู่แล้วหรือไม่ (ตรวจสอบข้ามทุกประเภทสมาชิก)
    const allMemberTypes = ["ic", "oc", "am", "ac"];
    let existingDraft = null;
    let existingMemberType = null;

    for (const type of allMemberTypes) {
      const checkQuery =
        type === "ic"
          ? `SELECT id, user_id FROM MemberRegist_${type.toUpperCase()}_Draft WHERE idcard = ? AND status = 3`
          : `SELECT id, user_id FROM MemberRegist_${type.toUpperCase()}_Draft WHERE tax_id = ? AND status = 3`;
      const draftResult = await query(checkQuery, [uniqueId]);

      if (draftResult && draftResult.length > 0) {
        existingDraft = draftResult;
        existingMemberType = type;
        break;
      }
    }

    // ตรวจสอบว่า draft ที่มีอยู่เป็นของ user คนอื่นหรือไม่ (ถ้าเป็นของ user เดียวกัน อนุญาตให้สร้างประเภทอื่นได้)
    if (existingDraft && existingDraft.length > 0) {
      const draftOwnerId = existingDraft[0].user_id;
      if (draftOwnerId !== userId) {
        const idFieldName =
          memberType.toLowerCase() === "ic" ? "หมายเลขบัตรประชาชน" : "เลขประจำตัวผู้เสียภาษี";
        const existingTypeName = getMemberTypeName(existingMemberType);
        const currentTypeName = getMemberTypeName(memberType);

        return NextResponse.json(
          {
            success: false,
            message: `${idFieldName} ${uniqueId} ถูกใช้งานโดยผู้ใช้อื่นสำหรับสมาชิก${existingTypeName}อยู่แล้ว ไม่สามารถใช้${idFieldName}นี้ได้ กรุณาใช้${idFieldName}อื่น หรือติดต่อเจ้าหน้าที่`,
          },
          { status: 409 },
        );
      }
    }

    let result;

    // ถ้าเจอ draft ใน user เดียวกันและประเภทเดียวกัน ให้อัปเดต
    if (existingDraft && existingDraft.length > 0 && existingMemberType === memberType) {
      // อัปเดต draft ที่มีอยู่ (ในตารางเดียวกัน)
      const updateQuery =
        memberType.toLowerCase() === "ic"
          ? `UPDATE MemberRegist_${memberType.toUpperCase()}_Draft 
           SET draft_data = ?, current_step = ?, updated_at = NOW()
           WHERE idcard = ? AND status = 3 AND user_id = ?`
          : `UPDATE MemberRegist_${memberType.toUpperCase()}_Draft 
           SET draft_data = ?, current_step = ?, updated_at = NOW()
           WHERE tax_id = ? AND status = 3 AND user_id = ?`;

      const updateParams =
        memberType.toLowerCase() === "ic"
          ? [JSON.stringify(cleanDraftData), currentStep, uniqueId, userId]
          : [JSON.stringify(cleanDraftData), currentStep, uniqueId, userId];

      result = await query(updateQuery, updateParams);
    } else {
      // สร้าง draft ใหม่ (กรณีไม่มีเลย หรือ user เดียวกันแต่คนละประเภท)
      const insertQuery =
        memberType.toLowerCase() === "ic"
          ? `INSERT INTO MemberRegist_${memberType.toUpperCase()}_Draft (user_id, draft_data, current_step, status, idcard, created_at, updated_at) 
           VALUES (?, ?, ?, 3, ?, NOW(), NOW())`
          : `INSERT INTO MemberRegist_${memberType.toUpperCase()}_Draft (user_id, draft_data, current_step, status, tax_id, created_at, updated_at) 
           VALUES (?, ?, ?, 3, ?, NOW(), NOW())`;

      const insertParams =
        memberType.toLowerCase() === "ic"
          ? [userId, JSON.stringify(cleanDraftData), currentStep, uniqueId]
          : [userId, JSON.stringify(cleanDraftData), currentStep, uniqueId];

      result = await query(insertQuery, insertParams);
    }

    // สร้างการแจ้งเตือนเมื่อบันทึก draft สำเร็จ
    try {
      // ดึง draft ID ที่เพิ่งสร้างใหม่ (จากตารางประเภทปัจจุบัน)
      const getDraftQuery =
        memberType.toLowerCase() === "ic"
          ? `SELECT id FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE idcard = ? AND status = 3 ORDER BY updated_at DESC LIMIT 1`
          : `SELECT id FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE tax_id = ? AND status = 3 ORDER BY updated_at DESC LIMIT 1`;
      const draftResult = await query(getDraftQuery, [uniqueId]);
      const draftId = draftResult && draftResult.length > 0 ? draftResult[0].id : null;

      const memberTypeName = getMemberTypeName(memberType);
      let applicantName = "ผู้สมัคร";

      // ดึงชื่อผู้สมัครตามประเภทสมาชิก
      if (memberType.toLowerCase() === "ic") {
        applicantName =
          `${cleanDraftData.firstNameThai || ""} ${cleanDraftData.lastNameThai || ""}`.trim() ||
          "ผู้สมัคร";
      } else {
        applicantName = cleanDraftData.companyNameThai || cleanDraftData.companyName || "บริษัท";
      }

      const memberTypeLinks = {
        oc: `/membership/oc${draftId ? `?draftId=${draftId}` : ""}`,
        ac: `/membership/ac${draftId ? `?draftId=${draftId}` : ""}`,
        am: `/membership/am${draftId ? `?draftId=${draftId}` : ""}`,
        ic: `/membership/ic${draftId ? `?draftId=${draftId}` : ""}`,
      };

      await createNotification({
        user_id: userId,
        type: "draft_saved",
        message: `บันทึกแบบร่างสมาชิก${memberTypeName}สำเร็จ - ${applicantName} (${uniqueId})`,
        link: memberTypeLinks[memberType.toLowerCase()] || "/dashboard",
        status: "info",
      });
      console.log(
        `Draft save notification created for ${memberType} membership with draftId: ${draftId}`,
      );
    } catch (notificationError) {
      console.error("Error creating draft notification:", notificationError);
      // ไม่ให้ notification error หยุดการบันทึก draft
    }

    return NextResponse.json({ success: true, message: "Draft saved successfully" });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
