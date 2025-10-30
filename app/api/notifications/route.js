import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "@/app/lib/db";

export async function GET(request) {
  try {
    console.log("FTI_Portal_User_Notifications API called");
    const session = await getSession();

    console.log("Session exists:", !!session);

    if (!session || !session.user) {
      console.log("No valid session found");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ดึง userId จาก query parameters ถ้ามี
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    console.log("Requested userId:", requestedUserId, "Token userId:", userId);

    // ตรวจสอบว่า userId ที่ร้องขอตรงกับ userId ใน token
    if (requestedUserId && parseInt(requestedUserId) !== userId) {
      console.log("UserId mismatch");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ดึงข้อมูลการแจ้งเตือน
    try {
      console.log("Querying database for FTI_Portal_User_Notifications, userId:", userId);
      const FTI_Portal_User_Notifications = await query(
        `SELECT * FROM FTI_Portal_User_Notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
        [userId],
      );

      console.log(
        "FTI_Portal_User_Notifications found:",
        FTI_Portal_User_Notifications ? FTI_Portal_User_Notifications.length : 0,
      );
      return NextResponse.json({ success: true, FTI_Portal_User_Notifications });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json({ success: false, message: "Database Error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching FTI_Portal_User_Notifications:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
