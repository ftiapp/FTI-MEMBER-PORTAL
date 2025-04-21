import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function PUT(request, { params }) {
  try {
    // ใช้ params แบบ asynchronous
    const id = await params?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ข้อความ' },
        { status: 400 }
      );
    }
    
    // Update message status to read
    await query(
      `UPDATE contact_messages 
       SET status = 'read' 
       WHERE id = ?`,
      [id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'อัปเดตสถานะข้อความเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะข้อความ' },
      { status: 500 }
    );
  }
}
