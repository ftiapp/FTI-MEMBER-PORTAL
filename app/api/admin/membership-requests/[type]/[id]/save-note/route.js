import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

export async function POST(request, { params }) {
  try {
    // Get params and request body
    const { type, id } = await params;
    const { adminNote } = await request.json();
    
    // Validate parameters
    const validTypes = ['oc', 'am', 'ac', 'ic'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid membership type' }, { status: 400 });
    }

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    // Verify admin session
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Determine table name based on membership type
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

    // Get database connection
    const connection = await getConnection();

    // Get company info for logging
    let companyInfo = '';
    try {
      let companyQuery = '';
      let companyFields = [];
      
      switch (type) {
        case 'oc':
          companyQuery = 'SELECT tax_id, company_name_th FROM MemberRegist_OC_Main WHERE id = ?';
          break;
        case 'am':
          companyQuery = 'SELECT tax_id, association_name_th as company_name_th FROM MemberRegist_AM_Main WHERE id = ?';
          break;
        case 'ac':
          companyQuery = 'SELECT tax_id, company_name_th FROM MemberRegist_AC_Main WHERE id = ?';
          break;
        case 'ic':
          companyQuery = 'SELECT id_card_number as tax_id, CONCAT(first_name_th, " ", last_name_th) as company_name_th FROM ICmember_Info WHERE id = ?';
          break;
      }
      
      const [companyRows] = await connection.execute(companyQuery, [id]);
      if (companyRows.length > 0) {
        const company = companyRows[0];
        companyInfo = `TAX_ID: ${company.tax_id || 'N/A'}, Company: ${company.company_name_th || 'N/A'}`;
      }
    } catch (error) {
      console.error('Error getting company info:', error);
      companyInfo = `ID: ${id}`;
    }

    // Save admin note to the main table
    await connection.execute(
      `UPDATE ${tableName} SET admin_note = ?, admin_note_by = ?, admin_note_at = NOW() WHERE id = ?`,
      [adminNote, adminData.id, id]
    );

    // Log admin action
    await connection.execute(
      `INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        adminData.id,
        'save_note_member_regist',
        id,
        `บันทึกหมายเหตุสำหรับคำขอสมัครสมาชิก ${companyInfo}, หมายเหตุ: "${adminNote}"`,
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || '',
      ]
    );

    return NextResponse.json({ success: true, message: 'บันทึกหมายเหตุเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error saving admin note:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกหมายเหตุ' }, { status: 500 });
  }
}
