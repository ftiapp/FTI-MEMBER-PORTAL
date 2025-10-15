﻿import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { query } from "@/app/lib/db";

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการเข้าสู่ระบบ" }, { status: 401 });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ error: "โทเคนไม่ถูกต้องหรือหมดอายุ" }, { status: 401 });
    }

    // Get user data from database
    const FTI_Portal_User = await query(
      "SELECT id, name, email, phone, role, status, email_verified, created_at, updated_at FROM FTI_Portal_User WHERE id = ?",
      [decoded.userId],
    );

    if (FTI_Portal_User.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const user = FTI_Portal_User[0];

    // Return user data
    return NextResponse.json({
      user,
      isRemembered: decoded.rememberMe === true,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
  }
}
