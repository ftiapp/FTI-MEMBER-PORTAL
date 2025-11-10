import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";
import { logAdminAction } from "@/app/lib/admin-log";

/**
 * GET /api/admin/FTI_Portal_User
 *
 * Fetches a paginated list of FTI_Portal_User for admin management.
 * Requires admin authentication.
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Build search condition if search term is provided
    let searchCondition = "";
    let queryParams = [];

    if (search) {
      searchCondition = `WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      queryParams = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    // Query to get total count
    const countQuery = `SELECT COUNT(*) as total FROM FTI_Portal_User ${searchCondition}`;
    const countResult = await query(countQuery, queryParams);
    const total = countResult[0].total;

    // Query to get paginated FTI_Portal_User
    const usersQuery = `
      SELECT id, name, firstname, lastname, email, phone, status, email_verified, created_at, updated_at, login_count
      FROM FTI_Portal_User
      ${searchCondition}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const FTI_Portal_User = await query(usersQuery, queryParams);

    return NextResponse.json({
      success: true,
      FTI_Portal_User,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching FTI_Portal_User:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/FTI_Portal_User
 *
 * Deletes FTI_Portal_User by IDs.
 * Requires admin authentication.
 */
export async function DELETE(request) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get user IDs from request body
    const { userIds } = await request.json();
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ ID ผู้ใช้ที่ต้องการลบ" },
        { status: 400 },
      );
    }

    // Validate that all users have unverified emails
    const placeholders = userIds.map(() => "?").join(",");
    const users = await query(
      `SELECT id, email, email_verified FROM FTI_Portal_User WHERE id IN (${placeholders})`,
      userIds,
    );

    const unverifiedUsers = users.filter((user) => user.email_verified === 0);
    if (unverifiedUsers.length !== userIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "สามารถลบได้เฉพาะผู้ใช้ที่ยังไม่ได้ยืนยันอีเมลเท่านั้น",
        },
        { status: 400 },
      );
    }

    // Get IP address and user agent for logging
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // Log each deletion
    for (const user of unverifiedUsers) {
      await logAdminAction({
        adminId: admin.id,
        actionType: "delete_user",
        targetId: user.id,
        description: `ลบผู้ใช้ที่ยังไม่ได้ยืนยันอีเมล - Email: ${user.email}, ID: ${user.id}`,
        ipAddress,
        userAgent,
      });
    }

    // Delete the users
    await query(`DELETE FROM FTI_Portal_User WHERE id IN (${placeholders})`, userIds);

    return NextResponse.json({
      success: true,
      message: `ลบผู้ใช้ ${userIds.length} รายการเรียบร้อยแล้ว`,
      deletedCount: userIds.length,
    });
  } catch (error) {
    console.error("Error deleting FTI_Portal_User:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบผู้ใช้" },
      { status: 500 },
    );
  }
}
