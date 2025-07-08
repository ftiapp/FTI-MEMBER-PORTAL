import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/app/lib/auth';
import { query } from '@/app/lib/db';
import { logAdminAction } from '@/app/lib/adminAuth';
import { sendEmail } from '@/app/lib/email';

/**
 * PUT /api/admin/ic-membership/[id]/status
 * 
 * Updates the status of an IC membership application (approve/reject)
 * and sends notification email to the applicant
 */
export async function PUT(request, { params }) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin permissions
    if (admin.adminLevel !== 'super_admin' && (admin.adminLevel !== 'admin' || admin.canUpdate !== 1)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();
    
    // Validate status
    if (data.status !== 1 && data.status !== 2) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    // Get application details for email notification
    const applicationQuery = `
      SELECT *
      FROM ICmember_Info
      WHERE id = ?
    `;
    
    const applicationResult = await query(applicationQuery, [id]);
    
    if (applicationResult.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    const application = applicationResult[0];
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update status in all related tables
      const tables = [
        'ICmember_Info',
        'ICmember_Province_Group',
        'ICmember_Industry_Group',
        'ICmember_Representatives',
        'ICmember_Addr',
        'ICmember_Business_Info',
        'ICmember_Business_Categories',
        'ICmember_Products'
      ];
      
      for (const table of tables) {
        await query(`UPDATE ${table} SET status = ? WHERE ic_member_id = ?`, [data.status, id]);
      }
      
      // Commit the transaction
      await query('COMMIT');
      
      // Log the admin action
      const actionType = data.status === 1 ? 'ic_approve_regist' : 'ic_reject_regist';
      await logAdminAction({
        adminId: session.user.id,
        actionType,
        targetId: parseInt(id),
        description: `${data.status === 1 ? 'Approved' : 'Rejected'} IC membership application for ${application.first_name_thai} ${application.last_name_thai} (ID Card: ${application.id_card_number})`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      // Send email notification
      if (application.email) {
        const emailSubject = data.status === 1
          ? 'การสมัครสมาชิก IC ของท่านได้รับการอนุมัติแล้ว'
          : 'ผลการพิจารณาการสมัครสมาชิก IC';
        
        const emailContent = data.status === 1
          ? `เรียน คุณ${application.first_name_thai} ${application.last_name_thai}
            
            ทางสภาอุตสาหกรรมแห่งประเทศไทยขอแจ้งให้ทราบว่า การสมัครสมาชิก IC ของท่านได้รับการอนุมัติเรียบร้อยแล้ว
            
            ขอบคุณที่ท่านให้ความสนใจสมัครเป็นสมาชิกกับเรา
            
            ด้วยความเคารพ,
            สภาอุตสาหกรรมแห่งประเทศไทย`
          : `เรียน คุณ${application.first_name_thai} ${application.last_name_thai}
            
            ทางสภาอุตสาหกรรมแห่งประเทศไทยขอแจ้งให้ทราบว่า การสมัครสมาชิก IC ของท่านไม่ได้รับการอนุมัติในขณะนี้
            
            เหตุผล: ${data.reason || 'ไม่ระบุเหตุผล'}
            
            ท่านสามารถสมัครใหม่อีกครั้งโดยแก้ไขข้อมูลให้ถูกต้องและครบถ้วน
            
            หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่ของเราได้ที่ [ข้อมูลการติดต่อ]
            
            ด้วยความเคารพ,
            สภาอุตสาหกรรมแห่งประเทศไทย`;
        
        await sendEmail({
          to: application.email,
          subject: emailSubject,
          text: emailContent
        });
      }
      
      return NextResponse.json({
        success: true,
        message: data.status === 1
          ? 'Application approved successfully'
          : 'Application rejected successfully'
      });
      
    } catch (error) {
      // Rollback the transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating IC membership application status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
