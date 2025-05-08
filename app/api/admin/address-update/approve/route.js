import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import db from '@/app/lib/db';

export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // รับข้อมูลจาก request body
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลคำขอแก้ไขที่อยู่
    const [addressUpdates] = await db.query(
      'SELECT * FROM pending_address_updates WHERE id = ? AND status = "pending"',
      [id]
    );

    if (addressUpdates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Address update request not found or already processed' },
        { status: 404 }
      );
    }

    const addressUpdate = addressUpdates[0];
    const { member_code, comp_person_code, type_code, addr_code, addr_lang, new_address } = addressUpdate;

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // อัปเดตสถานะคำขอเป็น 'approved'
      await db.query(
        'UPDATE pending_address_updates SET status = "approved", processed_date = NOW(), admin_comment = "Approved" WHERE id = ?',
        [id]
      );

      // อัปเดตที่อยู่ในตาราง companies_Member
      let updateQuery;
      let updateParams;

      // Determine which field to update based on address code and language
      if (addr_code === '001') {
        if (addr_lang === 'en') {
          updateQuery = 'UPDATE companies_Member SET ADDRESS_EN = ? WHERE MEMBER_CODE = ? AND COMP_PERSON_CODE = ?';
        } else {
          updateQuery = 'UPDATE companies_Member SET ADDRESS = ? WHERE MEMBER_CODE = ? AND COMP_PERSON_CODE = ?';
        }
        updateParams = [new_address, member_code, comp_person_code];
      } else if (addr_code === '002') {
        if (addr_lang === 'en') {
          updateQuery = 'UPDATE companies_Member SET FACTORY_ADDRESS_EN = ? WHERE MEMBER_CODE = ? AND COMP_PERSON_CODE = ?';
        } else {
          updateQuery = 'UPDATE companies_Member SET FACTORY_ADDRESS = ? WHERE MEMBER_CODE = ? AND COMP_PERSON_CODE = ?';
        }
        updateParams = [new_address, member_code, comp_person_code];
      } else {
        throw new Error(`Unsupported address type: ${addr_code}`);
      }

      await db.query(updateQuery, updateParams);

      // บันทึกการกระทำของ admin
      await db.query(
        'INSERT INTO admin_actions_log (admin_id, action_type, target_id, details, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          admin.id,
          'approve_address_update',
          id,
          JSON.stringify({
            member_code,
            comp_person_code,
            member_type: addressUpdate.member_type,
            type_code,
            addr_code,
            addr_lang,
            old_address: addressUpdate.old_address,
            new_address
          })
        ]
      );

      // Commit transaction
      await db.query('COMMIT');

      return NextResponse.json({ success: true, message: 'Address update approved successfully' });
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error approving address update:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve address update', error: error.message },
      { status: 500 }
    );
  }
}