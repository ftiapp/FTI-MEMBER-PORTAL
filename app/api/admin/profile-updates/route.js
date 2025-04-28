import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Get profile update requests with user information and admin name
    const requests = await query(
      `SELECT pr.*, u.name, u.firstname, u.lastname, u.email, u.phone,
       au.name as admin_name
       FROM profile_update_requests pr
       JOIN users u ON pr.user_id = u.id
       LEFT JOIN admin_users au ON pr.admin_id = au.id
       WHERE pr.status = ?
       ORDER BY pr.created_at DESC`,
      [status]
    );

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching profile update requests:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูล' },
      { status: 500 }
    );
  }
}
