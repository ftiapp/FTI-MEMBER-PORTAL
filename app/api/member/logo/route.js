import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * API endpoint to fetch company logo information
 * @route GET /api/member/logo
 * @param {string} memberCode - The member code to fetch logo for
 * @returns {Object} JSON response with logo data
 */
export async function GET(request) {
  try {
    // Get member code from query parameters
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get("memberCode");

    if (!memberCode) {
      return NextResponse.json({ success: false, error: "รหัสสมาชิกไม่ถูกต้อง" }, { status: 400 });
    }

    // Verify user authentication - using await with cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (err) {
      console.error("JWT verification error:", err);
      return NextResponse.json(
        { success: false, error: "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    // Check if the company_logos table exists
    try {
      await query("SELECT 1 FROM company_logos LIMIT 1");
    } catch (err) {
      // If the table doesn't exist, create it
      console.log("company_logos table does not exist, creating it:", err.message);
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS company_logos (
            id int(11) NOT NULL AUTO_INCREMENT,
            member_code varchar(20) NOT NULL COMMENT 'รหัสสมาชิก',
            logo_url text NOT NULL COMMENT 'URL ของโลโก้บน Cloudinary',
            public_id varchar(255) NOT NULL COMMENT 'Public ID ของไฟล์บน Cloudinary',
            display_mode enum('circle','square') NOT NULL DEFAULT 'circle' COMMENT 'รูปแบบการแสดงผล (วงกลม/สี่เหลี่ยม)',
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY member_code_unique (member_code)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        return NextResponse.json({ success: true, data: null });
      } catch (createErr) {
        console.error("Error creating company_logos table:", createErr);
        return NextResponse.json(
          { success: false, error: "เกิดข้อผิดพลาดในการสร้างตาราง company_logos" },
          { status: 500 },
        );
      }
    }

    // Fetch logo data for the member
    const logoData = await query(
      "SELECT id, member_code, logo_url, public_id, display_mode, created_at, updated_at FROM company_logos WHERE member_code = ?",
      [memberCode],
    );

    if (logoData.length === 0) {
      return NextResponse.json({ success: true, data: null, error: "ไม่พบข้อมูลโลโก้" });
    }

    return NextResponse.json({ success: true, data: logoData[0] });
  } catch (error) {
    console.error("Error fetching logo data:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลโลโก้" },
      { status: 500 },
    );
  }
}
