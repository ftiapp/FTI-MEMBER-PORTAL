import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

/**
 * GET /api/admin/users
 * 
 * Fetches a paginated list of users for admin management.
 * Requires admin authentication.
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query to get total count
    const countQuery = `SELECT COUNT(*) as total FROM users`;
    const countResult = await query(countQuery);
    const total = countResult[0].total;

    // Query to get paginated users
    // แก้ไขการใช้ LIMIT และ OFFSET โดยใส่ค่าตัวเลขโดยตรงในคำสั่ง SQL
    const usersQuery = `
      SELECT id, name, firstname, lastname, email, phone, status, email_verified, created_at, updated_at
      FROM users
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const users = await query(usersQuery);

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    );
  }
}
