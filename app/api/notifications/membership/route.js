import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { executeQueryWithoutTransaction } from '@/app/lib/db';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { membershipType, memberData, memberId } = await request.json();
    const userId = session.user.id;

    // Create notification message based on membership type
    const typeNames = {
      'oc': 'สมาชิกสามัญ-โรงงาน (OC)',
      'ac': 'สมาชิกสมทบ-นิติบุคคล (AC)', 
      'ic': 'สมาชิกสมทบ-บุคคลธรรมดา (IC)',
      'am': 'สมาชิกสามัญ-สมาคมการค้า (AM)'
    };

    const typeName = typeNames[membershipType?.toLowerCase()] || 'สมาชิก';
    
    let title = `สมัคร${typeName}สำเร็จ`;
    let message = `ท่านได้ทำการสมัคร${typeName}สำเร็จแล้ว`;
    
    if (memberData?.idCard) {
      message += `\nเลขบัตรประชาชน: ${memberData.idCard}`;
    }
    if (memberData?.taxId) {
      message += `\nเลขประจำตัวผู้เสียภาษี: ${memberData.taxId}`;
    }
    if (memberData?.companyNameTh) {
      message += `\nชื่อบริษัท: ${memberData.companyNameTh}`;
    }
    if (memberData?.applicantName) {
      message += `\nชื่อผู้สมัคร: ${memberData.applicantName}`;
    }

    message += '\n\nท่านสามารถตรวจสอบสถานะการสมัครได้ที่เมนู แดชบอร์ด > เอกสารสมัครสมาชิก';

    // Insert notification into database
    await executeQueryWithoutTransaction(
      `INSERT INTO notifications (
        user_id, type, message, link, created_at, status, member_code, member_type
      ) VALUES (?, ?, ?, ?, NOW(), 'unread', ?, ?)`,
      [userId, 'membership_submission', message, `/dashboard/membership-summary/${membershipType}/${memberId}`, memberId || null, membershipType]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error creating membership notification:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสร้างการแจ้งเตือน',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // Get notifications for the user
    const notifications = await executeQueryWithoutTransaction(
      `SELECT id, type, message, link, read_at, created_at, status, member_code, member_type
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get unread count
    const unreadResult = await executeQueryWithoutTransaction(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND status = 'unread'`,
      [userId]
    );

    const unreadCount = unreadResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount,
      hasMore: notifications?.length === limit
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน',
      details: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { notificationId, markAsRead } = await request.json();
    const userId = session.user.id;

    if (markAsRead) {
      // Mark notification as read
      await executeQueryWithoutTransaction(
        `UPDATE notifications 
         SET status = 'read', read_at = NOW() 
         WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน',
      details: error.message
    }, { status: 500 });
  }
}
