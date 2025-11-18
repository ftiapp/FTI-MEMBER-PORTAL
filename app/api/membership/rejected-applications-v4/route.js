import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

// V4: Rejected applications list based on main membership tables (no Rejections/History)
export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    connection = await getConnection();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    const safeLimit = Math.max(1, Math.min(100, limit));
    const safeOffset = Math.max(0, offset);

    // Combine rejected applications from all main tables (status = 2)
    const listQuery = `
      SELECT * FROM (
        SELECT 
          'oc' AS type,
          m.id AS id,
          m.company_name_th AS name,
          m.tax_id AS identifier,
          m.rejection_reason AS rejection_reason,
          m.rejected_at AS rejected_at,
          NULL AS resolved_at,
          0 AS resubmission_count,
          0 AS conversation_count
        FROM MemberRegist_OC_Main m
        WHERE m.user_id = ? AND m.status = 2

        UNION ALL

        SELECT 
          'ac' AS type,
          m.id AS id,
          m.company_name_th AS name,
          m.tax_id AS identifier,
          m.rejection_reason AS rejection_reason,
          m.rejected_at AS rejected_at,
          NULL AS resolved_at,
          0 AS resubmission_count,
          0 AS conversation_count
        FROM MemberRegist_AC_Main m
        WHERE m.user_id = ? AND m.status = 2

        UNION ALL

        SELECT 
          'am' AS type,
          m.id AS id,
          m.company_name_th AS name,
          m.tax_id AS identifier,
          m.rejection_reason AS rejection_reason,
          m.rejected_at AS rejected_at,
          NULL AS resolved_at,
          0 AS resubmission_count,
          0 AS conversation_count
        FROM MemberRegist_AM_Main m
        WHERE m.user_id = ? AND m.status = 2

        UNION ALL

        SELECT 
          'ic' AS type,
          m.id AS id,
          CONCAT(m.first_name_th, ' ', m.last_name_th) AS name,
          m.id_card_number AS identifier,
          m.rejection_reason AS rejection_reason,
          m.rejected_at AS rejected_at,
          NULL AS resolved_at,
          0 AS resubmission_count,
          0 AS conversation_count
        FROM MemberRegist_IC_Main m
        WHERE m.user_id = ? AND m.status = 2
      ) AS t
      ORDER BY t.rejected_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const params = [user.id, user.id, user.id, user.id];
    const [rows] = await connection.execute(listQuery, params);

    const countQuery = `
      SELECT COUNT(*) AS total FROM (
        SELECT id FROM MemberRegist_OC_Main WHERE user_id = ? AND status = 2
        UNION ALL
        SELECT id FROM MemberRegist_AC_Main WHERE user_id = ? AND status = 2
        UNION ALL
        SELECT id FROM MemberRegist_AM_Main WHERE user_id = ? AND status = 2
        UNION ALL
        SELECT id FROM MemberRegist_IC_Main WHERE user_id = ? AND status = 2
      ) AS x
    `;

    const [countRows] = await connection.execute(countQuery, params);
    const total = countRows[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: rows.map((app) => ({
        id: app.id,
        type: app.type,
        name: app.name,
        identifier: app.identifier,
        status: "pending_fix", // V4: ใช้สถานะเดียวสำหรับใบที่ถูกปฏิเสธให้ผู้ใช้แก้ไข
        statusLabel: "รอแก้ไข",
        rejectionReason: app.rejection_reason,
        rejectedAt: app.rejected_at,
        resolvedAt: app.resolved_at,
        resubmissionCount: app.resubmission_count || 0,
        conversationCount: app.conversation_count || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[V4] Error fetching rejected applications:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถโหลดข้อมูลได้" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
