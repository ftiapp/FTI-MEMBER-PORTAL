import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ไม่พบ ID ผู้ใช้" }, { status: 400 });
    }

    const FTI_Portal_User = await query(
      "SELECT id, name, firstname, lastname, email, phone FROM FTI_Portal_User WHERE id = ?",
      [userId],
    );

    if (FTI_Portal_User.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json(FTI_Portal_User[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
  }
}
