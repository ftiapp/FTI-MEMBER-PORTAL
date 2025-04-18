import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/session';
import { getClientIp } from '@/app/lib/utils';

export async function POST(request) {
  try {
    // Check admin session
    const session = await getServerSession();
    if (!session || !session.admin) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    const { requestId, comment } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID คำขอ' },
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

    // Update user information
    await query(
      `UPDATE users 
       SET firstname = ?, lastname = ?, email = ?, phone = ? 
       WHERE id = ?`,
      [
        request_data.new_firstname,
        request_data.new_lastname,
        request_data.new_email,
        request_data.new_phone,
        userId
      ]
    );

    // Update request status
    await query(
      `UPDATE profile_update_requests 
       SET status = "approved", admin_id = ?, admin_comment = ?, updated_at = NOW() 
       WHERE id = ?`,
      [session.admin.id, comment || null, requestId]
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
        'approve_profile_update',
        requestId,
        JSON.stringify({
          userId,
          requestId,
          comment
        }),
        ip,
        userAgent
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'อนุมัติคำขอแก้ไขข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error('Error approving profile update request:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขข้อมูล' },
      { status: 500 }
    );
  }
}
