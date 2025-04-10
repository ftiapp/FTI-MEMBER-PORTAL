import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request, { params }) {
  try {
    const id = params.id;
    const { adminId, adminName } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ข้อความ' },
        { status: 400 }
      );
    }
    
    // Get message details
    const messages = await query(
      `SELECT * FROM contact_messages WHERE id = ?`,
      [id]
    );
    
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อความติดต่อ' },
        { status: 404 }
      );
    }
    
    const message = messages[0];
    
    // Update message status to replied
    await query(
      `UPDATE contact_messages 
       SET status = 'replied', admin_response = TRUE, updated_at = NOW() 
       WHERE id = ?`,
      [id]
    );
    
    // Log admin action
    await query(
      `INSERT INTO admin_actions_log 
       (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, 'contact_message_response', ?, ?, ?, ?, NOW())`,
      [
        adminId,
        id,
        JSON.stringify({
          action: 'CONTACT_MESSAGE_RESPONSE',
          message_id: id,
          message_subject: message.subject,
          user_email: message.email,
          timestamp: new Date().toISOString()
        }),
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'บันทึกการตอบกลับเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error responding to message:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการตอบกลับข้อความ' },
      { status: 500 }
    );
  }
}
