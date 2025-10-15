import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { createVerificationToken } from "@/app/lib/token";
import { sendVerificationEmail } from "@/app/lib/postmark";

/**
 * POST handler for resending verification email
 * This endpoint allows FTI_Portal_User to request a new verification token if their previous one expired
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "กรุณาระบุอีเมล" }, { status: 400 });
    }

    // Check if user exists and is not verified
    const FTI_Portal_User = await query("SELECT id, name, email, email_verified FROM FTI_Portal_User WHERE email = ?", [
      email,
    ]);

    if (FTI_Portal_User.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบอีเมลนี้ในระบบ" }, { status: 404 });
    }

    const user = FTI_Portal_User[0];

    // If user is already verified, no need to send a new token
    if (user.email_verified === 1) {
      return NextResponse.json(
        { success: false, message: "อีเมลนี้ได้รับการยืนยันแล้ว" },
        { status: 400 },
      );
    }

    // Invalidate any existing tokens for this user
    await query("UPDATE FTI_Portal_User_Verification_Tokens SET used = 1 WHERE user_id = ? AND used = 0", [
      user.id,
    ]);

    // Generate a new verification token
    const verificationToken = await createVerificationToken(user.id);

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json({
      success: true,
      message: "ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน" },
      { status: 500 },
    );
  }
}
