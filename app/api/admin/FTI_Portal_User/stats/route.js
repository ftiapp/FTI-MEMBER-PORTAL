import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

/**
 * GET /api/admin/FTI_Portal_User/stats
 *
 * Returns statistics about FTI_Portal_User (verified vs unverified emails).
 * Requires admin authentication.
 */
export async function GET() {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Query to get verified and unverified counts
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN email_verified = 0 THEN 1 ELSE 0 END) as unverified
      FROM FTI_Portal_User
    `;
    const statsResult = await query(statsQuery);
    const stats = statsResult[0];

    return NextResponse.json({
      success: true,
      stats: {
        total: stats.total,
        verified: stats.verified,
        unverified: stats.unverified,
      },
    });
  } catch (error) {
    console.error("Error fetching FTI_Portal_User stats:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ" },
      { status: 500 },
    );
  }
}
