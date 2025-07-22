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
    const { adminNote } = body;

    // Get database connection
    const connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Update membership request status to approved (1)
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

      // Update status to approved (1)
      await connection.execute(
        `UPDATE ${tableName} SET status = 1 WHERE id = ?`,
        [id]
      );

      // Save admin note if provided
      if (adminNote && adminNote.trim()) {
        // Check if admin_notes table exists for this type
        const adminNotesTable = type === 'ic' ? 'ICmember_AdminNotes' : `MemberRegist_${type.toUpperCase()}_AdminNotes`;
        
        // Check if table exists
        const [tables] = await connection.execute(
          `SHOW TABLES LIKE '${adminNotesTable}'`
        );
        
        if (tables.length > 0) {
          // Check if note already exists
          const [existingNote] = await connection.execute(
            `SELECT * FROM ${adminNotesTable} WHERE member_id = ?`,
            [id]
          );
          
          if (existingNote && existingNote.length > 0) {
            // Update existing note
            await connection.execute(
              `UPDATE ${adminNotesTable} SET note = ?, updated_at = NOW() WHERE member_id = ?`,
              [adminNote, id]
            );
          } else {
            // Insert new note
            await connection.execute(
              `INSERT INTO ${adminNotesTable} (member_id, note, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
              [id, adminNote]
            );
          }
        }
      }

      // Log admin action
      const memberTypeMap = {
        'oc': 'สน (สามัญ-โรงงาน)',
        'am': 'สส (สามัญ-สมาคมการค้า)',
        'ac': 'ทน (สมทบ-นิติบุคคล)',
        'ic': 'ทบ (สมทบ-บุคคลธรรมดา)'
      };
      
      const description = `อนุมัติคำขอสมัครสมาชิกประเภท ${memberTypeMap[type]} ID: ${id}`;
      
      await connection.execute(
        `INSERT INTO admin_actions_log (admin_id, action_type, target_id, target_type, description, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminData.id,
          'approve_membership',
          id,
          type,
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
        message: 'Membership request approved successfully' 
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error approving membership request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve membership request' },
      { status: 500 }
    );
  }
}
