import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { getUserFromSession } from '@/app/lib/userAuth';
import { updateACApplication } from '@/app/lib/ac-application';
import { updateOCApplication } from '@/app/lib/oc-application';
import { updateAMApplication } from '@/app/lib/am-application';
import { updateICApplication } from '@/app/lib/ic-application';

export async function POST(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    const body = await request.json();
    const { formData, userComment, apiData } = body;
    
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

      // อัปเดตข้อมูลตามประเภทสมาชิก
      if (membership_type === 'ac' && formData) {
        // ใช้ utility function สำหรับ AC
        await updateACApplication(membership_id, formData, userId, id, userComment, apiData);
      } else if (membership_type === 'oc' && formData) {
        // ใช้ utility function สำหรับ OC
        await updateOCApplication(membership_id, formData, userId, id, userComment);
      } else if (membership_type === 'am' && formData) {
        await updateAMApplication(membership_id, formData, userId, id, userComment);
      } else if (membership_type === 'ic' && formData) {
        await updateICApplication(membership_id, formData, userId, id, userComment);
      } else {
        // ถ้าไม่มี formData ให้ทำแบบเดิม (แค่เปลี่ยนสถานะ)
        await legacyResubmit(connection, membership_type, membership_id, userId, id);
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'ส่งใบสมัครใหม่เรียบร้อยแล้ว ข้อมูลของท่านได้รับการอัปเดตและส่งไปยังผู้ดูแลระบบเพื่อพิจารณาใหม่',
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
      message: 'ไม่สามารถส่งใบสมัครใหม่ได้ กรุณาลองใหม่อีกครั้ง' 
    }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch {}
    }
  }
}

/**
 * ฟังก์ชันสำหรับ resubmit แบบเดิม (แค่เปลี่ยนสถานะ) สำหรับกรณีที่ไม่มี formData
 */
async function legacyResubmit(connection, membership_type, membership_id, userId, rejectionId) {
  // Mark rejection data as inactive (resubmitted)
  await connection.execute(`
    UPDATE MemberRegist_Reject_DATA 
    SET is_active = 0, resubmitted_at = NOW(), updated_at = NOW() 
    WHERE id = ?
  `, [rejectionId]);

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

  // บันทึก log ของผู้ใช้
  await connection.execute(`
    INSERT INTO Member_portal_User_log (user_id, action_type, details, created_at)
    VALUES (?, 'resubmit_membership', ?, NOW())
  `, [userId, JSON.stringify({ membershipType: membership_type, membershipId: membership_id, rejectionId, method: 'legacy' })]);
}

