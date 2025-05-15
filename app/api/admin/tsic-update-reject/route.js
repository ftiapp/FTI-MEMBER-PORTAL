import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';

/**
 * API endpoint to reject a TSIC update request
 */
export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    const { requestId, reason } = body;
    
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'ไม่พบรหัสคำขอ' }, { status: 400 });
    }
    
    if (!reason || reason.trim() === '') {
      return NextResponse.json({ success: false, message: 'กรุณาระบุเหตุผลในการปฏิเสธคำขอ' }, { status: 400 });
    }
    
    // ตรวจสอบว่าคำขอมีอยู่จริงและมีสถานะ pending
    const [requests] = await query(
      'SELECT * FROM pending_tsic_updates WHERE id = ? AND status = ?',
      [requestId, 'pending']
    );
    
    if (requests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบคำขอหรือคำขอไม่ได้อยู่ในสถานะรอการอนุมัติ' },
        { status: 404 }
      );
    }
    
    // อัปเดตสถานะคำขอเป็น rejected
    await query(
      'UPDATE pending_tsic_updates SET status = ?, admin_id = ?, admin_comment = ?, processed_date = NOW() WHERE id = ?',
      ['rejected', admin.id, reason, requestId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'ปฏิเสธคำขอแก้ไข TSIC เรียบร้อยแล้ว'
    });
    
  } catch (error) {
    console.error('Error rejecting TSIC update request:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไข TSIC' },
      { status: 500 }
    );
  }
}
