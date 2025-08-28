import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getAdminFromSession } from '../../../lib/adminAuth';

export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น' },
        { status: 401 }
      );
    }
    
    // Get all admins
    const admins = await query(
      `SELECT 
        id, 
        username, 
        COALESCE(NULLIF(name, ''), username) AS name,
        admin_level, 
        is_active, 
        can_create, 
        can_update, 
        created_at, 
        updated_at 
      FROM 
        admin_users 
      ORDER BY 
        created_at DESC`
    );
    
    return NextResponse.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}
