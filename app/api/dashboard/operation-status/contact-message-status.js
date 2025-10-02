// API route: /api/dashboard/operation-status/contact-message-status?userId=xxx
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    // ดึงเฉพาะข้อความล่าสุดของ user
    const messages = await query(
      `SELECT id, subject, message, status, admin_response, created_at, updated_at FROM contact_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
      [userId],
    );

    // ตรวจสอบว่ามีข้อมูลหรือไม่ และแสดง log เพื่อ debug
    console.log("Contact messages found:", messages?.length || 0);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching contact message status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
