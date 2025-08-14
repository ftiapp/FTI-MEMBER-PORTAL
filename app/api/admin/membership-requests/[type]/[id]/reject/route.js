import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';
import { sendRejectionEmail } from '@/app/lib/mailersend';

export async function GET(request, { params }) {
  let connection;
  try {
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { type, id } = await params;
    const validTypes = ['oc', 'am', 'ac', 'ic'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid membership type' }, { status: 400 });
    }
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    connection = await getConnection();

    let query;
    if (type === 'ic') {
      query = `
        SELECT u.email AS email,
               u.firstname AS first_name,
               u.lastname AS last_name,
               CONCAT(m.first_name_th, ' ', m.last_name_th) AS company_name,
               m.id_card_number AS tax_id
        FROM MemberRegist_IC_Main m
        INNER JOIN users u ON u.id = m.user_id
        WHERE m.id = ?`;
    } else {
      const tableMap = {
        'oc': 'MemberRegist_OC_Main',
        'am': 'MemberRegist_AM_Main',
        'ac': 'MemberRegist_AC_Main'
      };
      const table = tableMap[type];
      query = `
        SELECT u.email AS email,
               u.firstname AS first_name,
               u.lastname AS last_name,
               m.company_name_th AS company_name,
               m.tax_id AS tax_id
        FROM ${table} m
        INNER JOIN users u ON u.id = m.user_id
        WHERE m.id = ?`;
    }

    const [rows] = await connection.execute(query, [id]);
    const email = rows?.[0]?.email || null;
    const firstName = rows?.[0]?.first_name || '';
    const lastName = rows?.[0]?.last_name || '';
    const recipientName = `${firstName} ${lastName}`.trim() || null;
    const companyName = rows?.[0]?.company_name || null;
    const taxId = rows?.[0]?.tax_id || null;

    return NextResponse.json({ success: true, recipientEmail: email, recipientName, companyName, taxId });
  } catch (error) {
    console.error('Error in GET reject preview:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch recipient preview' }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch {}
    }
  }
}

export async function POST(request, { params }) {
  let connection;
  
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
    connection = await getConnection();

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
          tableName = 'MemberRegist_IC_Main';
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

      // Fetch applicant details for email notification and description
      let email = '';
      let firstName = '';
      let lastName = '';
      let companyName = '';
      let memberCode = '';
      
      try {
        let query;
        if (type === 'ic') {
          // For IC, send to the account owner's email from users; use user's name for greeting, and the applicant's full name as company_name display
          query = `
            SELECT u.email AS email,
                   u.firstname AS first_name,
                   u.lastname AS last_name,
                   CONCAT(m.first_name_th, ' ', m.last_name_th) AS company_name,
                   NULL AS member_code,
                   m.id_card_number AS tax_id
            FROM MemberRegist_IC_Main m
            INNER JOIN users u ON u.id = m.user_id
            WHERE m.id = ?`;
        } else {
          // For OC, AM, AC: send to users.email by user_id
          const tableMap = {
            'oc': 'MemberRegist_OC_Main',
            'am': 'MemberRegist_AM_Main',
            'ac': 'MemberRegist_AC_Main'
          };
          const table = tableMap[type];
          query = `
            SELECT u.email AS email,
                   u.firstname AS first_name,
                   u.lastname AS last_name,
                   m.company_name_th AS company_name,
                   m.member_code AS member_code,
                   m.tax_id AS tax_id
            FROM ${table} m
            INNER JOIN users u ON u.id = m.user_id
            WHERE m.id = ?`;
        }
        
        const [rows] = await connection.execute(query, [id]);
        if (rows && rows.length > 0) {
          email = rows[0].email || '';
          firstName = rows[0].first_name || '';
          lastName = rows[0].last_name || '';
          companyName = rows[0].company_name || '';
          memberCode = rows[0].member_code || '';
          var taxId = rows[0].tax_id || '';
        }
      } catch (error) {
        console.error('Error fetching applicant details:', error);
        // Continue with empty values if there's an error
      }
      
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
      
      // Send rejection email if we have the required information
      // ย้าย email sending ออกมาจาก transaction เพื่อไม่ให้ blocking
      let emailSent = false;
      // Do not require memberCode; many pending applications don't have it yet
      if (email && (firstName || lastName)) {
        try {
          await sendRejectionEmail(
            email,
            firstName,
            lastName,
            memberCode || '-',
            companyName || '-',
            rejectionReason || '-'
          );
          console.log(`Rejection email sent to ${email}`);
          emailSent = true;
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
          // Don't throw error here, just log it - we still want to return success
          // since the database transaction was successful
        }
      } else {
        console.warn('Could not send rejection email due to missing applicant information');
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Membership request rejected successfully',
        emailSent: emailSent,
        recipientEmail: email || null,
        recipientName: `${firstName || ''} ${lastName || ''}`.trim() || null,
        companyName: companyName || null,
        taxId: taxId || null
      });
    } catch (transactionError) {
      // Rollback transaction on error
      await connection.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('Error rejecting membership request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject membership request' },
      { status: 500 }
    );
  } finally {
    // ปิด connection ในทุกกรณี
    if (connection) {
      try {
        connection.release(); // เปลี่ยนจาก connection.end() เป็น connection.release()
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}