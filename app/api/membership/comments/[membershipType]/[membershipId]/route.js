import { NextResponse } from 'next/server';
import { getApplicationComments } from '@/app/lib/membership';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET(request, { params }) {
  try {
    const { membershipType, membershipId } = await params;
    
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่มีสิทธิ์เข้าถึง' 
      }, { status: 401 });
    }

    // ตรวจสอบ parameters
    if (!membershipType || !membershipId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ข้อมูลไม่ครบถ้วน' 
      }, { status: 400 });
    }

    // ตรวจสอบ membershipType ที่ถูกต้อง
    const validTypes = ['oc', 'ac', 'am', 'ic'];
    if (!validTypes.includes(membershipType)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ประเภทสมาชิกไม่ถูกต้อง' 
      }, { status: 400 });
    }

    // ดึงประวัติ comments
    const comments = await getApplicationComments(membershipType, parseInt(membershipId));

    return NextResponse.json({
      success: true,
      comments: comments,
      data: comments,
      message: 'ดึงประวัติความเห็นเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error fetching application comments:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงประวัติความเห็น' 
    }, { status: 500 });
  }
}
