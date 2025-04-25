import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    // ตรวจสอบ session ของ admin จาก cookie
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูล session ของผู้ดูแลระบบ' 
      });
    }
    
    // ดึงข้อมูลเพิ่มเติมจากฐานข้อมูล เช่น name
    let adminName = null;
    try {
      const admins = await query(
        'SELECT name FROM admin_users WHERE id = ? LIMIT 1',
        [admin.id]
      );
      adminName = admins.length > 0 ? admins[0].name : null;
    } catch (error) {
      console.error('Error fetching admin name:', error);
      // ถ้าเกิดข้อผิดพลาดในการดึงข้อมูล name ให้ใช้ค่า null
    }
    
    // ส่งข้อมูล admin กลับไป (ไม่รวมข้อมูลที่ละเอียดอ่อน)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        adminLevel: admin.adminLevel,
        canCreate: admin.canCreate,
        canUpdate: admin.canUpdate,
        name: adminName
      }
    });
  } catch (error) {
    console.error('Error checking admin session:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ session' },
      { status: 500 }
    );
  }
}
