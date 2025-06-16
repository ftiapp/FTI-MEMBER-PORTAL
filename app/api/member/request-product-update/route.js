import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/app/lib/session';
import { pool } from '@/app/lib/db';
import { createNotification } from '@/app/lib/notifications';

/**
 * API endpoint to submit a product update request
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(request) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่' 
      }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const { 
      member_code, 
      company_name,
      member_type,
      member_group_code,
      type_code,
      old_products_th, 
      new_products_th,
      old_products_en,
      new_products_en
    } = body;

    if (!member_code || !new_products_th) {
      return NextResponse.json({ 
        success: false, 
        message: 'ข้อมูลไม่ครบถ้วน กรุณาระบุข้อมูลให้ครบถ้วน' 
      }, { status: 400 });
    }

    // Check if there's already a pending request for this member
    const [existingRequests] = await pool.query(`
      SELECT COUNT(*) as count
      FROM pending_product_updates
      WHERE member_code = ? AND status = 'pending'
    `, [member_code]);

    if (existingRequests[0].count > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'มีคำขอแก้ไขข้อมูลสินค้ารอการอนุมัติอยู่แล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ' 
      }, { status: 400 });
    }

    // Create the pending_product_updates table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_product_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        member_code VARCHAR(20) NOT NULL,
        company_name VARCHAR(255),
        member_type VARCHAR(50),
        member_group_code VARCHAR(50),
        type_code VARCHAR(50),
        old_products_th TEXT,
        new_products_th TEXT,
        old_products_en TEXT,
        new_products_en TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        admin_id INT,
        admin_notes TEXT,
        reject_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Start a transaction
    await pool.query('START TRANSACTION');

    try {
      // Insert the product update request
      const [insertResult] = await pool.query(`
        INSERT INTO pending_product_updates
        (user_id, member_code, company_name, member_type, member_group_code, type_code, old_products_th, new_products_th, old_products_en, new_products_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, member_code, company_name, member_type, member_group_code, type_code, old_products_th, new_products_th, old_products_en, new_products_en]);

      const requestId = insertResult.insertId;

      // Log the action
      const userIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      // Format the details for logging
      const logDetails = JSON.stringify({
        member_code,
        company_name,
        products_th: {
          old: old_products_th,
          new: new_products_th
        },
        products_en: {
          old: old_products_en,
          new: new_products_en
        }
      });

      await pool.query(`
        INSERT INTO Member_portal_User_log
        (user_id, action, details, ip_address, user_agent)
        VALUES (?, 'other', ?, ?, ?)
      `, [userId, logDetails, userIP, userAgent]);

      // Create notification for admin
      const notificationMessage = `มีคำขอแก้ไขข้อมูลสินค้าจาก ${company_name} (${member_code})`;
      await createNotification({
        user_id: null, // null means it's for all admins
        message: notificationMessage,
        type: 'admin',
        link: `/admin/product-updates?id=${requestId}`,
        status: 'pending',
        member_code: member_code,
        member_type: member_type,
        member_group_code: member_group_code,
        type_code: type_code
      });

      // Commit the transaction
      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'ส่งคำขอแก้ไขข้อมูลสินค้าสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ'
      });
    } catch (error) {
      // Rollback the transaction if there's an error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error submitting product update request:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการส่งคำขอแก้ไขข้อมูลสินค้า' 
    }, { status: 500 });
  }
}
