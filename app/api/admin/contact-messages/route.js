import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start') || '';
    const endDate = searchParams.get('end') || '';
    
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
    
    // Combine all conditions
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count of messages matching criteria
    const countQuery = `SELECT COUNT(*) as total FROM contact_messages cm ${whereClause}`;
    const countResult = await query(countQuery, conditionParams);
    
    const total = countResult[0].total;
    
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
      cm.updated_at
    FROM 
      contact_messages cm
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
    
    return NextResponse.json({
      success: true,
      messages,
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
