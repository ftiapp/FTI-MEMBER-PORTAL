import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET /api/admin/UserCountStat
 *
 * Returns simplified statistics about users for dashboard display
 * Requires admin authentication
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get total users
    const totalUsersQuery = `
      SELECT COUNT(*) as total FROM users
    `;
    const totalUsersResult = await query(totalUsersQuery);
    const totalUsers = parseInt(totalUsersResult[0]?.total) || 0;

    // Get pending users
    const pendingUsersQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE status = 'pending'
    `;
    const pendingUsersResult = await query(pendingUsersQuery);
    const pendingUsers = parseInt(pendingUsersResult[0]?.count) || 0;

    // Get active users
    const activeUsersQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE status = 'active'
    `;
    const activeUsersResult = await query(activeUsersQuery);
    const activeUsers = parseInt(activeUsersResult[0]?.count) || 0;

    // Get inactive users
    const inactiveUsersQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE status = 'inactive'
    `;
    const inactiveUsersResult = await query(inactiveUsersQuery);
    const inactiveUsers = parseInt(inactiveUsersResult[0]?.count) || 0;

    // Get users by role
    const usersByRoleQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;
    const usersByRoleResult = await query(usersByRoleQuery);

    // Format role counts
    const roleCounts = {
      admin: 0,
      member: 0,
    };

    usersByRoleResult.forEach((item) => {
      if (item.role && roleCounts.hasOwnProperty(item.role)) {
        roleCounts[item.role] = parseInt(item.count) || 0;
      }
    });

    return NextResponse.json({
      success: true,
      counts: {
        total: totalUsers,
        pending: pendingUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        roleCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching user count statistics:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนผู้ใช้งาน" },
      { status: 500 },
    );
  }
}
