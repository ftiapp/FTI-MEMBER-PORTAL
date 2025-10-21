import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { sendExistingMemberVerificationEmail } from "../../../lib/postmark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Send email notification after user submits existing member verification
 * POST /api/member/send-verification-email
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, companies } = body;

    if (!userId || !companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // Get user information from database
    const userResult = await query(
      `SELECT id, firstname, lastname, email FROM FTI_Portal_User WHERE id = ?`,
      [userId],
    );

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const user = userResult[0];

    // Send email notification
    try {
      await sendExistingMemberVerificationEmail(
        user.email,
        user.firstname,
        user.lastname,
        companies,
      );

      console.log(`Verification email sent successfully to ${user.email}`);

      return NextResponse.json({
        success: true,
        message: "ส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว",
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);

      // Don't fail the request if email sending fails
      // Just log the error and return success
      return NextResponse.json({
        success: true,
        message: "บันทึกข้อมูลสำเร็จ แต่ไม่สามารถส่งอีเมลแจ้งเตือนได้",
        emailError: true,
      });
    }
  } catch (error) {
    console.error("Error in send-verification-email:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการส่งอีเมล" },
      { status: 500 },
    );
  }
}
