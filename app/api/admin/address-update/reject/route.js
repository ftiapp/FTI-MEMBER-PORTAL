import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query as dbQuery } from '@/app/lib/db';
import { sendAddressRejectionEmail } from '@/app/lib/mailersend';

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
    const result = await dbQuery(
      'SELECT * FROM pending_address_updates WHERE id = ? AND status = "pending"',
      [id]
    );
    
    console.log('Query result:', result);
    
    // ตรวจสอบว่า result มีข้อมูลหรือไม่
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0] || result[0].length === 0) {
      return NextResponse.json(
        { success: false, message: 'Address update request not found or already processed' },
        { status: 404 }
      );
    }
    
    // ตรวจสอบโครงสร้างของ result
    const addressUpdate = Array.isArray(result[0]) ? result[0][0] : result[0];
    console.log('Address update:', addressUpdate);
    
    if (!addressUpdate || typeof addressUpdate !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid address update data structure' },
        { status: 500 }
      );
    }

    try {
      // อัปเดตสถานะคำขอเป็น 'rejected' พร้อมเหตุผล
      await dbQuery(
        'UPDATE pending_address_updates SET status = "rejected", processed_date = NOW(), admin_comment = ? WHERE id = ?',
        [reason, id]
      );

      // บันทึกการกระทำของ admin
      await dbQuery(
        'INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          admin.id,
          'reject_address_update',
          id,
          `ปฏิเสธคำขอแก้ไขที่อยู่${addressUpdate.addr_lang === 'en' ? 'ภาษาอังกฤษ' : 'ภาษาไทย'}ของสมาชิกรหัส ${addressUpdate.member_code || ''} (${addressUpdate.comp_person_code || ''}) เหตุผล: ${reason}`,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
          request.headers.get('user-agent') || 'Unknown',
        ]
      );

      // ส่งอีเมลแจ้งเตือนการปฏิเสธ
      try {
        // ดึงข้อมูลผู้ใช้และข้อมูลบริษัทเพื่อส่งอีเมล
        const [user] = await dbQuery(
          `SELECT u.email, u.firstname, u.lastname, c.company_name 
           FROM users u 
           LEFT JOIN companies_Member c ON c.MEMBER_CODE = ? 
           WHERE u.id = ?`,
          [addressUpdate.member_code, addressUpdate.user_id]
        );
        
        if (user && user.email) {
          await sendAddressRejectionEmail(
            user.email,
            user.firstname || '',
            user.lastname || '',
            addressUpdate.member_code || '',
            user.company_name || addressUpdate.company_name || 'บริษัทของคุณ',
            reason || 'ไม่ระบุเหตุผล',
            admin.username || 'ผู้ดูแลระบบ'
          );
          console.log('Rejection email sent to', user.email);
        }
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // ไม่ต้อง throw error เพื่อไม่ให้กระทบการทำงานหลัก
      }

      return NextResponse.json({ success: true, message: 'Address update rejected successfully' });
    } catch (error) {
      console.error('Error rejecting address update:', error);
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