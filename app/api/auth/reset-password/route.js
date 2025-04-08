import { NextResponse } from 'next/server';
import { verifyPasswordResetToken, resetPassword } from '@/app/lib/token';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenData = await verifyPasswordResetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'โทเค็นไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400 }
      );
    }

    // Reset password
    const success = await resetPassword(tokenData.tokenId, tokenData.userId, password);
    if (!success) {
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
