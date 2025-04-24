import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { sendEmailChangeOTP } from '@/app/lib/mailersend-email-change';
import { generateToken } from '@/app/lib/token';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'กรุณาระบุอีเมล' }, { status: 400 });
    }

    // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
    const user = await query(
      'SELECT id, email, firstname, lastname FROM users WHERE email = ?',
      [email]
    );

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'ไม่พบอีเมลนี้ในระบบ' }, { status: 404 });
    }

    const userId = user[0].id;

    // ตรวจสอบว่าผู้ใช้เปลี่ยนอีเมลสำเร็จแล้วหรือไม่ใน 7 วันที่ผ่านมา
    // ตรวจสอบจากประวัติการเปลี่ยนอีเมลที่สำเร็จ (Member_portal_User_log)
    const recentSuccessfulChanges = await query(
      `SELECT * FROM Member_portal_User_log 
       WHERE user_id = ? AND action = 'change_email' 
       AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    if (recentSuccessfulChanges && recentSuccessfulChanges.length > 0) {
      // คำนวณวันที่สามารถเปลี่ยนได้อีกครั้ง
      const lastChangeDate = new Date(recentSuccessfulChanges[0].created_at);
      const nextAvailableDate = new Date(lastChangeDate);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
      
      // คำนวณจำนวนวันที่ต้องรอ
      const now = new Date();
      const daysToWait = Math.ceil((nextAvailableDate - now) / (1000 * 60 * 60 * 24));
      
      return NextResponse.json(
        { 
          error: `คุณได้เปลี่ยนอีเมลไปแล้วใน 7 วันที่ผ่านมา กรุณารออีก ${daysToWait} วัน`,
          nextAvailableDate: nextAvailableDate.toISOString().split('T')[0],
          daysToWait: daysToWait
        },
        { status: 429 }
      );
    }
    
    // ตรวจสอบว่ามีคำขอที่ยังไม่หมดอายุหรือไม่ (ไม่ได้บล็อกการขอ OTP ใหม่)
    const pendingRequests = await query(
      `SELECT * FROM verification_tokens 
       WHERE user_id = ? AND token_type = 'change_email' 
       AND expires_at > NOW() AND used = 0`,
      [userId]
    );
    
    // ถ้ามีคำขอที่ยังไม่หมดอายุ ให้ยกเลิกคำขอเก่าทั้งหมด
    if (pendingRequests && pendingRequests.length > 0) {
      await query(
        `UPDATE verification_tokens 
         SET used = 1, otp_verified = 0
         WHERE user_id = ? AND token_type = 'change_email' AND used = 0`,
        [userId]
      );
    }

    // สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // สร้าง token สำหรับการเปลี่ยนอีเมล
    const token = generateToken();
    
    // บันทึก token และ OTP ลงในฐานข้อมูล
    await query(
      `INSERT INTO verification_tokens 
       (user_id, token, token_type, otp, expires_at, used) 
       VALUES (?, ?, 'change_email', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)`,
      [userId, token, otp]
    );

    // ส่งอีเมลพร้อม OTP
    await sendEmailChangeOTP(email, user[0].firstname, user[0].lastname, otp);
    
    // บันทึกประวัติการขอเปลี่ยนอีเมล
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, 'change_email', ?, ?, ?, NOW())`,
      [
        userId, 
        `ขอเปลี่ยนอีเมล - ส่ง OTP ไปยังอีเมลปัจจุบัน ${email}`, 
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'ส่ง OTP ไปยังอีเมลของคุณแล้ว',
      token: token // ส่ง token กลับไปเพื่อใช้ในการยืนยัน OTP
    });

  } catch (error) {
    console.error('Error in request-change-email API:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
