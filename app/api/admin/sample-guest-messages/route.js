import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET() {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if there are already messages
    const checkQuery = 'SELECT COUNT(*) as count FROM guest_contact_messages';
    const checkResult = await query(checkQuery);
    
    if (checkResult[0].count > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sample data already exists',
        count: checkResult[0].count
      });
    }

    // Sample data
    const sampleMessages = [
      {
        name: 'สมชาย ใจดี',
        email: 'somchai@example.com',
        phone: '0812345678',
        subject: 'สอบถามข้อมูลบริษัท',
        message: 'ผมอยากทราบข้อมูลเพิ่มเติมเกี่ยวกับบริษัทของคุณครับ มีบริการอะไรบ้าง',
        status: 'unread',
        priority: 'medium',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      {
        name: 'สมศรี มีสุข',
        email: 'somsri@example.com',
        phone: '0898765432',
        subject: 'ขอใบเสนอราคา',
        message: 'ดิฉันสนใจบริการของทางบริษัท รบกวนส่งใบเสนอราคามาให้ดิฉันด้วยค่ะ',
        status: 'read',
        priority: 'high',
        ip_address: '192.168.1.2',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      },
      {
        name: 'วิชัย รักเรียน',
        email: 'wichai@example.com',
        phone: '0823456789',
        subject: 'ปัญหาการเข้าถึงเว็บไซต์',
        message: 'ผมพยายามเข้าเว็บไซต์ของคุณแล้วมีปัญหา ไม่สามารถเข้าถึงหน้าสมัครสมาชิกได้ครับ',
        status: 'replied',
        priority: 'medium',
        replied_at: new Date(),
        reply_message: 'เรียนคุณวิชัย\n\nขอบคุณที่แจ้งปัญหาให้เราทราบ ทางทีมเทคนิคได้ทำการแก้ไขปัญหาเรียบร้อยแล้ว กรุณาลองเข้าใช้งานอีกครั้ง\n\nขอบคุณครับ',
        assigned_to: admin.name,
        ip_address: '192.168.1.3',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      {
        name: 'นารี ดีงาม',
        email: 'naree@example.com',
        phone: '0834567890',
        subject: 'ขอข้อมูลการสมัครงาน',
        message: 'สวัสดีค่ะ ดิฉันสนใจสมัครงานกับบริษัทของคุณ มีตำแหน่งงานว่างอะไรบ้างคะ',
        status: 'closed',
        priority: 'low',
        replied_at: new Date(Date.now() - 86400000), // 1 day ago
        reply_message: 'เรียนคุณนารี\n\nขอบคุณที่สนใจร่วมงานกับเรา ปัจจุบันเรามีตำแหน่งงานว่างดังนี้\n1. นักพัฒนาซอฟต์แวร์\n2. นักการตลาดดิจิทัล\n3. เจ้าหน้าที่บัญชี\n\nคุณสามารถส่งประวัติมาที่ hr@example.com ได้เลยค่ะ\n\nขอบคุณค่ะ',
        closed_at: new Date(),
        assigned_to: admin.name,
        ip_address: '192.168.1.4',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'
      },
      {
        name: 'ประเสริฐ มั่งมี',
        email: 'prasert@example.com',
        phone: '0845678901',
        subject: 'แจ้งปัญหาการชำระเงิน',
        message: 'ผมพยายามชำระเงินผ่านบัตรเครดิตแล้วเกิดข้อผิดพลาด รบกวนช่วยตรวจสอบให้หน่อยครับ',
        status: 'unread',
        priority: 'high',
        ip_address: '192.168.1.5',
        user_agent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      }
    ];

    // Insert sample data
    for (const message of sampleMessages) {
      const insertQuery = `
        INSERT INTO guest_contact_messages 
        (name, email, phone, subject, message, status, priority, replied_at, reply_message, closed_at, assigned_to, ip_address, user_agent, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      await query(insertQuery, [
        message.name,
        message.email,
        message.phone,
        message.subject,
        message.message,
        message.status,
        message.priority,
        message.replied_at || null,
        message.reply_message || null,
        message.closed_at || null,
        message.assigned_to || null,
        message.ip_address,
        message.user_agent
      ]);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data inserted successfully',
      count: sampleMessages.length
    });
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to insert sample data' },
      { status: 500 }
    );
  }
}
