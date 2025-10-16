import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/app/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const memberType = searchParams.get("type");

    let drafts = [];
    const memberTypes = memberType ? [memberType] : ["oc", "ic", "am", "ac"];

    for (const type of memberTypes) {
      const queryDrafts = `
        SELECT id, draft_data, current_step, created_at, updated_at
        FROM MemberRegist_${type.toUpperCase()}_Draft 
        WHERE user_id = ? AND status = 3
        ORDER BY updated_at DESC
      `;

      const result = await query(queryDrafts, [userId]);

      if (result && result.length > 0) {
        for (const draft of result) {
          try {
            let draftData = draft.draft_data;
            // Handle both string and object formats
            if (typeof draft.draft_data === "string") {
              draftData = JSON.parse(draft.draft_data);
            }

            // ตรวจสอบว่า tax_id/id_card มีอยู่ในระบบแล้วหรือไม่
            let warning = null;
            let warningType = null;
            let uniqueId = null;

            if (type.toLowerCase() === "ic") {
              uniqueId = draftData.idCardNumber || draftData.idcard || null;
              if (uniqueId) {
                // เช็คใน IC Main table
                const [existingIC] = await query(
                  `SELECT status FROM MemberRegist_IC_Main WHERE id_card_number = ? AND (status = 0 OR status = 1) LIMIT 1`,
                  [uniqueId]
                );
                if (existingIC) {
                  const statusText = existingIC.status === 0 ? "อยู่ระหว่างการพิจารณา" : "เป็นสมาชิกแล้ว";
                  warning = `หมายเลขบัตรประชาชน ${uniqueId} ${statusText} กรุณาใช้หมายเลขอื่น หรือติดต่อเรา`;
                  warningType = existingIC.status === 0 ? "pending" : "approved";
                }
              }
            } else {
              uniqueId = draftData.taxId || draftData.tax_id || null;
              if (uniqueId) {
                // เช็คข้ามตาราง AM, AC, OC
                const checkQuery = `
                  SELECT 'am' as member_type, status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1)
                  UNION ALL
                  SELECT 'ac' as member_type, status FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1)
                  UNION ALL
                  SELECT 'oc' as member_type, status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1)
                  LIMIT 1
                `;
                const [existing] = await query(checkQuery, [uniqueId, uniqueId, uniqueId]);
                if (existing) {
                  const memberTypeNames = {
                    am: "สมาคมการค้า",
                    ac: "สมทบ-นิติบุคคล",
                    oc: "สามัญ-โรงงาน"
                  };
                  const statusText = existing.status === 0 ? "อยู่ระหว่างการพิจารณา" : "เป็นสมาชิกแล้ว";
                  const memberTypeName = memberTypeNames[existing.member_type] || "";
                  warning = `เลขประจำตัวผู้เสียภาษี ${uniqueId} ${statusText}ในประเภท${memberTypeName} กรุณาใช้เลขอื่น หรือติดต่อเรา`;
                  warningType = existing.status === 0 ? "pending" : "approved";
                }
              }
            }

            drafts.push({
              id: draft.id,
              type: type.toLowerCase(),
              memberType: type,
              draftData,
              currentStep: draft.current_step,
              createdAt: draft.created_at,
              updatedAt: draft.updated_at,
              companyName: draftData.companyName || draftData.company_name || "ไม่มีชื่อบริษัท",
              lastUpdated: draft.updated_at,
              warning: warning,
              warningType: warningType,
              uniqueId: uniqueId,
            });
          } catch (e) {
            console.error("Error parsing draft data:", e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
