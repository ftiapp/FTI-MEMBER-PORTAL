import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { generateToken } from "@/app/lib/token";
import { sendNewEmailVerification } from "@/app/lib/postmark";

export async function POST(request) {
  try {
    const { userId, newEmail, firstName, lastName } = await request.json();

    // ตรวจสอบข้อมูลที่ส่งมา
    if (!userId || !newEmail || !firstName || !lastName) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
    }

    // ตรวจสอบว่าอีเมลใหม่ซ้ำกับผู้ใช้อื่นหรือไม่
    const existingUser = await query(
      "SELECT id, email_verified FROM FTI_Portal_User WHERE email = ? AND id != ?",
      [newEmail, userId],
    );

    if (existingUser && existingUser.length > 0) {
      // ถ้ามีผู้ใช้ที่ใช้อีเมลนี้และได้รับการยืนยันแล้ว
      if (existingUser[0].email_verified === 1) {
        return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว" }, { status: 400 });
      } else {
        // ถ้ามีผู้ใช้ที่ใช้อีเมลนี้แต่ยังไม่ได้รับการยืนยัน
        return NextResponse.json(
          { error: "อีเมลนี้ถูกใช้ในการลงทะเบียนแล้ว แต่ยังไม่ได้รับการยืนยัน" },
          { status: 400 },
        );
      }
    }

    // สร้าง token สำหรับยืนยันอีเมลใหม่
    const verificationToken = generateToken();

    // บันทึก token ลงในฐานข้อมูล
    await query(
      `INSERT INTO FTI_Portal_User_Verification_Tokens 
       (user_id, token, token_type, expires_at, created_at) 
       VALUES (?, ?, 'new_email_verification', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW())`,
      [userId, verificationToken],
    );

    // บันทึกอีเมลใหม่ที่ต้องการเปลี่ยนไว้ในฐานข้อมูล
    await query(
      `INSERT INTO FTI_Original_Membership_Pending_Email_Changes 
       (user_id, new_email, token_id, created_at) 
       VALUES (?, ?, LAST_INSERT_ID(), NOW())`,
      [userId, newEmail],
    );

    // ส่งอีเมลยืนยันไปยังอีเมลใหม่
    await sendNewEmailVerification(newEmail, `${firstName} ${lastName}`, verificationToken);

    return NextResponse.json({ success: true, message: "ส่งอีเมลยืนยันไปยังอีเมลใหม่แล้ว" });
  } catch (error) {
    console.error("Error requesting new email verification:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน" }, { status: 500 });
  }
}
