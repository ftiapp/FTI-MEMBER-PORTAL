import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

/**
 * GET /api/admin/user-stats
 * 
 * Fetches user statistics for the admin dashboard.
 * Includes counts of active, inactive, and pending users,
 * average login count, and the most active user.
 * Requires admin authentication.
 */
export async function GET() {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    // Query to get user status counts
    const statusCountsQuery = `
      SELECT 
        SUM(CASE WHEN status = 'active' AND email_verified = 1 THEN 1 ELSE 0 END) as totalActiveUsers,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as totalInactiveUsers,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as totalPendingUsers,
        COUNT(*) as totalUsers
      FROM users
    `;
    const statusCounts = await query(statusCountsQuery);

    // Query to get average login count
    const avgLoginQuery = `
      SELECT AVG(login_count) as averageLoginCount
      FROM users
      WHERE login_count IS NOT NULL
    `;
    const avgLoginResult = await query(avgLoginQuery);

    // Query to get most active user
    const mostActiveUserQuery = `
      SELECT id, name, firstname, lastname, email, login_count
      FROM users
      WHERE login_count IS NOT NULL
      ORDER BY login_count DESC
      LIMIT 1
    `;
    const mostActiveUserResult = await query(mostActiveUserQuery);

    // Prepare the response
    const stats = {
      success: true,
      totalUsers: parseInt(statusCounts[0].totalUsers || 0),
      totalActiveUsers: parseInt(statusCounts[0].totalActiveUsers || 0),
      totalInactiveUsers: parseInt(statusCounts[0].totalInactiveUsers || 0),
      totalPendingUsers: parseInt(statusCounts[0].totalPendingUsers || 0),
      averageLoginCount: parseFloat(avgLoginResult[0].averageLoginCount || 0),
      mostActiveUser: mostActiveUserResult.length > 0 
        ? {
            id: mostActiveUserResult[0].id,
            firstname: mostActiveUserResult[0].firstname || '',
            lastname: mostActiveUserResult[0].lastname || '',
            name: mostActiveUserResult[0].name || `${mostActiveUserResult[0].firstname} ${mostActiveUserResult[0].lastname}`,
            email: mostActiveUserResult[0].email,
            login_count: mostActiveUserResult[0].login_count
          }
        : null
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ใช้' },
      { status: 500 }
    );
  }
}
