import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET /api/admin/member-verification-stats
 *
 * Returns statistics about member verification status
 * Requires admin authentication
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get total count
    const totalResult = await query(`
      SELECT COUNT(*) as total FROM FTI_Original_Membership
    `);

    // Get counts for each verification status with explicit type casting
    // This ensures we get proper numeric values for the counts
    const statusCounts = await query(`
      SELECT 
        CAST(Admin_Submit AS SIGNED) as status,
        COUNT(*) as count
      FROM 
        FTI_Original_Membership
      WHERE
        Admin_Submit IS NOT NULL
      GROUP BY 
        Admin_Submit
      ORDER BY 
        Admin_Submit
    `);

    console.log("Raw status counts:", JSON.stringify(statusCounts));

    const total = parseInt(totalResult[0]?.total) || 0;

    // Format the response with explicit number parsing
    const stats = {
      total,
      pending: 0, // Admin_Submit = 0
      approved: 0, // Admin_Submit = 1
      rejected: 0, // Admin_Submit = 2
      deleted: 0, // Admin_Submit = 3
    };

    // Map the counts to their respective categories with explicit parsing
    statusCounts.forEach((item) => {
      const status = parseInt(item.status);
      const count = parseInt(item.count);

      if (status === 0) stats.pending = count;
      else if (status === 1) stats.approved = count;
      else if (status === 2) stats.rejected = count;
      else if (status === 3) stats.deleted = count;

      console.log(`Mapped status ${status} with count ${count}`);
    });

    // Ensure we have numeric values
    Object.keys(stats).forEach((key) => {
      if (key !== "statusCounts") {
        stats[key] = parseInt(stats[key]) || 0;
      }
    });

    console.log("Final stats:", JSON.stringify(stats));

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching member verification stats:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติการยืนยันสมาชิก" },
      { status: 500 },
    );
  }
}
