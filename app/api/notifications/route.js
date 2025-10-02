import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/app/lib/db";

// ใช้ค่าเริ่มต้นหากไม่มีการตั้งค่า JWT_SECRET ในตัวแปรสภาพแวดล้อม
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request) {
  try {
    console.log("Notifications API called");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("Token exists:", !!token);

    if (!token) {
      console.log("No token found in cookies");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ตรวจสอบ token และดึง userId
    let userId;
    try {
      console.log("Verifying token with JWT_SECRET:", JWT_SECRET ? "exists" : "missing");
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decoded successfully:", decoded);
      // ใช้ userId จาก token ที่ถอดรหัสแล้ว
      userId = decoded.userId; // แก้จาก decoded.id เป็น decoded.userId

      // ดึง userId จาก query parameters ถ้ามี
      const { searchParams } = new URL(request.url);
      const requestedUserId = searchParams.get("userId");
      console.log("Requested userId:", requestedUserId, "Token userId:", userId);

      // ตรวจสอบว่า userId ที่ร้องขอตรงกับ userId ใน token
      if (requestedUserId && parseInt(requestedUserId) !== userId) {
        console.log("UserId mismatch");
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // ดึงข้อมูลการแจ้งเตือน
    try {
      console.log("Querying database for notifications, userId:", userId);
      const notifications = await query(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
        [userId],
      );

      console.log("Notifications found:", notifications ? notifications.length : 0);
      return NextResponse.json({ success: true, notifications });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json({ success: false, message: "Database Error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
