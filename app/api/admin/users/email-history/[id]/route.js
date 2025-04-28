import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

/**
 * GET /api/admin/users/email-history/[id]
 * 
 * Get the email change history for a specific user
 * Requires admin authentication
 */
export async function GET(request, { params }) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get email change history from pending_email_changes table
    const emailChanges = await query(`
      SELECT 
        pec.id, 
        pec.user_id, 
        pec.old_email, 
        pec.new_email, 
        pec.status,
        pec.created_at,
        pec.updated_at,
        COALESCE(au.name, 'ผู้ใช้') as admin_name,
        pec.admin_note
      FROM 
        pending_email_changes pec
      LEFT JOIN 
        admin_users au ON pec.admin_id = au.id
      WHERE 
        pec.user_id = ?
      ORDER BY 
        pec.created_at DESC
    `, [userId]);

    return NextResponse.json({
      success: true,
      emailChanges
    });
  } catch (error) {
    console.error('Error fetching email history:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการเปลี่ยนอีเมล' 
    }, { status: 500 });
  }
}
