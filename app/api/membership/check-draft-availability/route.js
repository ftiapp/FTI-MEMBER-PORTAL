import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/app/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * API endpoint to check if a Tax ID or ID Card is available for draft creation
 * This prevents users from filling out forms with IDs that are already in use
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { memberType, uniqueId } = await request.json();

    if (!memberType || !uniqueId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate ID format (13 digits for Thai IDs)
    if (String(uniqueId).length !== 13 || !/^\d{13}$/.test(String(uniqueId))) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message: "รูปแบบไม่ถูกต้อง ต้องเป็นตัวเลข 13 หลัก",
        },
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

    // Check if ID exists in main tables
    if (existingRecords.length > 0) {
      const record = existingRecords[0];
      // Allow draft creation if previously rejected (status = 2)
      if (record.status === 2) {
        // proceed to check drafts
      } else {
        let message = "";
        const idFieldName = memberType.toLowerCase() === "ic" ? "หมายเลขบัตรประชาชน" : "เลขประจำตัวผู้เสียภาษี";
        
        switch (record.status) {
          case 0:
            message = `${idFieldName}นี้มีคำขอสมัครอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน`;
            break;
          case 1:
            message = `${idFieldName}นี้เป็นสมาชิกอยู่แล้ว กรุณาตรวจสอบหน้าข้อมูลสมาชิก`;
            break;
          default:
            message = `${idFieldName}นี้มีอยู่ในระบบแล้ว`;
        }
        
        return NextResponse.json({
          success: true,
          available: false,
          message: message,
          reason: "exists_in_main",
          status: record.status,
        });
      }
    }

    // Check if draft exists for this ID
    const checkQuery =
      memberType.toLowerCase() === "ic"
        ? `SELECT id, user_id FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE idcard = ? AND status = 3`
        : `SELECT id, user_id FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE tax_id = ? AND status = 3`;
    
    const existingDraft = await query(checkQuery, [uniqueId]);

    // Check if draft belongs to another user
    if (existingDraft && existingDraft.length > 0) {
      const draftOwnerId = existingDraft[0].user_id;
      
      if (draftOwnerId !== userId) {
        const idFieldName = memberType.toLowerCase() === "ic" ? "หมายเลขบัตรประชาชน" : "เลขประจำตัวผู้เสียภาษี";
        
        return NextResponse.json({
          success: true,
          available: false,
          message: `${idFieldName}นี้มีการบันทึกร่างโดยผู้ใช้อื่นอยู่แล้ว กรุณาใช้${idFieldName}อื่น หรือติดต่อเจ้าหน้าที่`,
          reason: "draft_exists_other_user",
        });
      } else {
        // Draft belongs to current user - they can continue editing
        return NextResponse.json({
          success: true,
          available: true,
          message: "คุณมีร่างที่บันทึกไว้แล้วสำหรับหมายเลขนี้ สามารถแก้ไขต่อได้",
          reason: "draft_exists_same_user",
          draftId: existingDraft[0].id,
        });
      }
    }

    // ID is available for use
    return NextResponse.json({
      success: true,
      available: true,
      message: "สามารถใช้หมายเลขนี้ได้",
      reason: "available",
    });

  } catch (error) {
    console.error("Error checking draft availability:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
