import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession, logAdminAction } from '@/app/lib/adminAuth';
import { sendApprovalEmail, sendRejectionEmail } from '@/app/lib/mailersend';

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
    
    const { memberId, documentId, action, reason, comment } = await request.json();
    
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
      `UPDATE companies_Member SET Admin_Submit = ?, reject_reason = ?, admin_comment = ? WHERE id = ?`,
      [action === 'approve' ? 1 : 2, action === 'reject' ? reason : null, comment || null, memberId]
    );
    
    // Update document status
    await query(
      `UPDATE documents_Member SET 
        status = ?, 
        Admin_Submit = ?,
        reject_reason = ? 
      WHERE id = ?`,
      [action === 'approve' ? 'approved' : 'rejected', action === 'approve' ? 1 : 2, action === 'reject' ? reason : null, documentId]
    );
    
    // Get user info for logging and email notification
    const companyResult = await query(
      `SELECT c.user_id, c.company_name, u.email, u.firstname, u.lastname, u.name 
       FROM companies_Member c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [memberId]
    );
    
    if (companyResult.length > 0) {
      const { user_id: userId, company_name: companyName, email, firstname, lastname, name } = companyResult[0];
      
      // Determine the user's display name
      const displayName = name || (firstname && lastname ? `${firstname} ${lastname}` : companyName || 'สมาชิก');
      
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
      
      // Send email notification
      if (email) {
        try {
          if (action === 'approve') {
            await sendApprovalEmail(email, displayName, comment);
          } else {
            await sendRejectionEmail(email, displayName, reason || 'ไม่ระบุเหตุผล');
          }
          
          console.log(`Email notification sent to ${email}`);
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Continue with the process even if email fails
        }
      }
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
