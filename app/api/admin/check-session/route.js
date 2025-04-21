import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';

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
    
    // ส่งข้อมูล admin กลับไป (ไม่รวมข้อมูลที่ละเอียดอ่อน)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        adminLevel: admin.adminLevel,
        canCreate: admin.canCreate,
        canUpdate: admin.canUpdate
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
