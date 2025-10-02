import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * API endpoint for getting the count of pending address update requests
 */
export async function GET(request) {
  try {
    // Get admin from session
    const admin = await getAdminFromSession();

    // Verify admin session
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูล session ของผู้ดูแลระบบ กรุณาเข้าสู่ระบบใหม่" },
        { status: 401 },
      );
    }

    const adminId = admin.id;

    // ข้ามการตรวจสอบสิทธิ์แอดมิน เนื่องจากไม่จำเป็นต้องตรวจสอบ role

    // Get count of pending address update requests
    const countQuery = `
      SELECT COUNT(*) as count FROM pending_address_updates WHERE status = 'pending'
    `;

    const countResult = await query(countQuery);

    const count = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error in get pending address updates count API:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการประมวลผล" },
      { status: 500 },
    );
  }
}
