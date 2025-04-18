import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getServerSession } from '@/app/lib/session';

export async function POST(request, { params }) {
  try {
    // Check admin session
    const session = await getServerSession();
    if (!session || !session.admin) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    const { messageId } = params;
    const { replyMessage } = await request.json();

    if (!messageId || !replyMessage) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID ข้อความและข้อความตอบกลับ' },
        { status: 400 }
      );
    }

    // Get message details
    const messages = await query(
      `SELECT cm.*, u.email, u.name 
       FROM contact_messages cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.id = ?`,
      [messageId]
    );

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบข้อความติดต่อ' },
        { status: 404 }
      );
    }

    const message = messages[0];

    // Check if message has already been replied to
    if (message.status === 'replied') {
      return NextResponse.json(
        { error: 'ข้อความนี้ได้รับการตอบกลับแล้ว' },
        { status: 400 }
      );
    }

    // Save reply message
    await query(
      `UPDATE contact_messages 
       SET admin_reply = ?, 
           admin_id = ?, 
           status = 'replied', 
           replied_at = NOW() 
       WHERE id = ?`,
      [replyMessage, session.admin.id, messageId]
    );

    // Log admin action
    await query(
      `INSERT INTO admin_actions_log 
       (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        session.admin.id,
        'contact_message_response',
        messageId,
        `ตอบกลับข้อความติดต่อ: ${message.subject}`,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        request.headers.get('user-agent') || ''
      ]
    );

    // ไม่ต้องส่งอีเมลตอบกลับ เนื่องจาก Admin จะส่งเอง

    return NextResponse.json({
      success: true,
      message: 'ตอบกลับข้อความสำเร็จ'
    });
  } catch (error) {
    console.error('Error replying to contact message:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตอบกลับข้อความ' },
      { status: 500 }
    );
  }
}
