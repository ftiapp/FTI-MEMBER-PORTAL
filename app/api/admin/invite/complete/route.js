import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '../../../../lib/db';
import { logAdminAction } from '../../../../lib/adminAuth';

function isStrongPassword(pw) {
  // Min 8, at least 1 upper, 1 lower, 1 digit, 1 special
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return re.test(pw);
}

export async function POST(request) {
  const connection = await beginTransaction();
  try {
    const { token, password, name } = await request.json();

    if (!token || !password) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    // Validate name (required, max 100 chars)
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อผู้ดูแลระบบ' }, { status: 400 });
    }
    if (trimmedName.length > 100) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)' }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      await rollbackTransaction(connection);
      return NextResponse.json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ'
      }, { status: 400 });
    }

    // Lock the invite row
    const [invite] = await executeQuery(connection,
      `SELECT * FROM admin_invitation_tokens WHERE token = ? FOR UPDATE`,
      [token]
    );

    if (!invite) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'โทเคนไม่ถูกต้อง' }, { status: 400 });
    }

    if (invite.used) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'โทเคนถูกใช้งานแล้ว' }, { status: 400 });
    }

    if (new Date(invite.expires_at) <= new Date()) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'โทเคนหมดอายุ' }, { status: 400 });
    }

    const email = invite.email;

    // Prevent duplicate admin creation
    const [existingAdmin] = await executeQuery(connection,
      'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
      [email]
    );
    if (existingAdmin) {
      await rollbackTransaction(connection);
      return NextResponse.json({ success: false, message: 'อีเมลนี้ถูกใช้เป็นผู้ดูแลระบบแล้ว' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create admin user (store name)
    const insertRes = await executeQuery(connection,
      `INSERT INTO admin_users (username, name, password, admin_level, is_active, can_create, can_update, created_by)
       VALUES (?, ?, ?, ?, TRUE, ?, ?, ?)`,
      [email, trimmedName, hashed, invite.admin_level, invite.can_create ? 1 : 0, invite.can_update ? 1 : 0, invite.inviter_id || null]
    );

    const newAdminId = insertRes.insertId;

    // Mark token used
    await executeQuery(connection,
      'UPDATE admin_invitation_tokens SET used = 1, used_at = NOW() WHERE id = ?',
      [invite.id]
    );

    await commitTransaction(connection);

    // Log under inviter id if exists
    if (invite.inviter_id) {
      try {
        await logAdminAction(invite.inviter_id, 'accept_invite', newAdminId, { email, adminLevel: invite.admin_level }, request);
      } catch (e) {
        console.error('Failed to log accept_invite:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'สร้างบัญชีผู้ดูแลระบบเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error completing invite:', error);
    try { await rollbackTransaction(connection); } catch (_) {}
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
