import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getAdminFromSession, logAdminAction } from '../../../lib/adminAuth';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น' },
        { status: 401 }
      );
    }
    
    const { username, password, adminLevel, canCreate, canUpdate } = await request.json();
    
    if (!username || !password || !adminLevel) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Validate password (must be 6 digits)
    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านต้องเป็นตัวเลข 6 หลักเท่านั้น' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingAdmin = await query(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );
    
    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin
    const result = await query(
      `INSERT INTO admin_users 
       (username, password, admin_level, is_active, can_create, can_update, created_by) 
       VALUES (?, ?, ?, TRUE, ?, ?, ?)`,
      [username, hashedPassword, adminLevel, canCreate ? 1 : 0, canUpdate ? 1 : 0, admin.id]
    );
    
    // Log admin action
    await logAdminAction(
      admin.id,
      'create_admin',
      result.insertId,
      `Created new admin: ${username} with level ${adminLevel}`,
      request
    );
    
    return NextResponse.json({
      success: true,
      message: 'สร้างผู้ดูแลระบบใหม่เรียบร้อยแล้ว',
      adminId: result.insertId
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการสร้างผู้ดูแลระบบ' },
      { status: 500 }
    );
  }
}
