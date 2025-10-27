import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/admin/rejected-applications-v3
 * Get all rejected applications for admin view (NEW SYSTEM)
 * Uses MemberRegist_Rejections table and History tables
 * Accessible by: Admin only
 */
export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status"); // pending_fix, pending_review, resolved, cancelled
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
      whereConditions.push("r.status = ?");
      queryParams.push(status);
    }

    if (membershipType) {
      whereConditions.push("r.membership_type = ?");
      queryParams.push(membershipType);
    }

    if (search) {
      whereConditions.push(
        "(application_name LIKE ? OR identifier LIKE ?)"
      );
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Fetch rejected applications with conversation data
    const listQuery = `
      SELECT 
        r.id as rejection_id,
        r.user_id,
        r.membership_type,
        r.membership_id,
        r.history_snapshot_id,
        r.rejected_by,
        r.rejected_at,
        r.rejection_reason,
        r.status,
        r.resubmission_count,
        r.resolved_by,
        r.resolved_at,
        r.last_conversation_at,
        r.unread_admin_count,
        r.unread_member_count,
        
        -- User info
        u.firstname as user_firstname,
        u.lastname as user_lastname,
        u.email as user_email,
        
        -- Admin info who rejected
        a.firstname as admin_firstname,
        a.lastname as admin_lastname,
        
        -- Application name based on type
        CASE 
          WHEN r.membership_type = 'oc' THEN (SELECT company_name_th FROM MemberRegist_Reject_OC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN r.membership_type = 'ac' THEN (SELECT company_name_th FROM MemberRegist_Reject_AC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN r.membership_type = 'am' THEN (SELECT company_name_th FROM MemberRegist_Reject_AM_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN r.membership_type = 'ic' THEN (SELECT CONCAT(first_name_th, ' ', last_name_th) FROM MemberRegist_Reject_IC_Main_History WHERE history_id = r.history_snapshot_id)
        END as application_name,
        
        -- Identifier based on type
        CASE 
          WHEN r.membership_type = 'oc' THEN (SELECT tax_id FROM MemberRegist_Reject_OC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN r.membership_type = 'ac' THEN (SELECT tax_id FROM MemberRegist_Reject_AC_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN r.membership_type = 'am' THEN (SELECT tax_id FROM MemberRegist_Reject_AM_Main_History WHERE history_id = r.history_snapshot_id)
          WHEN r.membership_type = 'ic' THEN (SELECT id_card_number FROM MemberRegist_Reject_IC_Main_History WHERE history_id = r.history_snapshot_id)
        END as identifier,
        
        -- Conversation count
        (SELECT COUNT(*) FROM MemberRegist_Rejection_Conversations c WHERE c.rejection_id = r.id) as conversation_count
        
      FROM MemberRegist_Rejections r
      LEFT JOIN FTI_Portal_User u ON r.user_id = u.id
      LEFT JOIN FTI_Portal_User a ON r.rejected_by = a.id
      WHERE ${whereClause}
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_OC_Main m1 WHERE m1.id = r.membership_id AND m1.status = 1 AND r.membership_type = 'oc'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_AC_Main m2 WHERE m2.id = r.membership_id AND m2.status = 1 AND r.membership_type = 'ac'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_AM_Main m3 WHERE m3.id = r.membership_id AND m3.status = 1 AND r.membership_type = 'am'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_IC_Main m4 WHERE m4.id = r.membership_id AND m4.status = 1 AND r.membership_type = 'ic'
        )
      ORDER BY 
        CASE r.status 
          WHEN 'pending_review' THEN 1
          WHEN 'pending_fix' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'cancelled' THEN 4
        END,
        CASE WHEN r.unread_admin_count > 0 THEN 0 ELSE 1 END,
        r.last_conversation_at DESC,
        r.rejected_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rejectedApps] = await connection.execute(listQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM MemberRegist_Rejections r
      LEFT JOIN FTI_Portal_User u ON r.user_id = u.id
      LEFT JOIN FTI_Portal_User a ON r.rejected_by = a.id
      WHERE ${whereClause}
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_OC_Main m1 WHERE m1.id = r.membership_id AND m1.status = 1 AND r.membership_type = 'oc'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_AC_Main m2 WHERE m2.id = r.membership_id AND m2.status = 1 AND r.membership_type = 'ac'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_AM_Main m3 WHERE m3.id = r.membership_id AND m3.status = 1 AND r.membership_type = 'am'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM MemberRegist_IC_Main m4 WHERE m4.id = r.membership_id AND m4.status = 1 AND r.membership_type = 'ic'
        )
    `;

    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Format response data
    const formattedData = rejectedApps.map((app) => ({
      id: app.rejection_id,
      userId: app.user_id,
      userName: app.user_firstname && app.user_lastname 
        ? `${app.user_firstname} ${app.user_lastname}`
        : "N/A",
      userEmail: app.user_email || "N/A",
      membershipType: app.membership_type,
      membershipId: app.membership_id,
      applicationName: app.application_name || "N/A",
      identifier: app.identifier || "N/A",
      status: app.status,
      rejectStatus: app.status, // Keep for compatibility
      resubmissionCount: app.resubmission_count || 0,
      rejectedAt: app.rejected_at,
      resolvedAt: app.resolved_at,
      lastConversationAt: app.last_conversation_at,
      conversationCount: app.conversation_count || 0,
      unreadCount: app.unread_admin_count || 0,
      rejectedBy: app.admin_firstname && app.admin_lastname 
        ? `${app.admin_firstname} ${app.admin_lastname}`
        : "N/A",
      rejectionReason: app.rejection_reason
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
    console.error("Error fetching rejected applications (admin v3):", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
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
