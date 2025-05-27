import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request) {
  try {
    // Get the request body
    const { email, memberCode, selectedTsicCodes } = await request.json();
    
    // Basic validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(selectedTsicCodes) || selectedTsicCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No TSIC codes provided' },
        { status: 400 }
      );
    }

    if (!memberCode) {
      return NextResponse.json(
        { success: false, message: 'Member code is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const userData = await query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    
    if (!userData || userData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userData[0].id;
    const userEmail = userData[0].email;

    // Check for existing pending requests
    const existingRequests = await query(
      'SELECT id FROM pending_tsic_updates WHERE user_id = ? AND member_code = ? AND status = "pending"',
      [userId, memberCode]
    );
    
    // If there's an existing pending request, delete it
    if (existingRequests && existingRequests.length > 0) {
      await query(
        'DELETE FROM pending_tsic_updates WHERE id = ?',
        [existingRequests[0].id]
      );
    }

    // Insert new TSIC request into pending_tsic_updates
    const tsicData = JSON.stringify(selectedTsicCodes);
    await query(
      `INSERT INTO pending_tsic_updates 
      (user_id, member_code, tsic_data, request_date, status, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), 'pending', NOW(), NOW())`,
      [userId, memberCode, tsicData]
    );

    // Log the action
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await query(
      `INSERT INTO Member_portal_User_log 
      (user_id, action, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        'tsic_update_request',
        `User ${userEmail} (${memberCode}) requested TSIC code update: ${selectedTsicCodes.join(', ')}`,
        ipAddress,
        userAgent
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขออัพเดทรหัส TSIC เรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ',
      data: {
        codesUpdated: selectedTsicCodes.length,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error in TSIC update:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการอัพเดทรหัส TSIC กรุณาลองใหม่อีกครั้ง',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
