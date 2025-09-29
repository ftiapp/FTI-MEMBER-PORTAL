import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { sendEmailChangeNotificationToOld, sendEmailChangeNotificationToNew, sendEmailChangeOTP } from '@/app/lib/mailersend-email-change.postmark';

export async function POST(request) {
  try {
    // ดึงข้อมูลจาก request โดยตรง
    const { newEmail, userId, token } = await request.json();
    
    // ตรวจสอบข้อมูลที่ส่งมา
    if (!newEmail || !userId || !token) {
      return NextResponse.json({ error: 'กรุณาระบุข้อมูลให้ครบถ้วน' }, { status: 400 });
    }
    
    if (!newEmail) {
      return NextResponse.json({ error: 'กรุณาระบุอีเมลใหม่' }, { status: 400 });
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    // ตรวจสอบว่าอีเมลใหม่ซ้ำกับผู้ใช้อื่นหรือไม่
    const existingUser = await query(
      'SELECT id, email_verified FROM users WHERE email = ? AND id != ?',
      [newEmail, userId]
    );

    if (existingUser && existingUser.length > 0) {
      // ถ้ามีผู้ใช้ที่ใช้อีเมลนี้และได้รับการยืนยันแล้ว
      if (existingUser[0].email_verified === 1) {
        return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว' }, { status: 400 });
      } else {
        // ถ้ามีผู้ใช้ที่ใช้อีเมลนี้แต่ยังไม่ได้รับการยืนยัน
        return NextResponse.json({ error: 'อีเมลนี้ถูกใช้ในการลงทะเบียนแล้ว แต่ยังไม่ได้รับการยืนยัน' }, { status: 400 });
      }
    }

    // ตรวจสอบว่ามี token ที่ยืนยัน OTP แล้วหรือไม่
    const verificationToken = await query(
      `SELECT * FROM verification_tokens 
       WHERE user_id = ? AND token_type = 'change_email' 
       AND otp_verified = 1 AND used = 0
       AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (!verificationToken || verificationToken.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลการยืนยัน OTP หรือข้อมูลหมดอายุแล้ว' }, { status: 400 });
    }

    // ดึงชื่อและนามสกุลจาก users
    let firstname = null;
    let lastname = null;
    let oldEmail = null;
    
    // ดึงข้อมูลจาก users table
    const user = await query(
      'SELECT email, firstname, lastname FROM users WHERE id = ?',
      [userId]
    );
    if (user && user.length > 0) {
      firstname = user[0].firstname;
      lastname = user[0].lastname;
      oldEmail = user[0].email;
    } else {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 404 });
    }

    // อัปเดตสถานะ token เป็นใช้งานแล้ว (OTP ของ email ปัจจุบัน)
    await query(
      'UPDATE verification_tokens SET used = 1 WHERE id = ?',
      [verificationToken[0].id]
    );
    
    // ลบข้อมูล OTP เก่าใน verification_tokens ที่อาจมีอยู่สำหรับผู้ใช้นี้
    await query(
      `UPDATE verification_tokens SET used = 1 
       WHERE user_id = ? AND token_type = 'new_email_verification' AND used = 0`,
      [userId]
    );

    // สร้าง OTP สำหรับการยืนยันอีเมลใหม่
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 15;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);

    // ลบ pending_email_changes เดิม (ถ้ามี)
    await query(
      'DELETE FROM pending_email_changes WHERE user_id = ?',
      [userId]
    );

    // สร้าง pending_email_changes ใหม่
    await query(
      `INSERT INTO pending_email_changes (user_id, new_email, otp, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [userId, newEmail, otp, expiresAt]
    );
    
    // อัปเดตสถานะ email_verified เป็น 0 ในตาราง users
    await query(
      'UPDATE users SET email_verified = 0 WHERE id = ?',
      [userId]
    );
    
    // บันทึกประวัติการขอเปลี่ยนอีเมล
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, 'change_email', ?, ?, ?, NOW())`,
      [
        userId, 
        `ยืนยันการเปลี่ยนอีเมล - ส่ง OTP ไปยังอีเมลใหม่ ${newEmail}`, 
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );

    // ส่ง OTP ไปยังอีเมลใหม่
    await sendEmailChangeOTP(newEmail, firstname, lastname, otp);


    return NextResponse.json({ 
      success: true, 
      message: 'ส่ง OTP ไปยังอีเมลใหม่เรียบร้อย กรุณาตรวจสอบอีเมลของคุณ',
      newEmail
    });

  } catch (error) {
    console.error('Error in confirm-new-email API:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
