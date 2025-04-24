import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { headers } from 'next/headers';

export async function GET(request) {
  try {
    // ดึงข้อมูลผู้ใช้จาก request headers
    const headersList = headers();
    const cookie = headersList.get('cookie') || '';
    
    // พาร์ส cookie เพื่อหา user cookie
    const cookies = cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    const userCookieValue = cookies['user'];
    
    if (!userCookieValue) {
      return NextResponse.json({ hasValidToken: false, error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 401 });
    }
    
    // พยายามแปลงข้อมูล cookie เป็น JSON
    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(userCookieValue));
    } catch (e) {
      return NextResponse.json({ hasValidToken: false, error: 'ข้อมูลผู้ใช้ไม่ถูกต้อง' }, { status: 401 });
    }
    

    
    if (!userData || !userData.id) {
      return NextResponse.json({ hasValidToken: false, error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 401 });
    }

    const userId = userData.id;

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
      return NextResponse.json({ hasValidToken: false }, { status: 200 });
    }

    return NextResponse.json({ 
      hasValidToken: true,
      token: verificationToken[0].token
    });

  } catch (error) {
    console.error('Error in check-email-change-token API:', error);
    return NextResponse.json(
      { hasValidToken: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ' },
      { status: 500 }
    );
  }
}
