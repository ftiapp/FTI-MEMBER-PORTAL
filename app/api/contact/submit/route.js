import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { userId, subject, message, name, email, phone } = data;
    
    // Validate required fields
    if (!userId || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Insert contact message into database
    await query(
      `INSERT INTO contact_messages 
       (user_id, subject, message, name, email, phone, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'unread', NOW())`,
      [userId, subject, message, name, email, phone]
    );
    
    // Log the activity
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        'contact_message',
        JSON.stringify({
          action: 'CONTACT_MESSAGE_SUBMITTED',
          subject,
          timestamp: new Date().toISOString()
        }),
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'ส่งข้อความเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อความ' },
      { status: 500 }
    );
  }
}
