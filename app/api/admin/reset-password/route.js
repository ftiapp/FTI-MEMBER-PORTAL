import { NextResponse } from 'next/server';
import { resetSuperAdminPassword } from '../../../scripts/reset_admin_password';

export async function POST() {
  try {
    // รีเซ็ตรหัสผ่าน Super Admin
    const result = await resetSuperAdminPassword();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        newPassword: result.newPassword
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json({
      success: false,
      message: `เกิดข้อผิดพลาด: ${error.message}`
    }, { status: 500 });
  }
}
