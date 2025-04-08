import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // ค้นหาโทเค็นในฐานข้อมูล (ไม่สนใจว่าหมดอายุหรือถูกใช้แล้ว)
    const tokens = await query(
      'SELECT * FROM verification_tokens WHERE token = ?',
      [token]
    );

    if (tokens.length === 0) {
      return NextResponse.json({ verified: false, error: 'Token not found' }, { status: 404 });
    }

    // ตรวจสอบว่าผู้ใช้ได้รับการยืนยันแล้วหรือไม่
    const userId = tokens[0].user_id;
    const users = await query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ verified: false, error: 'User not found' }, { status: 404 });
    }

    // ตรวจสอบสถานะการยืนยันอีเมล
    const isVerified = users[0].email_verified === 1;

    return NextResponse.json({ 
      verified: isVerified,
      message: isVerified ? 'Email has been verified' : 'Email has not been verified yet'
    });
  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
