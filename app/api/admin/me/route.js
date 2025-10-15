import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../lib/adminAuth";
import { query } from "../../../lib/db";

export async function GET() {
  try {
    // Get admin from session
    const adminSession = await getAdminFromSession();

    if (!adminSession) {
      return NextResponse.json({ success: false, message: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    // Fetch additional admin details from database if needed
    const admins = await query(
      `SELECT id, username, admin_level, is_active, can_create, can_update 
       FROM FTI_Portal_Admin_Users 
       WHERE id = ? AND is_active = TRUE 
       LIMIT 1`,
      [adminSession.id],
    );

    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ดูแลระบบ" },
        { status: 404 },
      );
    }

    const admin = admins[0];

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        adminLevel: admin.admin_level,
        isActive: admin.is_active,
        canCreate: admin.can_create,
        canUpdate: admin.can_update,
      },
    });
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ" },
      { status: 500 },
    );
  }
}
