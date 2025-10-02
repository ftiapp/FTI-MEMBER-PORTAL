import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET /api/admin/AlluserSTAT
 *
 * Returns statistics about user logins and activity
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

    // Get users by status
    const usersByStatusQuery = `
      SELECT status, COUNT(*) as count
      FROM users
      GROUP BY status
    `;
    const usersByStatusResult = await query(usersByStatusQuery);

    // Get users by role
    const usersByRoleQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;
    const usersByRoleResult = await query(usersByRoleQuery);

    // Get total login count
    const totalLoginsQuery = `
      SELECT SUM(login_count) as total_logins
      FROM users
    `;
    const totalLoginsResult = await query(totalLoginsQuery);
    const totalLogins = parseInt(totalLoginsResult[0]?.total_logins) || 0;

    // Get average login count
    const avgLoginsQuery = `
      SELECT AVG(login_count) as avg_logins
      FROM users
      WHERE login_count > 0
    `;
    const avgLoginsResult = await query(avgLoginsQuery);
    const avgLogins = parseFloat(avgLoginsResult[0]?.avg_logins) || 0;

    // Get most active users (top 5 by login count)
    const mostActiveUsersQuery = `
      SELECT id, name, email, login_count
      FROM users
      ORDER BY login_count DESC
      LIMIT 5
    `;
    const mostActiveUsersResult = await query(mostActiveUsersQuery);

    // Get users who never logged in
    const neverLoggedInQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE login_count = 0
    `;
    const neverLoggedInResult = await query(neverLoggedInQuery);
    const neverLoggedIn = parseInt(neverLoggedInResult[0]?.count) || 0;

    // Format status counts
    const statusCounts = {
      active: 0,
      inactive: 0,
      pending: 0,
    };

    usersByStatusResult.forEach((item) => {
      if (item.status && statusCounts.hasOwnProperty(item.status)) {
        statusCounts[item.status] = parseInt(item.count) || 0;
      }
    });

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
      stats: {
        totalUsers,
        statusCounts,
        roleCounts,
        loginStats: {
          totalLogins,
          avgLogins: Math.round(avgLogins * 10) / 10, // Round to 1 decimal
          neverLoggedIn,
          mostActiveUsers: mostActiveUsersResult,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ใช้งาน" },
      { status: 500 },
    );
  }
}
