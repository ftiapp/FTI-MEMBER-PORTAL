import { NextResponse } from 'next/server';
import { verifyAdminPassword, createAdminSession, logAdminAction } from '@/app/lib/adminAuth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }
    
    // Verify admin credentials
    const result = await verifyAdminPassword(username, password);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
    
    // Create session
    await createAdminSession(result.admin);
    
    // Log admin login
    await logAdminAction(
      result.admin.id,
      'login',
      null,
      'Admin login successful',
      request
    );
    
    return NextResponse.json({
      success: true,
      adminLevel: result.admin.adminLevel,
      username: result.admin.username
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
