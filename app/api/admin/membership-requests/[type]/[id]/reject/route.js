import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

export async function POST(request, { params }) {
  try {
    // Verify admin token
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { type, id } = await params;
    
    // Validate type parameter
    const validTypes = ['oc', 'am', 'ac', 'ic'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid membership type' }, { status: 400 });
    }

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { adminNote, rejectionReason } = body;

    // Validate rejection reason
    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Rejection reason is required' 
      }, { status: 400 });
    }

    // Get database connection
    const connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Update membership request status to rejected (2)
      let tableName;
      switch (type) {
        case 'oc':
          tableName = 'MemberRegist_OC_Main';
          break;
        case 'am':
          tableName = 'MemberRegist_AM_Main';
          break;
        case 'ac':
          tableName = 'MemberRegist_AC_Main';
          break;
        case 'ic':
          tableName = 'ICmember_Info';
          break;
      }

      // Update status to rejected (2)
      await connection.execute(
        `UPDATE ${tableName} SET status = 2, rejection_reason = ? WHERE id = ?`,
        [rejectionReason, id]
      );

      // Save admin note directly to the main table if provided
      if (adminNote && adminNote.trim()) {
        await connection.execute(
          `UPDATE ${tableName} SET admin_note = ?, admin_note_by = ?, admin_note_at = NOW() WHERE id = ?`,
          [adminNote, adminData.id, id]
        );
      }

      // Log admin action
      const memberTypeMap = {
        'oc': 'สน (สามัญ-โรงงาน)',
        'am': 'สส (สามัญ-สมาคมการค้า)',
        'ac': 'ทน (สมทบ-นิติบุคคล)',
        'ic': 'ทบ (สมทบ-บุคคลธรรมดา)'
      };
      
      const description = `ปฏิเสธคำขอสมัครสมาชิกประเภท ${memberTypeMap[type]} ID: ${id} เหตุผล: ${rejectionReason}`;
      
      await connection.execute(
        `INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminData.id,
          'reject_member',
          id,
          description,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        ]
      );

      // Commit transaction
      await connection.commit();
      
      // Close connection
      await connection.end();

      return NextResponse.json({ 
        success: true, 
        message: 'Membership request rejected successfully' 
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error rejecting membership request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject membership request' },
      { status: 500 }
    );
  }
}
