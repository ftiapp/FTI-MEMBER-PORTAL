// API route: /api/admin/contact-messages/unread-count
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

// ไม่ต้องใช้ cache เพื่อความเรียบง่าย
export async function GET(request) {
  try {
    // ไม่ต้องตรวจสอบ admin session ที่นี่ เพราะเราจะใช้ middleware หรือตรวจสอบที่หน้าเว็บแทน

    // Query DB directly
    const result = await query(
      "SELECT COUNT(*) AS unread FROM FTI_Portal_User_Contact_Messages WHERE status = 'unread'",
    );
    const unread = result?.[0]?.unread ?? 0;

    return NextResponse.json({ unread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 });
  }
}
