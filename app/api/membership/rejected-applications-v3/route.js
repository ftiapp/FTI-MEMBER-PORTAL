import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET rejected applications for current user (v3 - NEW SYSTEM)
 * 
 * Uses MemberRegist_Rejections table and History tables
 * Returns applications with conversation counts
 */

export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    connection = await getConnection();

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    // Validate limit and offset
    const safeLimit = Math.max(1, Math.min(100, limit));
    const safeOffset = Math.max(0, offset);

    // Query from MemberRegist_Rejections table
    const query = `
      SELECT 
        r.id as rejection_id,
        r.membership_type as type,
        r.membership_id as id,
        r.rejection_reason,
        r.rejected_at,
        r.status,
        r.resubmission_count,
        r.resolved_at,
        (SELECT COUNT(*) FROM MemberRegist_Rejection_Conversations 
         WHERE rejection_id = r.id) as conversation_count,
        
        -- Get name from History tables based on type
        CASE r.membership_type
          WHEN 'oc' THEN (SELECT company_name_th FROM MemberRegist_Reject_OC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN 'ac' THEN (SELECT company_name_th FROM MemberRegist_Reject_AC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN 'am' THEN (SELECT company_name_th FROM MemberRegist_Reject_AM_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN 'ic' THEN (SELECT CONCAT(first_name_th, ' ', last_name_th) FROM MemberRegist_Reject_IC_Main_History WHERE history_id = r.history_snapshot_id)
        END as name,
        
        -- Get identifier from History tables based on type
        CASE r.membership_type
          WHEN 'oc' THEN (SELECT tax_id FROM MemberRegist_Reject_OC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN 'ac' THEN (SELECT tax_id FROM MemberRegist_Reject_AC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN 'am' THEN (SELECT tax_id FROM MemberRegist_Reject_AM_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN 'ic' THEN (SELECT id_card_number FROM MemberRegist_Reject_IC_Main_History WHERE history_id = r.history_snapshot_id)
        END as identifier
        
      FROM MemberRegist_Rejections r
      WHERE r.user_id = ? 
        AND r.status IN ('pending_fix', 'pending_review', 'resolved')
      ORDER BY 
        CASE r.status 
          WHEN 'pending_review' THEN 1
          WHEN 'pending_fix' THEN 2
          WHEN 'resolved' THEN 3
        END,
        r.rejected_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [applications] = await connection.execute(query, [user.id]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM MemberRegist_Rejections 
      WHERE user_id = ? AND status IN ('pending_fix', 'pending_review', 'resolved')
    `;

    const [countResult] = await connection.execute(countQuery, [user.id]);
    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data: applications.map(app => ({
        id: app.id,
        type: app.type,
        name: app.name,
        identifier: app.identifier,
        status: app.status,
        statusLabel: app.status === 'pending_review' ? 'รอการตรวจสอบ (แก้ไขแล้ว)' : 
                     app.status === 'pending_fix' ? 'รอแก้ไข' : 'แก้ไขแล้ว',
        rejectionReason: app.rejection_reason,
        rejectedAt: app.rejected_at,
        resolvedAt: app.resolved_at,
        resubmissionCount: app.resubmission_count || 0,
        conversationCount: app.conversation_count || 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching rejected applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลได้",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
