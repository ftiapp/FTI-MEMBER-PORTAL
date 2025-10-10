import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminSession } from "../../../../lib/auth";
import { pool } from "../../../../lib/db";
import { createNotification } from "../../../../lib/notifications";
import { sendProductUpdateRejectionEmail } from "../../../../lib/postmark";

/**
 * API endpoint to reject a product update request
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const admin = await checkAdminSession(cookieStore);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลผู้ดูแลระบบ กรุณาเข้าสู่ระบบใหม่",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id, reject_reason } = body;

    if (!id || !reject_reason) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุเหตุผลในการปฏิเสธคำขอ",
        },
        { status: 400 },
      );
    }

    // Start a transaction
    await pool.query("START TRANSACTION");

    try {
      // Get the request details with all necessary information
      const [requests] = await pool.query(
        `
        SELECT p.*, u.firstname, u.lastname, u.email, u.phone 
        FROM pending_product_updates p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `,
        [id],
      );

      if (requests.length === 0) {
        await pool.query("ROLLBACK");
        return NextResponse.json(
          {
            success: false,
            message: "ไม่พบคำขอแก้ไขข้อมูลสินค้า",
          },
          { status: 404 },
        );
      }

      const request = requests[0];

      // Update the request status
      await pool.query(
        `
        UPDATE pending_product_updates
        SET status = 'rejected', admin_id = ?, reject_reason = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [admin.id, reject_reason, id],
      );

      // Log the admin action
      const adminIP =
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const adminAgent = request.headers.get("user-agent") || "unknown";

      // Parse old and new data if available
      let oldData = {};
      let newData = {};

      try {
        if (request.old_data) {
          oldData = JSON.parse(request.old_data);
        }
        if (request.new_data) {
          newData = JSON.parse(request.new_data);
        }
      } catch (parseError) {
        console.error("Error parsing old/new data:", parseError);
      }

      // Format the details for logging with complete user information
      const logDetails = JSON.stringify({
        message: `Product update rejected - Member Code: ${request.member_code}, Company: ${request.company_name}, Reason: ${reject_reason}`,
        request_id: id,
        userId: request.user_id,
        firstname: request.firstname || "",
        lastname: request.lastname || "",
        email: request.email || "",
        phone: request.phone || "",
        member_code: request.member_code,
        company_name: request.company_name,
        old_data: oldData,
        new_data: newData,
        reject_reason: reject_reason,
      });

      await pool.query(
        `
        INSERT INTO admin_actions_log
        (admin_id, action_type, target_id, description, ip_address, user_agent)
        VALUES (?, 'reject_product_update', ?, ?, ?, ?)
      `,
        [admin.id, id, logDetails, adminIP, adminAgent],
      );

      // Create notification for the user
      if (request.user_id) {
        const notificationMessage = `คำขอแก้ไขข้อมูลสินค้าของ ${request.company_name} (${request.member_code}) ถูกปฏิเสธ: ${reject_reason}`;
        await createNotification({
          user_id: request.user_id,
          message: notificationMessage,
          type: "user",
          link: `/dashboard?tab=status`,
          status: "rejected",
        });
      }

      // Commit the transaction
      await pool.query("COMMIT");

      // ส่งอีเมลแจ้งเตือนผู้ใช้
      try {
        if (request.email) {
          await sendProductUpdateRejectionEmail(
            request.email,
            request.firstname || "",
            request.lastname || "",
            request.member_code,
            request.company_name || "ไม่ระบุ",
            reject_reason,
          );
          console.log("Product update rejection email sent to:", request.email);
        }
      } catch (emailError) {
        console.error("Error sending product update rejection email:", emailError);
        // Continue with the process even if email sending fails
      }

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธคำขอแก้ไขข้อมูลสินค้าสำเร็จ",
      });
    } catch (error) {
      // Rollback the transaction if there's an error
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting product update request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูลสินค้า",
      },
      { status: 500 },
    );
  }
}
