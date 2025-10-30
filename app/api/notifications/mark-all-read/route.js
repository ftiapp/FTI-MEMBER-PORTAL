import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "@/app/lib/db";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ดึงข้อมูลจาก request body
    const { userId: requestedUserId } = await request.json();

    // ตรวจสอบว่า userId ที่ร้องขอตรงกับ userId ใน token
    if (requestedUserId && parseInt(requestedUserId) !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ทำเครื่องหมายว่าอ่านทั้งหมด
    console.log("Marking all FTI_Portal_User_Notifications as read for user:", userId);

    await query(
      `UPDATE FTI_Portal_User_Notifications 
       SET read_at = NOW(), updated_at = NOW() 
       WHERE user_id = ? AND read_at IS NULL`,
      [userId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all FTI_Portal_User_Notifications as read:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
