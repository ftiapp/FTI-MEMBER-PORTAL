import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { createPasswordResetToken } from '@/app/lib/token';
import { sendPasswordResetEmail } from '@/app/lib/postmark';

// จำนวนครั้งสูงสุดที่อนุญาตให้ขอรีเซ็ตรหัสผ่านต่อวัน
const MAX_RESET_REQUESTS_PER_DAY = 3;

/**
 * ตรวจสอบและบันทึกการขอรีเซ็ตรหัสผ่าน
 * @param {string} email - อีเมลที่ขอรีเซ็ตรหัสผ่าน
 * @returns {Promise<{allowed: boolean, remainingAttempts: number}>} - ผลการตรวจสอบ
 */
async function checkAndLogResetRequest(email) {
  try {
    // ตรวจสอบว่ามีการขอรีเซ็ตรหัสผ่านในวันนี้หรือไม่
    const logs = await query(
      'SELECT * FROM password_reset_logs WHERE email = ? AND request_date = CURRENT_DATE',
      [email]
    );
    
    if (logs.length === 0) {
      // ถ้าไม่มีบันทึกในวันนี้ ให้สร้างบันทึกใหม่
      await query(
        'INSERT INTO password_reset_logs (email, request_count, last_request_at, request_date) VALUES (?, 1, NOW(), CURRENT_DATE)',
        [email]
      );
      return { allowed: true, remainingAttempts: MAX_RESET_REQUESTS_PER_DAY - 1 };
    } else {
      // ถ้ามีบันทึกในวันนี้แล้ว ตรวจสอบว่าเกินจำนวนครั้งที่กำหนดหรือไม่
      const log = logs[0];
      
      if (log.request_count >= MAX_RESET_REQUESTS_PER_DAY) {
        // เกินจำนวนครั้งที่กำหนด
        return { allowed: false, remainingAttempts: 0 };
      }
      
      // อัปเดตจำนวนครั้งที่ขอรีเซ็ตรหัสผ่าน
      await query(
        'UPDATE password_reset_logs SET request_count = request_count + 1, last_request_at = NOW() WHERE id = ?',
        [log.id]
      );
      
      return { 
        allowed: true, 
        remainingAttempts: MAX_RESET_REQUESTS_PER_DAY - (log.request_count + 1) 
      };
    }
  } catch (error) {
    console.error('Error checking reset request logs:', error);
    // กรณีเกิดข้อผิดพลาด ให้อนุญาตให้ดำเนินการต่อ
    return { allowed: true, remainingAttempts: 0 };
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมล' },
        { status: 400 }
      );
    }

    // ตรวจสอบและบันทึกการขอรีเซ็ตรหัสผ่าน
    const resetCheck = await checkAndLogResetRequest(email);
    
    if (!resetCheck.allowed) {
      return NextResponse.json(
        { error: 'คุณได้ขอรีเซ็ตรหัสผ่านเกินจำนวนครั้งที่กำหนด กรุณาลองใหม่ในวันพรุ่งนี้' },
        { status: 429 } // Too Many Requests
      );
    }

    // Check if user exists
    const users = await query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    // Always return success even if user doesn't exist (for security)
    if (users.length === 0) {
      return NextResponse.json({
        message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ'
      });
    }

    const user = users[0];

    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id);

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return NextResponse.json({
      message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ',
      remainingAttempts: resetCheck.remainingAttempts
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
