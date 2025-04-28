// app/api/contact/not-user-message/route.js
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, phone, subject, message } = data;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // Validate message length
    if (message.length > 300) {
      return NextResponse.json(
        { success: false, message: 'ข้อความต้องไม่เกิน 300 ตัวอักษร' },
        { status: 400 }
      );
    }
    
    // Insert guest contact message into database
    await query(
      `INSERT INTO guest_contact_messages 
       (name, email, phone, subject, message, status, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, 'unread', ?, ?, NOW())`,
      [
        name, 
        email, 
        phone, 
        subject, 
        message, 
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'ส่งข้อความเรียบร้อยแล้ว ขอบคุณที่ติดต่อเรา'
    });
  } catch (error) {
    console.error('Error submitting guest contact message:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}