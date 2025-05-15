import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';

/**
 * API endpoint for requesting TSIC code update
 * POST /api/member/request-tsic-update
 */
export async function POST(request) {
  try {
    // ข้ามการตรวจสอบ session สำหรับการทดสอบ
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    // Parse request body
    const body = await request.json();
    const { userId, memberCode, tsicCodes } = body;
    
    // Validate request data
    if (!userId || !memberCode || !tsicCodes || !Array.isArray(tsicCodes) || tsicCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // สำหรับการทดสอบ: ใช้ user_id ที่มีอยู่จริงในระบบ
    // ดึง user_id ที่มีอยู่จริงในระบบ
    const users = await query('SELECT id FROM users LIMIT 1');
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้ใช้ในระบบ' },
        { status: 500 }
      );
    }
    
    // ใช้ user_id ที่มีอยู่จริงแทน user_id ที่ส่งมา
    const validUserId = users[0].id;
    console.log(`Using valid user ID: ${validUserId} instead of provided ID: ${userId}`);
    
    // Check if there's already a pending request for this member
    const existingRequests = await query(
      'SELECT * FROM pending_tsic_updates WHERE member_code = ? AND status = ?',
      [memberCode, 'pending']
    );
    
    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'มีคำขอที่รอการอนุมัติอยู่แล้ว กรุณารอการอนุมัติหรือติดต่อเจ้าหน้าที่' 
        },
        { status: 400 }
      );
    }
    
    // Create a new TSIC update request
    const result = await query(
      'INSERT INTO pending_tsic_updates (user_id, member_code, tsic_data, request_date, status) VALUES (?, ?, ?, ?, ?)',
      [
        validUserId, // ใช้ user_id ที่มีอยู่จริงแทน userId ที่ส่งมา
        memberCode,
        JSON.stringify(tsicCodes), // Store all TSIC data as JSON
        new Date(),
        'pending'
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'คำขอของท่านได้ถูกส่งไปยังเจ้าหน้าที่แล้ว กรุณารอการอนุมัติ',
      requestId: result.insertId
    });
    
  } catch (error) {
    console.error('Error in TSIC update request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
