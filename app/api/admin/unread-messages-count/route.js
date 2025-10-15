import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Count unread messages
    const result = await query(
      'SELECT COUNT(*) as count FROM FTI_Portal_User_Contact_Messages WHERE status = "unread"',
    );

    return NextResponse.json({ count: result[0].count });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการนับข้อความที่ยังไม่อ่าน" },
      { status: 500 },
    );
  }
}
