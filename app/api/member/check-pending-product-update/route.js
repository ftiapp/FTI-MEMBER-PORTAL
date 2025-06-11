import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkUserSession } from '@/app/lib/auth';
import { pool } from '@/app/lib/db';

/**
 * API endpoint to check if a member has pending product update requests
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function GET(request) {
  try {
    // Get the member code from query parameters
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get('member_code');

    if (!memberCode) {
      return NextResponse.json({ 
        success: false, 
        message: 'รหัสสมาชิกไม่ถูกต้อง' 
      }, { status: 400 });
    }

    // Check user authentication
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่' 
      }, { status: 401 });
    }

    // Check if the table exists
    const [tableExists] = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'pending_product_updates'
    `);

    if (tableExists[0].count === 0) {
      // Table doesn't exist yet, so there are no pending requests
      return NextResponse.json({ 
        success: true, 
        hasPendingRequest: false 
      });
    }

    // Check for pending product update requests
    const [pendingRequests] = await pool.query(`
      SELECT COUNT(*) as count
      FROM pending_product_updates
      WHERE member_code = ?
      AND status = 'pending'
    `, [memberCode]);

    const hasPendingRequest = pendingRequests[0].count > 0;

    return NextResponse.json({
      success: true,
      hasPendingRequest
    });
  } catch (error) {
    console.error('Error checking pending product update:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบคำขอแก้ไขข้อมูลสินค้า' 
    }, { status: 500 });
  }
}
