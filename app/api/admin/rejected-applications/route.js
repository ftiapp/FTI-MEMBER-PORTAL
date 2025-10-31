import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/admin/rejected-applications
 * Get all rejected applications for admin view
 * Accessible by: Admin only
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
    const status = searchParams.get("status"); // 0=active, 1=resolved, 2=cancelled
    const membershipType = searchParams.get("type"); // oc, ac, am, ic
    const search = searchParams.get("search"); // search by name or identifier

    const offset = (page - 1) * limit;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;

    connection = await getConnection();

    // Build WHERE clause
    let whereConditions = ["r.is_active = 1"];
    let queryParams = [];

    if (status !== null && status !== undefined && status !== "") {
      whereConditions.push("r.status = ?");
      queryParams.push(parseInt(status));
    }

    if (membershipType) {
      whereConditions.push("r.membership_type = ?");
      queryParams.push(membershipType);
    }

    if (search) {
      whereConditions.push("(v.application_name LIKE ? OR v.identifier LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Fetch rejected applications with conversation data
    const listQuery = `
      SELECT 
        reject_id,
        user_id,
        membership_type,
        membership_id,
        admin_id,
        reject_status,
        resubmission_count,
        rejected_at,
        resolved_at,
        last_conversation_at,
        unread_count,
        application_name,
        identifier,
        application_status,
        conversation_count
      FROM v_rejected_applications_with_conversations v
      JOIN MemberRegist_Reject_DATA r ON v.reject_id = r.id
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN r.unread_count > 0 THEN 0 ELSE 1 END,
        r.last_conversation_at DESC,
        r.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rejectedApps] = await connection.execute(listQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM v_rejected_applications_with_conversations v
      JOIN MemberRegist_Reject_DATA r ON v.reject_id = r.id
      WHERE ${whereClause}
    `;

    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get user info for each application
    const userIds = [...new Set(rejectedApps.map((app) => app.user_id))];
    let users = {};

    if (userIds.length > 0) {
      const placeholders = userIds.map(() => "?").join(",");
      const [userResults] = await connection.execute(
        `SELECT id, firstname, lastname, email FROM FTI_Portal_User WHERE id IN (${placeholders})`,
        userIds,
      );

      users = userResults.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    }

    // Format response data
    const formattedData = rejectedApps.map((app) => ({
      id: app.reject_id,
      userId: app.user_id,
      userName: users[app.user_id]
        ? `${users[app.user_id].firstname} ${users[app.user_id].lastname}`
        : "N/A",
      userEmail: users[app.user_id]?.email || "N/A",
      membershipType: app.membership_type,
      membershipId: app.membership_id,
      applicationName: app.application_name,
      identifier: app.identifier,
      applicationStatus: app.application_status,
      rejectStatus: app.reject_status,
      resubmissionCount: app.resubmission_count,
      rejectedAt: app.rejected_at,
      resolvedAt: app.resolved_at,
      lastConversationAt: app.last_conversation_at,
      conversationCount: app.conversation_count,
      unreadCount: app.unread_count,
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
    console.error("Error fetching rejected applications (admin):", error);
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
