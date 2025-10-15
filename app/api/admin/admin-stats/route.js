import { getAdminFromSession } from "../../../lib/adminAuth";
import { query } from "../../../lib/db";

export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get admin statistics
    const adminStatsQuery = `
      SELECT
        COUNT(*) AS total_admins,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_admins,
        SUM(CASE WHEN admin_level = 5 THEN 1 ELSE 0 END) AS super_admins,
        SUM(CASE WHEN can_create = 1 THEN 1 ELSE 0 END) AS create_admins,
        SUM(CASE WHEN can_update = 1 THEN 1 ELSE 0 END) AS update_admins,
        MAX(created_at) AS latest_admin_created
      FROM FTI_Portal_Admin_Users
    `;

    const [adminStats] = await query(adminStatsQuery);

    // Get admin list (only if current admin is super admin)
    let adminList = [];
    if (admin.adminLevel === 5 || admin.admin_level === 5) {
      const adminListQuery = `
        SELECT 
          id, username, name, admin_level, is_active, can_create, can_update, 
          created_at, updated_at, created_by
        FROM FTI_Portal_Admin_Users
        ORDER BY created_at DESC
        LIMIT 5
      `;

      adminList = await query(adminListQuery);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalAdmins: adminStats.total_admins || 0,
          activeAdmins: adminStats.active_admins || 0,
          superAdmins: adminStats.super_admins || 0,
          createAdmins: adminStats.create_admins || 0,
          updateAdmins: adminStats.update_admins || 0,
          latestAdminCreated: adminStats.latest_admin_created || null,
        },
        recentAdmins: adminList,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
