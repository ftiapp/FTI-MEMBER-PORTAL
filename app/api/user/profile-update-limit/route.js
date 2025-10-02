import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";

export async function GET(request) {
  // Auth
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }
  // นับจำนวน request วันนี้
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const result = await query(
    "SELECT COUNT(*) as count FROM profile_update_requests WHERE user_id = ? AND created_at >= ? AND created_at < ?",
    [user.id, today, tomorrow],
  );
  return NextResponse.json({ success: true, count: result[0].count });
}
