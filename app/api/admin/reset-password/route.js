import { NextResponse } from "next/server";
import { resetSuperAdminPassword } from "../../../scripts/reset_admin_password";
import { getAdminFromSession, logAdminAction } from "../../../lib/adminAuth";

export async function POST(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();

    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้รับอนุญาต เฉพาะ Super Admin เท่านั้น" },
        { status: 401 },
      );
    }

    // รีเซ็ตรหัสผ่าน Super Admin
    const result = await resetSuperAdminPassword();

    if (result.success) {
      // Log admin action
      await logAdminAction(admin.id, "update_admin", null, `Reset Super Admin password`, request);

      return NextResponse.json({
        success: true,
        message: result.message,
        newPassword: result.newPassword,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาด: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
