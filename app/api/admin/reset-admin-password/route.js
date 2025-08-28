import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getAdminFromSession, logAdminAction } from '../../../lib/adminAuth';
import { generateToken } from '../../../lib/token';
import { sendAdminInviteEmail } from '../../../lib/mailersend';

export async function POST(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น' }, { status: 401 });
    }

    const { adminId } = await request.json();
    if (!adminId) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    // Get target admin
    const rows = await query('SELECT id, username, admin_level, can_create, can_update FROM admin_users WHERE id = ?', [adminId]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบผู้ดูแลระบบ' }, { status: 404 });
    }
    const target = rows[0];
    if (Number(target.admin_level) >= 5) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถรีเซ็ทรหัสผ่านของ SuperAdmin ได้' }, { status: 400 });
    }

    const email = target.username;

    // Delete the admin account
    await query('DELETE FROM admin_users WHERE id = ?', [adminId]);

    // Invalidate previous invites
    await query('UPDATE admin_invitation_tokens SET used = 1, used_at = NOW() WHERE email = ? AND used = 0', [email]);

    // Create new invite
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO admin_invitation_tokens (email, token, inviter_id, admin_level, can_create, can_update, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, token, admin.id, target.admin_level, target.can_create ? 1 : 0, target.can_update ? 1 : 0, expiresAt]
    );

    await sendAdminInviteEmail(email, token, { adminLevel: target.admin_level });

    // Log
    await logAdminAction(admin.id, 'reset_admin_password', adminId, { email, adminLevel: target.admin_level }, request);

    return NextResponse.json({ success: true, message: 'รีเซ็ทรหัสผ่านและส่งอีเมลเชิญใหม่เรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการรีเซ็ทรหัสผ่าน' }, { status: 500 });
  }
}
