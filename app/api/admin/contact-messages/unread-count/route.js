// API route: /api/admin/contact-messages/unread-count
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

// Simple in-memory cache (per Node.js process)
// เหมาะสำหรับลดโหลด DB เมื่อมีหลาย component เรียก endpoint นี้พร้อมกัน
const TWENTY_MINUTES = 20 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
let unreadCache = { value: null, expiresAt: 0 };

export async function GET(request) {
  try {
    const now = Date.now();

    // Use cache only in production เพื่อให้ dev เห็นผลลัพธ์สด ๆ ง่ายต่อการ debug
    if (isProd && unreadCache.value !== null && unreadCache.expiresAt > now) {
      return NextResponse.json({ unread: unreadCache.value, cached: true });
    }

    // Query DB directly
    const result = await query(
      "SELECT COUNT(*) AS unread FROM FTI_Portal_User_Contact_Messages WHERE status = 'unread'",
    );
    const unread = result?.[0]?.unread ?? 0;

    if (isProd) {
      unreadCache = {
        value: unread,
        expiresAt: now + TWENTY_MINUTES,
      };
    }

    return NextResponse.json({ unread, cached: false });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 });
  }
}
