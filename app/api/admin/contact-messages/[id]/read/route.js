import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function PUT(request, { params }) {
  try {
    // ใช้ params โดยไม่ต้อง await เพราะ params ไม่ใช่ Promise
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, message: "ไม่พบ ID ข้อความ" }, { status: 400 });
    }

    // Get admin session
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ในการดำเนินการนี้" },
        { status: 403 },
      );
    }

    // Update message status to read and store admin info
    await query(
      `UPDATE FTI_Portal_User_Contact_Messages 
       SET status = 'read', 
           read_by_admin_id = ?, 
           read_at = NOW() 
       WHERE id = ? AND (status = 'unread' OR read_by_admin_id IS NULL)`,
      [admin.id, id],
    );

    return NextResponse.json({
      success: true,
      message: "อัปเดตสถานะข้อความเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสถานะข้อความ" },
      { status: 500 },
    );
  }
}
