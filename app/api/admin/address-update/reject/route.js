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
    const { id, reason } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required' },
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
    const { member_code, type_code, addr_code } = addressUpdate;

    // เริ่ม transaction
    await db.query('START TRANSACTION');

    try {
      // อัปเดตสถานะคำขอเป็น 'rejected' พร้อมเหตุผล
      await db.query(
        'UPDATE pending_address_updates SET status = "rejected", processed_date = NOW(), admin_comment = ? WHERE id = ?',
        [reason, id]
      );

      // บันทึกการกระทำของ admin
      await db.query(
        'INSERT INTO admin_actions_log (admin_id, action_type, target_id, details, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          admin.id,
          'reject_address_update',
          id,
          JSON.stringify({
            member_code,
            member_type: addressUpdate.member_type,
            type_code,
            addr_code,
            old_address: addressUpdate.old_address,
            new_address: addressUpdate.new_address,
            reject_reason: reason
          })
        ]
      );

      // Commit transaction
      await db.query('COMMIT');

      return NextResponse.json({ success: true, message: 'Address update rejected successfully' });
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error rejecting address update:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject address update', error: error.message },
      { status: 500 }
    );
  }
}