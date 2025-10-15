import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminSession } from "../../../lib/auth";
import { pool } from "../../../lib/db";

/**
 * API endpoint to count pending product update requests
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function GET(request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const admin = await checkAdminSession(cookieStore);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ดูแลระบบ กรุณาเข้าสู่ระบบใหม่",
        },
        { status: 401 },
      );
    }

    // Check if the table exists
    const [tableExists] = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'FTI_Original_Membership_Pending_Product_Updates'
    `);

    if (tableExists[0].count === 0) {
      // Table doesn't exist yet, so there are no pending requests
      return NextResponse.json({
        success: true,
        count: 0,
      });
    }

    // Count pending product update requests
    const [result] = await pool.query(`
      SELECT COUNT(*) as count
      FROM FTI_Original_Membership_Pending_Product_Updates
      WHERE status = 'pending'
    `);

    return NextResponse.json({
      success: true,
      count: result[0].count,
    });
  } catch (error) {
    console.error("Error counting pending product updates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการนับจำนวนคำขอแก้ไขข้อมูลสินค้าที่รออนุมัติ",
      },
      { status: 500 },
    );
  }
}
