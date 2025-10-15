// API route: /api/admin/contact-messages/unread-count
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import {
  getCachedUnreadCount,
  setCachedUnreadCount,
} from "@/app/admin/dashboard/contact-messages/utils/unreadCountCache";

const TEN_MINUTES = 10 * 60 * 1000;

export async function GET() {
  // Check cache
  const { count, lastFetchTime } = getCachedUnreadCount();
  const now = Date.now();
  if (now - lastFetchTime < TEN_MINUTES) {
    return NextResponse.json({ unread: count, cached: true });
  }

  // Not cached or expired, query DB
  const result = await query(
    "SELECT COUNT(*) AS unread FROM FTI_Portal_User_Contact_Messages WHERE status = 'unread'",
  );
  const unread = result?.[0]?.unread ?? 0;
  setCachedUnreadCount(unread);
  return NextResponse.json({ unread, cached: false });
}
