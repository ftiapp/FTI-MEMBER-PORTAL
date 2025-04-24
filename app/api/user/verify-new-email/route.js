import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { sendEmailChangeNotificationToOld } from '@/app/lib/mailersend-email-change';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'กรุณาระบุโทเคนยืนยัน' }, { status: 400 });
    }

    // ตรวจสอบความถูกต้องของโทเคน
    const verificationToken = await query(
      `SELECT vt.*, pec.new_email, pec.id as pending_id, u.email as old_email, u.firstname, u.lastname
       FROM verification_tokens vt
       JOIN pending_email_changes pec ON vt.id = pec.token_id
       JOIN users u ON vt.user_id = u.id
       WHERE vt.token = ? AND vt.token_type = 'new_email_verification' AND vt.used = 0 AND vt.expires_at > NOW()`,
      [token]
    );

    if (!verificationToken || verificationToken.length === 0) {
      return NextResponse.json({ error: 'โทเคนไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
    }

    const { user_id, new_email, old_email, firstname, lastname, pending_id } = verificationToken[0];

    // อัปเดตอีเมลของผู้ใช้จาก pending_email_changes และตั้งค่า email_verified เป็น 1
    await query(
      'UPDATE users SET email = ?, email_verified = 1, updated_at = NOW() WHERE id = ?',
      [new_email, user_id]
    );

    // อัปเดตสถานะ token เป็นใช้งานแล้ว
    await query(
      'UPDATE verification_tokens SET used = 1 WHERE id = ?',
      [verificationToken[0].id]
    );

    // อัปเดตสถานะการยืนยันอีเมลใหม่
    await query(
      'UPDATE pending_email_changes SET verified = 1, verified_at = NOW() WHERE id = ?',
      [pending_id]
    );

    // บันทึกประวัติการเปลี่ยนอีเมล
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, 'change_email', ?, ?, ?, NOW())`,
      [
        user_id, 
        `เปลี่ยนอีเมลจาก ${old_email} เป็น ${new_email} (ยืนยันแล้ว)`, 
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );

    // ส่งอีเมลแจ้งการเปลี่ยนอีเมลไปยังอีเมลเก่า
    await sendEmailChangeNotificationToOld(old_email, firstname, lastname, new_email);

    return NextResponse.json({ success: true, message: 'อีเมลใหม่ได้รับการยืนยันเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error verifying new email:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการยืนยันอีเมลใหม่' }, { status: 500 });
  }
}
