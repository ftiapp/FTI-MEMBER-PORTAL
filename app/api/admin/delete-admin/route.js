import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getAdminFromSession, logAdminAction } from "../../../lib/adminAuth";

export async function POST(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น" },
        { status: 401 },
      );
    }

    const { adminId } = await request.json();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // Prevent deleting SuperAdmin accounts
    const rows = await query("SELECT id, username, admin_level FROM FTI_Portal_Admin_Users WHERE id = ?", [
      adminId,
    ]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ดูแลระบบ" }, { status: 404 });
    }
    const target = rows[0];
    if (Number(target.admin_level) >= 5) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถลบ SuperAdmin ได้" },
        { status: 400 },
      );
    }

    await query("DELETE FROM FTI_Portal_Admin_Users WHERE id = ?", [adminId]);

    // Log action
    await logAdminAction(admin.id, "delete_admin", adminId, { username: target.username }, request);

    return NextResponse.json({ success: true, message: "ลบผู้ดูแลระบบเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ" },
      { status: 500 },
    );
  }
}
