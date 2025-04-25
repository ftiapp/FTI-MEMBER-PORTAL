import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Ensure params is properly awaited for dynamic route
    const paramsObj = await params;
    const { id } = paramsObj;
    const messageId = id;
    
    console.log('Request for message ID:', messageId, 'from user ID:', userId);
    
    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรหัสข้อความ' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรหัสผู้ใช้' },
        { status: 400 }
      );
    }
    
    console.log('Fetching message with ID:', messageId);
    
    // Fetch the specific contact message
    const messages = await query(
      `SELECT id, user_id, subject, message, name, email, phone, status, created_at, updated_at
       FROM contact_messages
       WHERE id = ?`,
      [messageId]
    );
    
    console.log('Query result:', messages);
    
    if (!messages || messages.length === 0) {
      console.log('No message found with ID:', messageId);
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อความ' },
        { status: 404 }
      );
    }
    
    const message = messages[0];
    
    // Check if the authenticated user is requesting their own message
    console.log('Message user_id:', message.user_id, 'Request userId:', userId);
    console.log('Message data:', message);
    
    if (parseInt(message.user_id) !== parseInt(userId)) {
      console.log('Authorization failed: User IDs do not match');
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์ในการดูข้อความนี้' },
        { status: 403 }
      );
    }
    
    console.log('Sending successful response with message data');
    const response = {
      success: true,
      message: message
    };
    console.log('Response object:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ' },
      { status: 500 }
    );
  }
}
