import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "../../../lib/session";
import {
  query as dbQuery,
  beginTransaction,
  executeQuery,
  commitTransaction,
  rollbackTransaction,
} from "../../../lib/db";
import { createNotification } from "../../../lib/notifications";
import { sendProductUpdateRequestEmail } from "../../../lib/postmark";

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
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่",
        },
        { status: 401 },
      );
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
      new_products_en,
    } = body;

    if (!member_code || !new_products_th) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลไม่ครบถ้วน กรุณาระบุข้อมูลให้ครบถ้วน",
        },
        { status: 400 },
      );
    }

    // Check if there's already a pending request for this member
    const existingRequests = await dbQuery(
      `
      SELECT COUNT(*) as count
      FROM FTI_Original_Membership_Pending_Product_Updates
      WHERE member_code = ? AND status = 'pending'
    `,
      [member_code],
    );

    if (existingRequests[0].count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "มีคำขอแก้ไขข้อมูลสินค้ารอการอนุมัติอยู่แล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ",
        },
        { status: 400 },
      );
    }

    // Create the FTI_Original_Membership_Pending_Product_Updates table if it doesn't exist
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS FTI_Original_Membership_Pending_Product_Updates (
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
        FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Start a transaction
    const conn = await beginTransaction();

    try {
      // Insert the product update request
      const insertResult = await executeQuery(
        conn,
        `
        INSERT INTO FTI_Original_Membership_Pending_Product_Updates
        (user_id, member_code, company_name, member_type, member_group_code, type_code, old_products_th, new_products_th, old_products_en, new_products_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          userId,
          member_code,
          company_name,
          member_type,
          member_group_code,
          type_code,
          old_products_th,
          new_products_th,
          old_products_en,
          new_products_en,
        ],
      );

      const requestId = insertResult.insertId;

      // Log the action
      const userIP =
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      // Format the details for logging
      const logDetails = JSON.stringify({
        member_code,
        company_name,
        products_th: {
          old: old_products_th,
          new: new_products_th,
        },
        products_en: {
          old: old_products_en,
          new: new_products_en,
        },
      });

      await executeQuery(
        conn,
        `
        INSERT INTO FTI_Portal_User_Logs
        (user_id, action, details, ip_address, user_agent)
        VALUES (?, 'other', ?, ?, ?)
      `,
        [userId, logDetails, userIP, userAgent],
      );

      // Create notification for admin
      const notificationMessage = `มีคำขอแก้ไขข้อมูลสินค้าจาก ${company_name} (${member_code})`;
      await createNotification({
        user_id: null, // null means it's for all admins
        message: notificationMessage,
        type: "admin",
        link: `/admin/product-updates?id=${requestId}`,
        status: "pending",
        member_code: member_code,
        member_type: member_type,
        member_group_code: member_group_code,
        type_code: type_code,
      });

      // Commit the transaction
      await commitTransaction(conn);

      // ส่งอีเมลแจ้งเตือนผู้ใช้
      try {
        // ดึงข้อมูลผู้ใช้
        const userData = await dbQuery(
          "SELECT email, firstname, lastname FROM FTI_Portal_User WHERE id = ?",
          [userId],
        );
        if (userData && userData.length > 0 && userData[0].email) {
          await sendProductUpdateRequestEmail(
            userData[0].email,
            userData[0].firstname || "",
            userData[0].lastname || "",
            member_code,
            company_name || "ไม่ระบุ",
          );
          console.log("Product update request email sent to:", userData[0].email);
        }
      } catch (emailError) {
        console.error("Error sending product update request email:", emailError);
        // Continue with the process even if email sending fails
      }

      return NextResponse.json({
        success: true,
        message: "ส่งคำขอแก้ไขข้อมูลสินค้าสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ",
      });
    } catch (error) {
      // Rollback the transaction if there's an error
      await rollbackTransaction(conn);
      throw error;
    }
  } catch (error) {
    console.error("Error submitting product update request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการส่งคำขอแก้ไขข้อมูลสินค้า",
      },
      { status: 500 },
    );
  }
}
