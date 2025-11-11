import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Query to get counts for each status
    const countsQuery = `
      SELECT
        (SELECT COUNT(*) FROM FTI_Original_Membership WHERE Admin_Submit = 0) AS pending_count,
        (SELECT COUNT(*) FROM FTI_Original_Membership WHERE Admin_Submit = 1) AS approved_count,
        (SELECT COUNT(*) FROM FTI_Original_Membership WHERE Admin_Submit = 2) AS rejected_count
    `;

    const [countsResult] = await query(countsQuery);

    return NextResponse.json({
      success: true,
      counts: {
        pending: countsResult.pending_count || 0,
        approved: countsResult.approved_count || 0,
        rejected: countsResult.rejected_count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching verify status counts:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนสมาชิก" },
      { status: 500 },
    );
  }
}
