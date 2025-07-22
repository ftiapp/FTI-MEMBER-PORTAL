import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

export async function POST(request, { params }) {
  try {
    // Get params and request body
    const { type, id } = params;
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
        'update_note',
        id,
        `บันทึกหมายเหตุสำหรับคำขอสมัครสมาชิก ID: ${id}`,
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
