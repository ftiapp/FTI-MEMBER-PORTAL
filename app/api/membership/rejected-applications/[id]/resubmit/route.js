import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { getUserFromSession } from '@/app/lib/userAuth';

export async function POST(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Verify ownership and get rejection data
      const [rejectedApp] = await connection.execute(`
        SELECT membership_type, membership_id 
        FROM MemberRegist_Reject_DATA 
        WHERE id = ? AND user_id = ? AND is_active = 1
      `, [id, userId]);

      if (!rejectedApp.length) {
        throw new Error('Rejected application not found or access denied');
      }

      const { membership_type, membership_id } = rejectedApp[0];

      // Mark rejection data as inactive (resubmitted)
      await connection.execute(`
        UPDATE MemberRegist_Reject_DATA 
        SET is_active = 0, resubmitted_at = NOW(), updated_at = NOW() 
        WHERE id = ?
      `, [id]);

      // Update the main application status back to pending (status = 0) and increment resubmission count
      const tableMap = {
        'oc': 'MemberRegist_OC_Main',
        'am': 'MemberRegist_AM_Main',
        'ac': 'MemberRegist_AC_Main',
        'ic': 'MemberRegist_IC_Main'
      };

      const mainTable = tableMap[membership_type];
      await connection.execute(`
        UPDATE ${mainTable} 
        SET status = 0, 
            resubmission_count = resubmission_count + 1,
            rejection_reason = NULL,
            updated_at = NOW()
        WHERE id = ?
      `, [membership_id]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Application resubmitted successfully',
        data: {
          membershipType: membership_type,
          membershipId: membership_id
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error resubmitting rejected application:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to resubmit application' 
    }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch {}
    }
  }
}
