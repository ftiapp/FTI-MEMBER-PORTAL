import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET /api/admin/profile_update_stat
 *
 * Returns statistics about profile update requests
 * Requires admin authentication
 */
export async function GET(request) {
  try {
    // Check admin session using the same method as other working APIs
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get total count
    const totalResult = await query(`
      SELECT COUNT(*) as total FROM profile_update_requests
    `);

    // Get counts for each status
    const statusCounts = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM 
        profile_update_requests
      GROUP BY 
        status
    `);

    console.log("Raw profile update status counts:", JSON.stringify(statusCounts));

    const total = parseInt(totalResult[0]?.total) || 0;

    // Format the response
    const stats = {
      total,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    // Map the counts to their respective categories
    statusCounts.forEach((item) => {
      if (item.status === "pending") stats.pending = parseInt(item.count) || 0;
      else if (item.status === "approved") stats.approved = parseInt(item.count) || 0;
      else if (item.status === "rejected") stats.rejected = parseInt(item.count) || 0;
    });

    console.log("Final profile update stats:", JSON.stringify(stats));

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching profile update stats:", error);

    // Check if the error is about missing table
    if (error.message && error.message.includes("doesn't exist")) {
      console.log("Table does not exist yet, returning empty data");
      return NextResponse.json({
        success: true,
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        message: "No table data yet",
      });
    }

    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติการเปลี่ยนข้อมูลส่วนตัว" },
      { status: 500 },
    );
  }
}
