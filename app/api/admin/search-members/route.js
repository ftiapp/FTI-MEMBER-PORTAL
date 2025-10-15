import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET handler for searching members
 *
 * This endpoint searches for members by company name, MEMBER_CODE, or email
 * and returns matching results.
 */
export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get search term from query parameters
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("term") || "";

    if (searchTerm.length < 2) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุคำค้นหาอย่างน้อย 2 ตัวอักษร" },
        { status: 400 },
      );
    }

    // Search for members
    const membersResult = await query(
      `SELECT cm.id, cm.MEMBER_CODE, cm.company_name, cm.Admin_Submit, u.email
       FROM FTI_Original_Membership cm
       JOIN FTI_Portal_User u ON cm.user_id = u.id
       WHERE cm.company_name LIKE ? 
          OR cm.MEMBER_CODE LIKE ? 
          OR u.email LIKE ?
       ORDER BY cm.created_at DESC
       LIMIT 20`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
    );

    return NextResponse.json({
      success: true,
      data: membersResult,
    });
  } catch (error) {
    console.error("Error searching members:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการค้นหาข้อมูลสมาชิก" },
      { status: 500 },
    );
  }
}
