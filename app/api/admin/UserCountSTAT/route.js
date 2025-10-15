import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET /api/admin/UserCountStat
 *
 * Returns simplified statistics about FTI_Portal_User for dashboard display
 * Requires admin authentication
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get total FTI_Portal_User
    const totalUsersQuery = `
      SELECT COUNT(*) as total FROM FTI_Portal_User
    `;
    const totalUsersResult = await query(totalUsersQuery);
    const totalUsers = parseInt(totalUsersResult[0]?.total) || 0;

    // Get pending FTI_Portal_User
    const pendingUsersQuery = `
      SELECT COUNT(*) as count
      FROM FTI_Portal_User
      WHERE status = 'pending'
    `;
    const pendingUsersResult = await query(pendingUsersQuery);
    const pendingUsers = parseInt(pendingUsersResult[0]?.count) || 0;

    // Get active FTI_Portal_User
    const activeUsersQuery = `
      SELECT COUNT(*) as count
      FROM FTI_Portal_User
      WHERE status = 'active'
    `;
    const activeUsersResult = await query(activeUsersQuery);
    const activeUsers = parseInt(activeUsersResult[0]?.count) || 0;

    // Get inactive FTI_Portal_User
    const inactiveUsersQuery = `
      SELECT COUNT(*) as count
      FROM FTI_Portal_User
      WHERE status = 'inactive'
    `;
    const inactiveUsersResult = await query(inactiveUsersQuery);
    const inactiveUsers = parseInt(inactiveUsersResult[0]?.count) || 0;

    // Get FTI_Portal_User by role
    const usersByRoleQuery = `
      SELECT role, COUNT(*) as count
      FROM FTI_Portal_User
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
