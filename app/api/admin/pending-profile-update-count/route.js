import { query } from "../../../lib/db";
import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../lib/adminAuth";

export async function GET() {
  // Auth (optional: only admin can see)
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }
  const result = await query(
    'SELECT COUNT(*) as count FROM profile_update_requests WHERE status = "pending"',
  );
  return NextResponse.json({ success: true, count: result[0].count });
}
