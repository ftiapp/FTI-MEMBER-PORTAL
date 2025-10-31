import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/member/rejections
 * Get all rejected applications for the logged-in member
 */
export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status"); // pending_fix, resolved, cancelled

    const offset = (page - 1) * limit;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;

    connection = await getConnection();

    // Build WHERE clause
    let whereConditions = ["user_id = ?"];
    let queryParams = [user.id];

    if (status) {
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(" AND ");

    // Fetch rejections using view
    const listQuery = `
      SELECT 
        rejection_id,
        membership_type,
        membership_id,
        history_snapshot_id,
        rejected_at,
        rejection_reason,
        status,
        resubmission_count,
        last_conversation_at,
        unread_member_count,
        application_name,
        identifier,
        current_application_status,
        conversation_count,
        admin_firstname,
        admin_lastname
      FROM v_rejections_with_details
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN unread_member_count > 0 THEN 0 ELSE 1 END,
        last_conversation_at DESC,
        rejected_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rejections] = await connection.execute(listQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM MemberRegist_Rejections
      WHERE ${whereClause}
    `;

    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Format response
    const formattedData = rejections.map((r) => ({
      id: r.rejection_id,
      membershipType: r.membership_type,
      membershipId: r.membership_id,
      historySnapshotId: r.history_snapshot_id,
      applicationName: r.application_name,
      identifier: r.identifier,
      currentStatus: r.current_application_status,
      rejectionStatus: r.status,
      rejectedAt: r.rejected_at,
      rejectionReason: r.rejection_reason,
      resubmissionCount: r.resubmission_count,
      lastConversationAt: r.last_conversation_at,
      conversationCount: r.conversation_count,
      unreadCount: r.unread_member_count,
      rejectedBy:
        r.admin_firstname && r.admin_lastname
          ? `${r.admin_firstname} ${r.admin_lastname}`
          : "Admin",
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching rejections:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
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
