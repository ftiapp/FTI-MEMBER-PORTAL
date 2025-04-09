import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession, logAdminAction } from '@/app/lib/adminAuth';

export async function POST(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }
    
    const { memberId, documentId, action, reason } = await request.json();
    
    if (!memberId || !documentId || !action) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Check if action is valid
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, message: 'การกระทำไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // Update company member status
    await query(
      `UPDATE companies_Member SET Admin_Submit = ? WHERE id = ?`,
      [action === 'approve' ? 1 : 2, memberId]
    );
    
    // Update document status
    await query(
      `UPDATE documents_Member SET 
        status = ?, 
        Admin_Submit = ? 
      WHERE id = ?`,
      [action === 'approve' ? 'approved' : 'rejected', action === 'approve' ? 1 : 2, documentId]
    );
    
    // Get user ID for logging
    const companyResult = await query(
      `SELECT user_id FROM companies_Member WHERE id = ?`,
      [memberId]
    );
    
    if (companyResult.length > 0) {
      const userId = companyResult[0].user_id;
      
      // Log admin action
      await logAdminAction(
        admin.id,
        action === 'approve' ? 'approve_member' : 'reject_member',
        memberId,
        action === 'approve' 
          ? 'Member approved' 
          : `Member rejected. Reason: ${reason || 'No reason provided'}`,
        request
      );
      
      // Log in Member_portal_User_log
      await query(
        `INSERT INTO Member_portal_User_log 
         (user_id, action, details, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          'member_verification',
          action === 'approve' 
            ? 'Member verification approved by admin' 
            : `Member verification rejected. Reason: ${reason || 'No reason provided'}`,
          request.headers.get('x-forwarded-for') || '',
          request.headers.get('user-agent') || ''
        ]
      );
    }
    
    return NextResponse.json({
      success: true,
      message: action === 'approve' 
        ? 'อนุมัติสมาชิกเรียบร้อยแล้ว' 
        : 'ปฏิเสธสมาชิกเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error approving/rejecting member:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  }
}
