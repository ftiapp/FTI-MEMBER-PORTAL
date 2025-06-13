import { NextResponse } from 'next/server';
import { adminLogout } from '../../../lib/adminAuth';

export async function POST() {
  try {
    // Call the adminLogout function to clear the admin_token cookie
    const result = await adminLogout();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'ออกจากระบบสำเร็จ' 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error during admin logout:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    );
  }
}
