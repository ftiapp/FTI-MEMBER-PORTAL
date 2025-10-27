import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * User Resubmit API v3 - Conversation-based
 * 
 * Flow:
 * 1. Update Main table: status = 3 (resubmitted), increment resubmission_count
 * 2. Insert conversation record with user's message
 * 3. Notify admin
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    const body = await request.json();
    const { message = "แก้ไขและส่งใหม่แล้วครับ" } = body;

    // Validate
    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทสมาชิกไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
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

      // Verify user owns this application and it's rejected
      const [appRows] = await connection.execute(
        `SELECT user_id, status, resubmission_count FROM ${mainTable} WHERE id = ?`,
        [id]
      );

      if (appRows.length === 0) {
        throw new Error("ไม่พบใบสมัครนี้");
      }

      if (appRows[0].user_id !== user.id) {
        throw new Error("คุณไม่มีสิทธิ์แก้ไขใบสมัครนี้");
      }

      if (appRows[0].status !== 2) {
        throw new Error("ใบสมัครนี้ไม่ได้อยู่ในสถานะที่ถูกปฏิเสธ");
      }

      const currentStatus = appRows[0].status;
      const currentResubmissionCount = appRows[0].resubmission_count || 0;

      // Update Main table: status = 3 (resubmitted), increment counter
      await connection.execute(
        `UPDATE ${mainTable} 
         SET status = 3,
             resubmission_count = ?,
             resubmitted_at = NOW()
         WHERE id = ?`,
        [currentResubmissionCount + 1, id]
      );

      // Get user name
      const userName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'ผู้ใช้';

      // Insert conversation record
      await connection.execute(
        `INSERT INTO MemberRegist_Conversations 
         (membership_type, membership_id, message_type, message, 
          author_type, author_id, author_name, 
          status_before, status_after, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          type,
          id,
          'resubmission',
          message,
          'user',
          user.id,
          userName,
          currentStatus,
          3 // resubmitted
        ]
      );

      await connection.commit();

      // TODO: Send notification to admin
      // await notifyAdminResubmission(type, id, userName);

      return NextResponse.json({
        success: true,
        message: "ส่งใบสมัครใหม่เรียบร้อยแล้ว รอการพิจารณาจากเจ้าหน้าที่",
        data: {
          status: 3,
          resubmissionCount: currentResubmissionCount + 1,
          resubmittedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error resubmitting application:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "ไม่สามารถส่งใบสมัครใหม่ได้ กรุณาลองใหม่อีกครั้ง",
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
