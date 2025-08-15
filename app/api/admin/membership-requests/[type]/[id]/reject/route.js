import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';
import { sendRejectionEmail } from '@/app/lib/mailersend';

// Function to fetch complete application data for resubmission
async function fetchCompleteApplicationData(connection, type, id) {
  const data = { type, id };
  
  try {
    // Fetch main application data
    const tableMap = {
      'oc': 'MemberRegist_OC_Main',
      'am': 'MemberRegist_AM_Main', 
      'ac': 'MemberRegist_AC_Main',
      'ic': 'MemberRegist_IC_Main'
    };
    
    const mainTable = tableMap[type];
    const [mainRows] = await connection.execute(`SELECT * FROM ${mainTable} WHERE id = ?`, [id]);
    data.main = mainRows[0] || {};
    
    // Fetch related data based on membership type
    if (type === 'oc') {
      // OC specific tables
      const [addresses] = await connection.execute(`SELECT * FROM MemberRegist_OC_Address WHERE main_id = ?`, [id]);
      const [contactPersons] = await connection.execute(`SELECT * FROM MemberRegist_OC_ContactPerson WHERE main_id = ?`, [id]);
      const [representatives] = await connection.execute(`SELECT * FROM MemberRegist_OC_Representatives WHERE main_id = ?`, [id]);
      const [businessTypes] = await connection.execute(`SELECT * FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?`, [id]);
      const [businessTypeOther] = await connection.execute(`SELECT * FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?`, [id]);
      const [products] = await connection.execute(`SELECT * FROM MemberRegist_OC_Products WHERE main_id = ?`, [id]);
      const [industryGroups] = await connection.execute(`SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?`, [id]);
      const [provinceChapters] = await connection.execute(`SELECT * FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?`, [id]);
      const [documents] = await connection.execute(`SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ?`, [id]);
      
      data.addresses = addresses;
      data.contactPersons = contactPersons;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      
    } else if (type === 'ac') {
      // AC specific tables
      const [addresses] = await connection.execute(`SELECT * FROM MemberRegist_AC_Address WHERE main_id = ?`, [id]);
      const [contactPersons] = await connection.execute(`SELECT * FROM MemberRegist_AC_ContactPerson WHERE main_id = ?`, [id]);
      const [representatives] = await connection.execute(`SELECT * FROM MemberRegist_AC_Representatives WHERE main_id = ?`, [id]);
      const [businessTypes] = await connection.execute(`SELECT * FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?`, [id]);
      const [businessTypeOther] = await connection.execute(`SELECT * FROM MemberRegist_AC_BusinessTypeOther WHERE main_id = ?`, [id]);
      const [products] = await connection.execute(`SELECT * FROM MemberRegist_AC_Products WHERE main_id = ?`, [id]);
      const [industryGroups] = await connection.execute(`SELECT * FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?`, [id]);
      const [provinceChapters] = await connection.execute(`SELECT * FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?`, [id]);
      const [documents] = await connection.execute(`SELECT * FROM MemberRegist_AC_Documents WHERE main_id = ?`, [id]);
      
      data.addresses = addresses;
      data.contactPersons = contactPersons;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      
    } else if (type === 'am') {
      // AM specific tables
      const [addresses] = await connection.execute(`SELECT * FROM MemberRegist_AM_Address WHERE main_id = ?`, [id]);
      const [contactPersons] = await connection.execute(`SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ?`, [id]);
      const [representatives] = await connection.execute(`SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?`, [id]);
      const [businessTypes] = await connection.execute(`SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?`, [id]);
      const [businessTypeOther] = await connection.execute(`SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?`, [id]);
      const [products] = await connection.execute(`SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?`, [id]);
      const [industryGroups] = await connection.execute(`SELECT * FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?`, [id]);
      const [provinceChapters] = await connection.execute(`SELECT * FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?`, [id]);
      const [documents] = await connection.execute(`SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?`, [id]);
      
      data.addresses = addresses;
      data.contactPersons = contactPersons;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      
    } else if (type === 'ic') {
      // IC specific tables
      const [addresses] = await connection.execute(`SELECT * FROM MemberRegist_IC_Address WHERE ic_main_id = ?`, [id]);
      const [representatives] = await connection.execute(`SELECT * FROM MemberRegist_IC_Representatives WHERE ic_main_id = ?`, [id]);
      const [businessTypes] = await connection.execute(`SELECT * FROM MemberRegist_IC_BusinessTypes WHERE ic_main_id = ?`, [id]);
      const [businessTypeOther] = await connection.execute(`SELECT * FROM MemberRegist_IC_BusinessTypeOther WHERE ic_main_id = ?`, [id]);
      const [products] = await connection.execute(`SELECT * FROM MemberRegist_IC_Products WHERE ic_main_id = ?`, [id]);
      const [industryGroups] = await connection.execute(`SELECT * FROM MemberRegist_IC_IndustryGroups WHERE ic_main_id = ?`, [id]);
      const [provinceChapters] = await connection.execute(`SELECT * FROM MemberRegist_IC_ProvinceChapters WHERE ic_main_id = ?`, [id]);
      const [documents] = await connection.execute(`SELECT * FROM MemberRegist_IC_Documents WHERE ic_main_id = ?`, [id]);
      
      data.addresses = addresses;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching complete application data:', error);
    throw error;
  }
}

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

      // Fetch all application data before updating status
      const applicationData = await fetchCompleteApplicationData(connection, type, id);
      
      // Get user_id from the main table
      const [userRows] = await connection.execute(
        `SELECT user_id FROM ${tableName} WHERE id = ?`, 
        [id]
      );
      const userId = userRows[0]?.user_id;
      
      if (!userId) {
        throw new Error('User ID not found for this application');
      }
      
      // Update status to rejected (2)
      await connection.execute(
        `UPDATE ${tableName} SET status = 2, rejection_reason = ? WHERE id = ?`,
        [rejectionReason, id]
      );
      
      // Store complete rejection data in separate table
      await connection.execute(
        `INSERT INTO MemberRegist_Reject_DATA 
        (membership_type, membership_id, user_id, rejection_data, admin_note, admin_note_by) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          type,
          id,
          userId,
          JSON.stringify(applicationData),
          adminNote || null,
          adminData.id
        ]
      );

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