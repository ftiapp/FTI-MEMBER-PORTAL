import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession, logAdminAction } from '@/app/lib/adminAuth';

export async function POST(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น' },
        { status: 401 }
      );
    }
    
    const { adminId, isActive } = await request.json();
    
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Check if trying to modify a SuperAdmin
    const targetAdmin = await query(
      `SELECT admin_level FROM admin_users WHERE id = ?`,
      [adminId]
    );
    
    if (targetAdmin.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้ดูแลระบบ' },
        { status: 404 }
      );
    }
    
    if (targetAdmin[0].admin_level === 5) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถเปลี่ยนสถานะของ SuperAdmin ได้' },
        { status: 403 }
      );
    }
    
    // Update admin status
    await query(
      `UPDATE admin_users SET is_active = ? WHERE id = ?`,
      [isActive ? 1 : 0, adminId]
    );
    
    // Log admin action
    await logAdminAction(
      admin.id,
      'update_admin',
      adminId,
      `${isActive ? 'Activated' : 'Deactivated'} admin with ID ${adminId}`,
      request
    );
    
    return NextResponse.json({
      success: true,
      message: `${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ผู้ดูแลระบบเรียบร้อยแล้ว`
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ดูแลระบบ' },
      { status: 500 }
    );
  }
}
