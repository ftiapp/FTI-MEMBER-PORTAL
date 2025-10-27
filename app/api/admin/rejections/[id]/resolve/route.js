import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * POST /api/admin/rejections/[id]/resolve
 * Admin approves a resubmitted application
 */
export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Get rejection info
      const [rejections] = await connection.execute(
        `SELECT * FROM MemberRegist_Rejections WHERE id = ?`,
        [id]
      );

      if (!rejections.length) {
        throw new Error("ไม่พบข้อมูลการปฏิเสธ");
      }

      const rejection = rejections[0];
      const { membership_type, membership_id, user_id } = rejection;

      // Update rejection status to resolved
      await connection.execute(
        `UPDATE MemberRegist_Rejections 
         SET status = 'resolved', 
             resolved_by = ?,
             resolved_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [user.id, id]
      );

      // Update main application status to approved (1)
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        ac: "MemberRegist_AC_Main",
        am: "MemberRegist_AM_Main",
        ic: "MemberRegist_IC_Main",
      };

      await connection.execute(
        `UPDATE ${tableMap[membership_type]} 
         SET status = 1, 
             approved_at = NOW(),
             approved_by = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [user.id, membership_id]
      );

      // Add conversation message if provided
      if (message && message.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Rejection_Conversations 
           (rejection_id, sender_type, sender_id, message) 
           VALUES (?, 'admin', ?, ?)`,
          [id, user.id, message.trim()]
        );

        await connection.execute(
          `UPDATE MemberRegist_Rejections 
           SET last_conversation_at = NOW(), unread_member_count = unread_member_count + 1
           WHERE id = ?`,
          [id]
        );
      }

      // Log action
      await connection.execute(
        `INSERT INTO FTI_Portal_User_log (user_id, action_type, details, created_at)
         VALUES (?, 'admin_resolve_rejection', ?, NOW())`,
        [
          user.id,
          JSON.stringify({
            rejectionId: id,
            membershipType: membership_type,
            membershipId: membership_id,
            targetUserId: user_id,
          }),
        ]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "อนุมัติใบสมัครเรียบร้อยแล้ว",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error resolving rejection:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการอนุมัติใบสมัคร" },
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
