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
    
    // Fetch admin details from database to get the name
    const adminDetails = await query(
      'SELECT name FROM admin_users WHERE id = ? LIMIT 1',
      [admin.id]
    );
    
    // Get admin name or use a default if not found
    const adminName = adminDetails.length > 0 ? adminDetails[0].name : 'Admin';
    
    const { memberId, documentId, action, reason, comment } = await request.json();
    
    if (!memberId || !documentId || !action) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Check if action is valid
    if (action !== 'approve' && action !== 'reject' && action !== 'delete') {
      return NextResponse.json(
        { success: false, message: 'การกระทำไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // Update company member status
    let adminSubmitValue = 0;
    if (action === 'approve') adminSubmitValue = 1;
    else if (action === 'reject') adminSubmitValue = 2;
    else if (action === 'delete') adminSubmitValue = 3;
    
    await query(
      `UPDATE companies_Member SET Admin_Submit = ?, reject_reason = ?, admin_comment = ?, admin_id = ?, admin_name = ? WHERE id = ?`,
      [adminSubmitValue, action === 'reject' ? reason : null, comment || null, admin.id, adminName, memberId]
    );
    
    // If approving, get the user_id to update their role to 'member'
    if (action === 'approve') {
      const userResult = await query(
        `SELECT user_id FROM companies_Member WHERE id = ?`,
        [memberId]
      );
      
      if (userResult.length > 0) {
        const userId = userResult[0].user_id;
        
        // Update user role from 'default_user' to 'member'
        await query(
          `UPDATE users SET role = 'member' WHERE id = ? AND role = 'default_user'`,
          [userId]
        );
      }
    }
    
    // Update document status
    let docStatus = 'pending';
    let docAdminSubmit = 0;
    
    if (action === 'approve') {
      docStatus = 'approved';
      docAdminSubmit = 1;
    } else if (action === 'reject') {
      docStatus = 'rejected';
      docAdminSubmit = 2;
    } else if (action === 'delete') {
      // ใช้สถานะ 'rejected' แทน 'deleted' เนื่องจาก enum ในฐานข้อมูลไม่มีค่า 'deleted'
      docStatus = 'rejected';
      docAdminSubmit = 3;
    }
    
    await query(
      `UPDATE documents_Member SET 
        status = ?, 
        Admin_Submit = ?,
        reject_reason = ?,
        admin_id = ?,
        admin_name = ? 
      WHERE id = ?`,
      [docStatus, docAdminSubmit, action === 'reject' ? reason : null, admin.id, adminName, documentId]
    );
    
    // Get user info for logging and email notification
    const companyResult = await query(
      `SELECT c.user_id, c.company_name, c.MEMBER_CODE, u.email, u.firstname, u.lastname, u.name 
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
      let actionType = 'other';
      let actionDetails = '';
      
      if (action === 'approve') {
        actionType = 'approve_member';
        actionDetails = 'Member approved';
      } else if (action === 'reject') {
        actionType = 'reject_member';
        actionDetails = `Member rejected. Reason: ${reason || 'No reason provided'}`;
      } else if (action === 'delete') {
        actionType = 'other';
        actionDetails = `Member deleted (status changed to 3)`;
      }
      
      await logAdminAction(
        admin.id,
        actionType,
        memberId,
        actionDetails,
        request
      );
      
      // Log in Member_portal_User_log
      let logDetails = '';
      
      if (action === 'approve') {
        logDetails = 'Member verification approved by admin';
      } else if (action === 'reject') {
        logDetails = `Member verification rejected. Reason: ${reason || 'No reason provided'}`;
      } else if (action === 'delete') {
        logDetails = 'Member verification deleted by admin';
      }
      
      await query(
        `INSERT INTO Member_portal_User_log 
         (user_id, action, details, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          'member_verification',
          logDetails,
          request.headers.get('x-forwarded-for') || '',
          request.headers.get('user-agent') || ''
        ]
      );
      
      // Send email notification
      if (email && action !== 'delete') { // Don't send email for delete action
        try {
          const { MEMBER_CODE, company_name, firstname, lastname } = companyResult[0];
          
          if (action === 'approve') {
            await sendApprovalEmail(email, firstname, lastname, MEMBER_CODE, company_name, comment);
          } else if (action === 'reject') {
            await sendRejectionEmail(email, firstname, lastname, MEMBER_CODE, company_name, reason || 'ไม่ระบุเหตุผล');
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
        : action === 'reject'
        ? 'ปฏิเสธสมาชิกเรียบร้อยแล้ว'
        : 'ลบข้อมูลสมาชิกเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error approving/rejecting member:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  }
}
