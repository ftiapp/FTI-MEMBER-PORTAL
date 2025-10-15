import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * API endpoint to fetch social media links for a member
 * @route GET /api/member/social-media/list
 * @param {string} memberCode - The member code to fetch social media for
 * @returns {Object} JSON response with social media data
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

    // Check if the FTI_Original_Membership_Member_Social_Media table exists
    try {
      await query("SELECT 1 FROM FTI_Original_Membership_Member_Social_Media LIMIT 1");
    } catch (err) {
      // If the table doesn't exist, return an empty array
      console.log("FTI_Original_Membership_Member_Social_Media table does not exist:", err.message);
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch social media data for the member
    const socialMediaData = await query(
      "SELECT id, member_code, platform, url, display_name, created_at, updated_at FROM FTI_Original_Membership_Member_Social_Media WHERE member_code = ?",
      [memberCode],
    );

    return NextResponse.json({ success: true, data: socialMediaData });
  } catch (error) {
    console.error("Error fetching social media data:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลโซเชียลมีเดีย" },
      { status: 500 },
    );
  }
}
