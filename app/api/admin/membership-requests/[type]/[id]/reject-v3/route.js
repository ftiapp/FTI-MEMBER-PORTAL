import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * Admin Reject API v3 - Conversation-based
 * 
 * Flow:
 * 1. Update Main table: status = 2 (rejected)
 * 2. Insert conversation record
 * 3. Send email notification to user
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    const body = await request.json();
    const { message, isInternal = false } = body;

    // Validate
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเหตุผลในการปฏิเสธ" },
        { status: 400 }
      );
    }

    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทสมาชิกไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Get admin from session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Map type to table
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        ac: "MemberRegist_AC_Main",
        am: "MemberRegist_AM_Main",
        ic: "MemberRegist_IC_Main",
      };

      const mainTable = tableMap[type];

      // Get current status and user info
      const [appRows] = await connection.execute(
        `SELECT status, user_id FROM ${mainTable} WHERE id = ?`,
        [id]
      );

      if (appRows.length === 0) {
        throw new Error("ไม่พบใบสมัครนี้");
      }

      const currentStatus = appRows[0].status;
      const userId = appRows[0].user_id;

      // Update Main table with rejection info
      await connection.execute(
        `UPDATE ${mainTable} 
         SET status = 2,
             rejection_reason = ?,
             rejected_by = ?,
             rejected_at = NOW()
         WHERE id = ?`,
        [message, admin.id, id]
      );

      // Get admin name for conversation
      const adminName = `${admin.firstname || ''} ${admin.lastname || ''}`.trim() || 'Admin';

      // Insert conversation record
      await connection.execute(
        `INSERT INTO MemberRegist_Conversations 
         (membership_type, membership_id, message_type, message, 
          author_type, author_id, author_name, 
          status_before, status_after, is_internal, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          type,
          id,
          'rejection',
          message,
          'admin',
          admin.id,
          adminName,
          currentStatus,
          2, // rejected
          isInternal ? 1 : 0
        ]
      );

      // Log admin action
      await connection.execute(
        `INSERT INTO FTI_Portal_Admin_Actions_Logs 
         (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          admin.id,
          "reject_member",
          id,
          `ปฏิเสธใบสมัคร ${type.toUpperCase()} #${id}: ${message.substring(0, 100)}`,
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ]
      );

      await connection.commit();

      // TODO: Send email notification to user
      // await sendRejectionEmail(userId, type, id, message);

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธใบสมัครเรียบร้อยแล้ว",
        data: {
          status: 2,
          rejectedAt: new Date().toISOString(),
          conversationId: null // Will be set after insert
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "ไม่สามารถปฏิเสธใบสมัครได้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
