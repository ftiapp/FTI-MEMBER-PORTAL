import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkAdminSession } from '@/app/lib/auth';
import { pool } from '@/app/lib/db';
import { createNotification } from '@/app/lib/notifications';

/**
 * API endpoint to approve a product update request
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const admin = await checkAdminSession(cookieStore);

    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลผู้ดูแลระบบ กรุณาเข้าสู่ระบบใหม่' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบรหัสคำขอแก้ไขข้อมูลสินค้า' 
      }, { status: 400 });
    }

    // Start a transaction
    await pool.query('START TRANSACTION');

    try {
      // Get the request details
      const [requests] = await pool.query(`
        SELECT * FROM pending_product_updates WHERE id = ?
      `, [id]);

      if (requests.length === 0) {
        await pool.query('ROLLBACK');
        return NextResponse.json({ 
          success: false, 
          message: 'ไม่พบคำขอแก้ไขข้อมูลสินค้า' 
        }, { status: 404 });
      }

      const productUpdateRequest = requests[0];

      // Update the request status
      await pool.query(`
        UPDATE pending_product_updates
        SET status = 'approved', admin_id = ?, admin_notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [admin.id, admin_notes || '', id]);

      // Log the admin action
      const adminIP = request.headers?.get('x-forwarded-for') || request.headers?.get('x-real-ip') || 'unknown';
      const adminAgent = request.headers?.get('user-agent') || 'unknown';
      
      // Format the details for logging
      const logDetails = JSON.stringify({
        request_id: id,
        member_code: productUpdateRequest.member_code,
        company_name: productUpdateRequest.company_name,
        admin_notes: admin_notes || ''
      });

      await pool.query(`
        INSERT INTO admin_actions_log
        (admin_id, action_type, target_id, description, ip_address, user_agent)
        VALUES (?, 'approve_product_update', ?, ?, ?, ?)
      `, [admin.id, id, logDetails, adminIP, adminAgent]);

      // Create notification for the user
      if (productUpdateRequest.user_id) {
        const notificationMessage = `คำขอแก้ไขข้อมูลสินค้าของ ${productUpdateRequest.company_name} (${productUpdateRequest.member_code}) ได้รับการอนุมัติแล้ว`;
        await createNotification({
          user_id: productUpdateRequest.user_id,
          message: notificationMessage,
          type: 'user',
          link: `/MemberDetail?memberCode=${encodeURIComponent(productUpdateRequest.member_code)}&memberType=${productUpdateRequest.member_type}&member_group_code=${productUpdateRequest.member_group_code}&typeCode=${productUpdateRequest.type_code}&tab=products`,
          status: 'approved'
        });
      }

      // Commit the transaction
      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'อนุมัติคำขอแก้ไขข้อมูลสินค้าสำเร็จ'
      });
    } catch (error) {
      // Rollback the transaction if there's an error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error approving product update request:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขข้อมูลสินค้า' 
    }, { status: 500 });
  }
}
