import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

/**
 * GET handler for retrieving member submission details
 *
 * This endpoint retrieves the details of a specific member verification submission,
 * including any rejection reason if the submission was rejected.
 */
export async function GET(request) {
  try {
    // Get user from cookies
    const cookieStore = cookies();
    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);

    // Get submission ID from query params
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id");

    if (!submissionId) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสการยืนยันสมาชิก" },
        { status: 400 },
      );
    }

    // Fetch submission details
    const submissions = await query(`SELECT * FROM FTI_Original_Membership WHERE id = ? AND user_id = ?`, [
      submissionId,
      user.id,
    ]);

    if (submissions.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลการยืนยันสมาชิก" },
        { status: 404 },
      );
    }

    const submission = submissions[0];

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error fetching submission details:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}
