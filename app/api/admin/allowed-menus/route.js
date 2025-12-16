import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../lib/adminAuth";
import { query } from "../../../lib/db";

export async function GET() {
  try {
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // SuperAdmin: allow all active menus
    if (Number(admin.adminLevel) >= 5) {
      const rows = await query(
        `SELECT id, code, title, path
         FROM FTI_Portal_Admin_Menus
         WHERE is_active = 1
         ORDER BY COALESCE(parent_id, 0), sort_order, id`,
      );
      return NextResponse.json({ success: true, data: rows });
    }

    // Regular admin: allow only assigned menus
    const rows = await query(
      `SELECT m.id, m.code, m.title, m.path
       FROM FTI_Portal_Admin_Menus m
       JOIN FTI_Portal_Admin_User_Menus um
         ON um.menu_id = m.id
       WHERE um.user_id = ?
         AND um.can_view = 1
         AND m.is_active = 1
       ORDER BY COALESCE(m.parent_id, 0), m.sort_order, m.id`,
      [admin.id],
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching allowed menus:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลเมนู" },
      { status: 500 },
    );
  }
}
