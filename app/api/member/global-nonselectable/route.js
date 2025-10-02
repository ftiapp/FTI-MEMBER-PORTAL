import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

// Returns all MEMBER_CODE with Admin_Submit 0 (pending) or 1 (approved) across all users
export async function GET() {
  try {
    const rows = await query(
      `SELECT MEMBER_CODE, Admin_Submit FROM companies_Member WHERE Admin_Submit IN (0, 1)`,
    );

    const map = {};
    for (const r of rows) {
      const code = (r.MEMBER_CODE || "").trim();
      if (!code) continue;
      const status = r.Admin_Submit === 0 ? "pending" : "approved";
      // If already set, prefer 'approved' over 'pending'
      if (!map[code] || map[code] === "pending") {
        map[code] = status;
      }
    }

    return NextResponse.json({ success: true, nonSelectable: map });
  } catch (err) {
    console.error("Error fetching global non-selectable member codes:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}
