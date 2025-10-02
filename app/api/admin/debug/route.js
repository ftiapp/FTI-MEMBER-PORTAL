import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function GET(request) {
  try {
    // Get admin from database
    const admins = await query("SELECT * FROM admin_users WHERE username = ? LIMIT 1", [
      "superadmin",
    ]);

    if (admins.length === 0) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบผู้ดูแลระบบ",
      });
    }

    const admin = admins[0];

    // Test password comparison
    const testPassword = "123456";
    const passwordMatch = await bcrypt.compare(testPassword, admin.password);

    // Generate new hash for reference
    const newHash = await bcrypt.hash(testPassword, 10);

    return NextResponse.json({
      success: true,
      adminExists: true,
      passwordMatch: passwordMatch,
      adminData: {
        id: admin.id,
        username: admin.username,
        is_active: admin.is_active,
        admin_level: admin.admin_level,
      },
      storedHash: admin.password,
      newGeneratedHash: newHash,
      fixSql: `UPDATE admin_users SET password = '${newHash}' WHERE id = ${admin.id};`,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดีบัก",
      error: error.message,
    });
  }
}
