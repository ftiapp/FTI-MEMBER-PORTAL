import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get user ID from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรหัสผู้ใช้' },
        { status: 400 }
      );
    }
    
    // Verify user authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      );
    }
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      
      // Check if the authenticated user is requesting their own messages
      if (decoded.id !== parseInt(userId)) {
        return NextResponse.json(
          { success: false, message: 'ไม่มีสิทธิ์ในการดูข้อความนี้' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'โทเค็นไม่ถูกต้อง' },
        { status: 401 }
      );
    }
    
    // Fetch user's contact messages
    const messages = await query(
      `SELECT id, subject, message, status, created_at, updated_at
       FROM contact_messages
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching user contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อความติดต่อ' },
      { status: 500 }
    );
  }
}
