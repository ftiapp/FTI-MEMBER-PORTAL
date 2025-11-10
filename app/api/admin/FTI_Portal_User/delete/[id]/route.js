import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";
import { logAdminAction } from "@/app/lib/admin-log";

/**
 * DELETE /api/admin/FTI_Portal_User/delete/[id]
 *
 * Deletes a specific FTI_Portal_User by ID.
 * Requires admin authentication.
 */
export async function DELETE(request, { params }) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await query(
      "SELECT id, name, email, status, email_verified FROM FTI_Portal_User WHERE id = ?",
      [userId],
    );

    if (existingUser.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้ที่ระบุ" }, { status: 404 });
    }

    const user = existingUser[0];

    // Prevent deletion of active users (optional - you can remove this check if needed)
    // if (user.status === 'active') {
    //   return NextResponse.json(
    //     { success: false, message: "ไม่สามารถลบผู้ใช้ที่ใช้งานอยู่ได้" },
    //     { status: 400 }
    //   );
    // }

    // Get IP address and user agent for logging
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // Log the deletion
    await logAdminAction({
      adminId: admin.id,
      actionType: "delete_user",
      targetId: userId,
      description: `ลบผู้ใช้ - ชื่อ: ${user.name}, อีเมล: ${user.email}, ID: ${userId}`,
      ipAddress,
      userAgent,
    });

    // Delete the user
    await query("DELETE FROM FTI_Portal_User WHERE id = ?", [userId]);

    return NextResponse.json({
      success: true,
      message: `ลบผู้ใช้ "${user.name}" เรียบร้อยแล้ว`,
      deletedUser: {
        id: userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error deleting FTI_Portal_User:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบผู้ใช้" },
      { status: 500 },
    );
  }
}
