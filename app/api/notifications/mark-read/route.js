import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/app/lib/db";

// ใช้ค่าเริ่มต้นหากไม่มีการตั้งค่า JWT_SECRET ในตัวแปรสภาพแวดล้อม
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ตรวจสอบ token
    const decoded = jwt.verify(token, JWT_SECRET);
    // ใช้ userId จาก token ที่ถอดรหัสแล้ว
    const userId = decoded.userId; // แก้จาก decoded.id เป็น decoded.userId

    // ดึงข้อมูลจาก request body
    const { notificationId, userId: requestedUserId } = await request.json();

    // ตรวจสอบว่า userId ที่ร้องขอตรงกับ userId ใน token
    if (requestedUserId && parseInt(requestedUserId) !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ทำเครื่องหมายว่าอ่านแล้ว
    console.log("Marking notification as read:", { notificationId, userId });

    await query(
      `UPDATE FTI_Portal_User_Notifications 
       SET read_at = NOW(), updated_at = NOW() 
       WHERE id = ? AND user_id = ? AND read_at IS NULL`,
      [notificationId, userId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
