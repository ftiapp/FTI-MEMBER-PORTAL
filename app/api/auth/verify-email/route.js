import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/token';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    // Get token from URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'โทเค็นไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ค้นหาโทเค็นในฐานข้อมูลโดยไม่สนใจว่าใช้แล้วหรือไม่
    const allTokens = await query(
      'SELECT * FROM verification_tokens WHERE token = ?',
      [token]
    );

    // ถ้าไม่พบโทเค็นเลย
    if (allTokens.length === 0) {
      return NextResponse.json(
        { error: 'โทเค็นไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าโทเค็นถูกใช้ไปแล้วหรือไม่
    if (allTokens[0].used === 1) {
      // ดึงข้อมูลผู้ใช้
      const users = await query(
        'SELECT email, email_verified FROM users WHERE id = ?',
        [allTokens[0].user_id]
      );
      
      if (users.length > 0 && users[0].email_verified === 1) {
        return NextResponse.json(
          { 
            error: 'อีเมลนี้ได้รับการยืนยันแล้ว',
            alreadyVerified: true,
            email: users[0].email
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'โทเค็นนี้ถูกใช้งานไปแล้ว กรุณาขอโทเค็นใหม่' },
          { status: 400 }
        );
      }
    }

    // ตรวจสอบว่าโทเค็นหมดอายุหรือไม่
    const validTokens = await query(
      'SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW() AND used = 0',
      [token]
    );

    if (validTokens.length === 0) {
      return NextResponse.json(
        { 
          error: 'โทเค็นหมดอายุแล้ว กรุณาขอโทเค็นใหม่',
          expired: true
        },
        { status: 400 }
      );
    }

    // อัปเดตสถานะโทเค็นเป็นใช้แล้ว
    await query(
      'UPDATE verification_tokens SET used = 1 WHERE id = ?',
      [validTokens[0].id]
    );

    // อัปเดตสถานะการยืนยันอีเมลของผู้ใช้
    await query(
      'UPDATE users SET email_verified = 1 WHERE id = ?',
      [validTokens[0].user_id]
    );

    // ดึงข้อมูลผู้ใช้เพื่อส่งกลับไปยังหน้าเว็บ
    const users = await query(
      'SELECT email FROM users WHERE id = ?',
      [validTokens[0].user_id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'ยืนยันอีเมลสำเร็จ',
      email: users[0].email
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' },
      { status: 500 }
    );
  }
}
