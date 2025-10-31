import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

export async function GET(request) {
  let connection;

  try {
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    // Ensure limit/offset are safe integers
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;

    // Fetch rejected applications using the view with conversation data
    const listQuery = `
      SELECT 
        reject_id,
        user_id,
        membership_type,
        membership_id,
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
      FROM v_rejected_applications_with_conversations
      WHERE user_id = ? AND reject_status = 0
      ORDER BY last_conversation_at DESC, rejected_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rejectedApps] = await connection.execute(listQuery, [userId]);

    // Get total count
    const [countResult] = await connection.execute(
      `
      SELECT COUNT(*) as total 
      FROM MemberRegist_Reject_DATA 
      WHERE user_id = ? AND is_active = 1 AND status = 0
    `,
      [userId],
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Format response data
    const formattedData = rejectedApps.map((app) => ({
      id: app.reject_id,
      membershipType: app.membership_type,
      membershipId: app.membership_id,
      applicationName: app.application_name,
      identifier: app.identifier,
      status: app.application_status,
      resubmissionCount: app.resubmission_count,
      rejectedAt: app.rejected_at,
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
    console.error("Error fetching rejected applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rejected applications",
      },
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
