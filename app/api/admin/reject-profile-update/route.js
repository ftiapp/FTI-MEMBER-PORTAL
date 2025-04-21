import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { getClientIp } from '@/app/lib/utils';

export async function POST(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    const { requestId, reason, comment } = await request.json();

    if (!requestId || !reason) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID คำขอและเหตุผลในการปฏิเสธ' },
        { status: 400 }
      );
    }

    // Get request details
    const requests = await query(
      'SELECT * FROM profile_update_requests WHERE id = ? AND status = "pending"',
      [requestId]
    );

    if (requests.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบคำขอแก้ไขข้อมูลที่รออนุมัติ' },
        { status: 404 }
      );
    }

    const request_data = requests[0];
    const userId = request_data.user_id;

    // Update request status
    await query(
      `UPDATE profile_update_requests 
       SET status = "rejected", reject_reason = ?, admin_id = ?, admin_comment = ?, updated_at = NOW() 
       WHERE id = ?`,
      [reason, session.admin.id, comment || null, requestId]
    );

    // Get client IP and user agent
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Log admin action
    await query(
      `INSERT INTO admin_actions_log 
       (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        session.admin.id,
        'reject_profile_update',
        requestId,
        JSON.stringify({
          userId,
          requestId,
          reason,
          comment
        }),
        ip,
        userAgent
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'ปฏิเสธคำขอแก้ไขข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error('Error rejecting profile update request:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูล' },
      { status: 500 }
    );
  }
}
