import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';

/**
 * GET handler for retrieving current admin information
 * 
 * This endpoint returns information about the currently logged-in admin
 * based on their session. It's used by the admin layout to display admin info
 * and determine access permissions.
 */
export async function GET() {
  try {
    // Verify admin session and get admin info
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }
    
    // Return admin info (excluding sensitive data like password)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        level: admin.level,
        can_create: admin.can_create,
        can_update: admin.can_update,
        is_active: admin.is_active
      }
    });
  } catch (error) {
    console.error('Error getting admin info:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ' },
      { status: 500 }
    );
  }
}
