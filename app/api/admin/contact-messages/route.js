import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start') || '';
    const endDate = searchParams.get('end') || '';
    const status = searchParams.get('status') || '';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Prepare search and date conditions
    let conditions = [];
    let conditionParams = [];
    
    // Add search condition if search term provided
    if (search) {
      conditions.push(`(cm.subject LIKE ? OR cm.message LIKE ? OR cm.name LIKE ? OR cm.email LIKE ?)`);
      conditionParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add date range conditions if provided
    if (startDate) {
      conditions.push(`DATE(cm.created_at) >= ?`);
      conditionParams.push(startDate);
    }
    
    if (endDate) {
      conditions.push(`DATE(cm.created_at) <= ?`);
      conditionParams.push(endDate);
    }
    
    // Add status filter if provided
    if (status) {
      if (status === 'all') {
        // No filter needed, show all statuses
      } else if (['unread', 'read', 'replied'].includes(status)) {
        conditions.push(`cm.status = ?`);
        conditionParams.push(status);
      }
    }
    
    // Combine all conditions
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count of messages matching criteria
    const countQuery = `SELECT COUNT(*) as total FROM contact_messages cm ${whereClause}`;
    const countResult = await query(countQuery, conditionParams);
    
    const total = countResult[0].total;
    
    // ตรวจสอบว่ามีตาราง contact_message_responses หรือไม่
    try {
      await query(
        `CREATE TABLE IF NOT EXISTS contact_message_responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message_id INT NOT NULL,
          admin_id INT NOT NULL,
          response_text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (message_id) REFERENCES contact_messages(id)
        )`
      );
    } catch (error) {
      console.error('Error creating contact_message_responses table:', error);
      // ไม่ต้อง throw error เพราะถ้าตารางมีอยู่แล้วก็ไม่เป็นไร
    }
    
    // Get messages from database with pagination, search and date filters
    const messagesQuery = `SELECT 
      cm.id,
      cm.user_id,
      cm.subject,
      cm.message,
      cm.name,
      cm.email,
      cm.phone,
      cm.status,
      cm.admin_response,
      cm.created_at,
      cm.updated_at,
      cm.read_by_admin_id,
      cm.replied_by_admin_id,
      cm.read_at,
      cm.replied_at,
      (SELECT response_text FROM contact_message_responses WHERE message_id = cm.id ORDER BY created_at DESC LIMIT 1) as response_text,
      read_admin.name as read_by_admin_name,
      reply_admin.name as replied_by_admin_name
    FROM 
      contact_messages cm
    LEFT JOIN
      admin_users read_admin ON cm.read_by_admin_id = read_admin.id
    LEFT JOIN
      admin_users reply_admin ON cm.replied_by_admin_id = reply_admin.id
    ${whereClause}
    ORDER BY 
      CASE 
        WHEN cm.status = 'unread' THEN 0
        WHEN cm.status = 'read' THEN 1
        ELSE 2
      END,
      cm.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`;
    
    const messages = await query(messagesQuery, conditionParams);
    
    // แปลงข้อมูลให้เข้ากับรูปแบบเดิม
    const processedMessages = messages.map(message => ({
      ...message,
      admin_response: message.response_text || null
    }));
    
    return NextResponse.json({
      success: true,
      messages: processedMessages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความติดต่อ' },
      { status: 500 }
    );
  }
}
