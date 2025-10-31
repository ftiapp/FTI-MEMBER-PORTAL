import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/admin/rejections
 * Get all rejected applications for admin view
 */
export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status"); // pending_fix, resolved, cancelled
    const membershipType = searchParams.get("type"); // oc, ac, am, ic
    const search = searchParams.get("search"); // search by name or identifier

    const offset = (page - 1) * limit;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;

    connection = await getConnection();

    // Build WHERE clause
    let whereConditions = ["1=1"];
    let queryParams = [];

    if (status) {
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    if (membershipType) {
      whereConditions.push("membership_type = ?");
      queryParams.push(membershipType);
    }

    if (search) {
      whereConditions.push("(application_name LIKE ? OR identifier LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Fetch rejections using view
    const listQuery = `
      SELECT 
        rejection_id,
        user_id,
        user_firstname,
        user_lastname,
        user_email,
        membership_type,
        membership_id,
        history_snapshot_id,
        rejected_by,
        admin_firstname,
        admin_lastname,
        rejected_at,
        rejection_reason,
        status,
        resubmission_count,
        resolved_at,
        last_conversation_at,
        unread_admin_count,
        application_name,
        identifier,
        current_application_status,
        conversation_count
      FROM v_rejections_with_details
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN unread_admin_count > 0 THEN 0 ELSE 1 END,
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
      userId: r.user_id,
      userName:
        r.user_firstname && r.user_lastname ? `${r.user_firstname} ${r.user_lastname}` : "N/A",
      userEmail: r.user_email || "N/A",
      membershipType: r.membership_type,
      membershipId: r.membership_id,
      historySnapshotId: r.history_snapshot_id,
      applicationName: r.application_name,
      identifier: r.identifier,
      currentStatus: r.current_application_status,
      rejectionStatus: r.status,
      rejectedAt: r.rejected_at,
      rejectedBy:
        r.admin_firstname && r.admin_lastname
          ? `${r.admin_firstname} ${r.admin_lastname}`
          : "Admin",
      rejectionReason: r.rejection_reason,
      resubmissionCount: r.resubmission_count,
      resolvedAt: r.resolved_at,
      lastConversationAt: r.last_conversation_at,
      conversationCount: r.conversation_count,
      unreadCount: r.unread_admin_count,
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
    console.error("Error fetching rejections (admin):", error);
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
