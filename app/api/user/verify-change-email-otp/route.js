import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function POST(request) {
  try {
    const { otp, userId } = await request.json();

    if (!otp || !userId) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // ตรวจสอบว่า OTP ถูกต้องและยังไม่หมดอายุ
    const verificationToken = await query(
      `SELECT * FROM FTI_Portal_User_Verification_Tokens 
       WHERE user_id = ? AND otp = ? AND token_type = 'change_email' 
       AND expires_at > NOW() AND used = 0
       ORDER BY created_at DESC LIMIT 1`,
      [userId, otp],
    );

    if (!verificationToken || verificationToken.length === 0) {
      return NextResponse.json({ error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
    }

    // เก็บข้อมูลว่า OTP ถูกใช้แล้ว แต่ยังไม่เปลี่ยนสถานะเป็น used = 1
    // จะเปลี่ยนเมื่อมีการยืนยันอีเมลใหม่เรียบร้อยแล้ว
    await query(
      `UPDATE FTI_Portal_User_Verification_Tokens 
       SET otp_verified = 1
       WHERE id = ?`,
      [verificationToken[0].id],
    );

    // ส่ง token กลับไปเพื่อใช้ในขั้นตอนถัดไป
    return NextResponse.json({
      success: true,
      message: "ยืนยัน OTP สำเร็จ",
      token: verificationToken[0].token,
    });
  } catch (error) {
    console.error("Error in verify-change-email-otp API:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}
