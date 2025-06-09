import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { createNotification } from '@/app/lib/notifications';

export async function POST(request, { params }) {
  try {
    // ตรวจสอบว่ามี params และ id หรือไม่
    if (!params) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบพารามิเตอร์' },
        { status: 400 }
      );
    }
    
    // ใช้ parseInt เพื่อแปลง id เป็นตัวเลข
    const id = parseInt(await params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID ไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    const requestData = await request.json();
    const { reply_message, admin_response } = requestData;
    
    // Get admin session
    const admin = await getAdminFromSession(request.cookies);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์ในการดำเนินการนี้' },
        { status: 403 }
      );
    }
    
    const adminId = admin.id;
    const adminName = admin.username || 'Admin';
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ข้อความ' },
        { status: 400 }
      );
    }
    
    if (!reply_message) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุข้อความตอบกลับ' },
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
    
    // ตารางถูกสร้างโดย migration แล้ว ไม่จำเป็นต้องสร้างที่นี่อีก
    
    // บันทึกข้อความตอบกลับโดยตรงในตาราง contact_message_replies
    try {
      await query(
        `INSERT INTO contact_message_replies (message_id, user_id, reply_text) VALUES (?, ?, ?)`,
        [id, adminId, reply_message]
      );
    } catch (error) {
      console.error('Error inserting into contact_message_replies:', error);
      // หากเกิดข้อผิดพลาดในการบันทึกข้อมูล ให้ส่งข้อความแสดงข้อผิดพลาด
      return NextResponse.json(
        { success: false, message: `เกิดข้อผิดพลาดในการบันทึกข้อความตอบกลับ: ${error.message}` },
        { status: 500 }
      );
    }
    
    // บันทึกการตอบกลับในตาราง contact_message_responses (ถ้ามี)
    try {
      // ตรวจสอบว่ามีตาราง contact_message_responses หรือไม่
      const [tableExists] = await query(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'contact_message_responses'`
      );
      
      if (tableExists && tableExists.count > 0) {
        await query(
          `INSERT INTO contact_message_responses (message_id, admin_id, response_text) VALUES (?, ?, ?)`,
          [id, adminId, admin_response || `ตอบกลับโดยตรงถึงผู้ใช้: ${reply_message.substring(0, 50)}${reply_message.length > 50 ? '...' : ''}`]
        );
      }
    } catch (error) {
      console.error('Error inserting into contact_message_responses:', error);
      // ดำเนินการต่อแม้จะมีข้อผิดพลาด
    }
    
    // อัปเดตสถานะของข้อความเป็น 'replied' และตั้งค่า admin_response เป็น 1
    await query(
      `UPDATE contact_messages 
       SET status = 'replied', 
           admin_response = 1, 
           replied_by_admin_id = ?, 
           replied_at = NOW(), 
           updated_at = NOW() 
       WHERE id = ?`,
      [adminId, id]
    );
    
    // Log admin action
    await query(
      `INSERT INTO admin_actions_log 
       (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, 'contact_message_direct_reply', ?, ?, ?, ?, NOW())`,
      [
        adminId,
        id,
        JSON.stringify({
          action: 'CONTACT_MESSAGE_DIRECT_REPLY',
          message_id: id,
          message_subject: message.subject,
          reply_message: reply_message.substring(0, 100) + (reply_message.length > 100 ? '...' : ''),
          user_email: message.email,
          userId: message.user_id || null,
          timestamp: new Date().toISOString()
        }),
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );
    
    // สร้างการแจ้งเตือนในระบบเมื่อแอดมินตอบข้อความติดต่อโดยตรง
    if (message.user_id) {
      try {
        await createNotification(
          message.user_id,
          'contact_direct_reply',
          `ข้อความติดต่อของคุณเรื่อง "${message.subject}" ได้รับการตอบกลับโดยตรงแล้ว`,
          `/dashboard?tab=contact&messageId=${id}&reply=true`
        );
        console.log('Contact direct reply notification created for user:', message.user_id);
      } catch (notificationError) {
        console.error('Error creating contact direct reply notification:', notificationError);
        // Continue with the process even if notification creation fails
      }
    }
    
    // ส่งอีเมลตอบกลับไปยังผู้ใช้ (ถ้ามีอีเมล)
    if (message.email) {
      try {
        // ส่วนนี้จะต้องมีการเพิ่มโค้ดสำหรับส่งอีเมล
        console.log(`Email would be sent to ${message.email} with reply: ${reply_message}`);
        // ในอนาคตอาจเพิ่มการส่งอีเมลจริงๆ ที่นี่
      } catch (emailError) {
        console.error('Error sending reply email:', emailError);
        // Continue with the process even if email sending fails
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'บันทึกการตอบกลับโดยตรงเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error sending direct reply to message:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อความตอบกลับโดยตรง' },
      { status: 500 }
    );
  }
}
