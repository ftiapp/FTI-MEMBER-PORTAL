import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "@/app/lib/db";

/**
 * API สำหรับเช็คว่า tax_id หรือ id_card ซ้ำหรือไม่
 * เช็คทั้ง Main Tables (คำขอที่ส่งแล้ว/อนุมัติแล้ว) และ Draft Tables (ร่างของคนอื่น)
 *
 * Query Parameters:
 * - uniqueId: เลขที่ต้องการเช็ค (tax_id หรือ id_card)
 * - memberType: ประเภทสมาชิก (am, ac, oc, ic)
 *
 * Response:
 * {
 *   success: true,
 *   available: false,
 *   reason: "pending" | "approved" | "draft" | null,
 *   message: "ข้อความแจ้งเตือน",
 *   details: { ... }
 * }
 */
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get("uniqueId");
    const memberType = searchParams.get("memberType")?.toLowerCase();

    // Validation
    if (!uniqueId || !memberType) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ uniqueId และ memberType",
        },
        { status: 400 },
      );
    }

    if (!["am", "ac", "oc", "ic"].includes(memberType)) {
      return NextResponse.json(
        {
          success: false,
          message: "memberType ไม่ถูกต้อง (ต้องเป็น am, ac, oc, หรือ ic)",
        },
        { status: 400 },
      );
    }

    const isIC = memberType === "ic";
    const idFieldName = isIC ? "หมายเลขบัตรประชาชน" : "เลขประจำตัวผู้เสียภาษี";

    // ========================================
    // 1. เช็คใน Main Tables (คำขอที่ส่งแล้ว/อนุมัติแล้ว)
    // ========================================
    let mainTableResult = null;

    if (isIC) {
      // IC: เช็คเฉพาะตาราง IC_Main
      const [existingIC] = await query(
        `SELECT status FROM MemberRegist_IC_Main 
         WHERE id_card_number = ? AND (status = 0 OR status = 1) 
         LIMIT 1`,
        [uniqueId],
      );

      if (existingIC) {
        mainTableResult = {
          memberType: "ic",
          status: existingIC.status,
        };
      }
    } else {
      // AM, AC, OC: เช็คข้ามทั้ง 3 ตาราง
      const checkMainQuery = `
        SELECT 'am' as member_type, status FROM MemberRegist_AM_Main 
        WHERE tax_id = ? AND (status = 0 OR status = 1)
        UNION ALL
        SELECT 'ac' as member_type, status FROM MemberRegist_AC_Main 
        WHERE tax_id = ? AND (status = 0 OR status = 1)
        UNION ALL
        SELECT 'oc' as member_type, status FROM MemberRegist_OC_Main 
        WHERE tax_id = ? AND (status = 0 OR status = 1)
        LIMIT 1
      `;

      const [existingMain] = await query(checkMainQuery, [uniqueId, uniqueId, uniqueId]);

      if (existingMain) {
        mainTableResult = {
          memberType: existingMain.member_type,
          status: existingMain.status,
        };
      }
    }

    // ถ้าพบใน Main Table → ไม่สามารถใช้ได้
    if (mainTableResult) {
      const memberTypeNames = {
        am: "สมาคมการค้า",
        ac: "สมทบ-นิติบุคคล",
        oc: "สามัญ-โรงงาน",
        ic: "บุคคลธรรมดา",
      };

      const statusText = mainTableResult.status === 0 ? "อยู่ระหว่างการพิจารณา" : "เป็นสมาชิกแล้ว";
      const reason = mainTableResult.status === 0 ? "pending" : "approved";
      const memberTypeName = memberTypeNames[mainTableResult.memberType] || "";

      return NextResponse.json({
        success: true,
        available: false,
        reason: reason,
        message: `${idFieldName} ${uniqueId} ${statusText}ในประเภท${memberTypeName} กรุณาใช้${idFieldName}อื่น หรือติดต่อเจ้าหน้าที่`,
        details: {
          uniqueId: uniqueId,
          memberType: mainTableResult.memberType,
          status: mainTableResult.status,
          statusText: statusText,
        },
      });
    }

    // ========================================
    // 2. เช็คใน Draft Tables (ร่างของคนอื่น)
    // ========================================
    let draftResult = null;

    if (isIC) {
      // IC: เช็คใน IC_Draft
      const [existingDraft] = await query(
        `SELECT user_id FROM MemberRegist_IC_Draft 
         WHERE idcard = ? AND status = 3 
         LIMIT 1`,
        [uniqueId],
      );

      if (existingDraft && existingDraft.user_id !== userId) {
        draftResult = {
          memberType: "ic",
          userId: existingDraft.user_id,
        };
      }
    } else {
      // AM, AC, OC: เช็คใน Draft ของประเภทเดียวกัน
      const checkDraftQuery = `
        SELECT user_id FROM MemberRegist_${memberType.toUpperCase()}_Draft 
        WHERE tax_id = ? AND status = 3 
        LIMIT 1
      `;

      const [existingDraft] = await query(checkDraftQuery, [uniqueId]);

      if (existingDraft && existingDraft.user_id !== userId) {
        draftResult = {
          memberType: memberType,
          userId: existingDraft.user_id,
        };
      }
    }

    // ถ้าพบ draft ของคนอื่น → แจ้งเตือน (แต่ไม่บล็อคแบบเด็ดขาด)
    if (draftResult) {
      return NextResponse.json({
        success: true,
        available: false,
        reason: "draft",
        message: `${idFieldName} ${uniqueId} มีการบันทึกร่างโดยผู้ใช้อื่นอยู่แล้ว กรุณาใช้${idFieldName}อื่น หรือติดต่อเจ้าหน้าที่`,
        details: {
          uniqueId: uniqueId,
          memberType: draftResult.memberType,
          isDraft: true,
        },
      });
    }

    // ========================================
    // 3. ไม่พบซ้ำ → สามารถใช้ได้
    // ========================================
    return NextResponse.json({
      success: true,
      available: true,
      reason: null,
      message: `${idFieldName} ${uniqueId} สามารถใช้ได้`,
      details: {
        uniqueId: uniqueId,
        memberType: memberType,
      },
    });
  } catch (error) {
    console.error("Error checking unique ID:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบ",
      },
      { status: 500 },
    );
  }
}
