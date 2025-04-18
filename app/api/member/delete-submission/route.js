import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';

/**
 * POST handler for deleting a member verification submission
 * 
 * This endpoint allows users to delete their rejected member verification submissions.
 * It also logs the deletion action in the Member_portal_User_log table.
 */
export async function POST(request) {
  try {
    // Get user from cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie.value);
    
    // Get request data
    const data = await request.json();
    const { submissionId, userId, memberNumber } = data;
    
    // Verify that the submission belongs to the user
    if (user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์ในการลบข้อมูลนี้' },
        { status: 403 }
      );
    }
    
    // Check if the submission exists and is rejected
    const submissionCheck = await query(
      `SELECT * FROM companies_Member WHERE id = ? AND user_id = ? AND Admin_Submit = 2`,
      [submissionId, userId]
    );
    
    if (submissionCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลการยืนยันสมาชิกที่ถูกปฏิเสธ' },
        { status: 404 }
      );
    }
    
    // Delete the submission
    await query(
      `DELETE FROM companies_Member WHERE id = ? AND user_id = ?`,
      [submissionId, userId]
    );
    
    // Delete associated documents
    await query(
      `DELETE FROM documents_Member WHERE user_id = ? AND MEMBER_CODE = ?`,
      [userId, memberNumber]
    );
    
    // Log the deletion action
    const userIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await query(
      `INSERT INTO Member_portal_User_log (user_id, action, details, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId, 
        'Delete_MEMBER_VERIFICATION', 
        JSON.stringify({
          submissionId,
          memberNumber,
          timestamp: new Date().toISOString()
        }),
        userIp,
        userAgent
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลการยืนยันสมาชิกเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error deleting member submission:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    );
  }
}
