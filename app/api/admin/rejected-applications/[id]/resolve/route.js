import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * POST /api/admin/rejected-applications/[id]/resolve
 * Mark a rejected application as resolved (approved after resubmission)
 * Accessible by: Admin only
 */
export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Get reject data
      const [rejectData] = await connection.execute(
        `SELECT membership_type, membership_id, user_id 
         FROM MemberRegist_Reject_DATA 
         WHERE id = ? AND is_active = 1`,
        [id],
      );

      if (!rejectData.length) {
        throw new Error("Rejected application not found");
      }

      const reject = rejectData[0];

      // Update reject status to resolved
      await connection.execute(
        `UPDATE MemberRegist_Reject_DATA 
         SET status = 1, resolved_at = NOW(), updated_at = NOW() 
         WHERE id = ?`,
        [id],
      );

      // Update main application status to approved (status = 1)
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        am: "MemberRegist_AM_Main",
        ac: "MemberRegist_AC_Main",
        ic: "MemberRegist_IC_Main",
      };

      const mainTable = tableMap[reject.membership_type];
      await connection.execute(
        `UPDATE ${mainTable} 
         SET status = 1, updated_at = NOW() 
         WHERE id = ?`,
        [reject.membership_id],
      );

      // Add conversation message if provided
      if (message && message.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Reject_Conversations 
           (reject_id, sender_type, sender_id, message, is_read, created_at) 
           VALUES (?, 'admin', ?, ?, 0, NOW())`,
          [id, user.id, message.trim()],
        );

        await connection.execute(
          `UPDATE MemberRegist_Reject_DATA 
           SET last_conversation_at = NOW() 
           WHERE id = ?`,
          [id],
        );
      }

      // Log action
      await connection.execute(
        `INSERT INTO FTI_Portal_User_log (user_id, action_type, details, created_at)
         VALUES (?, 'admin_resolve_rejection', ?, NOW())`,
        [
          user.id,
          JSON.stringify({
            rejectId: id,
            membershipType: reject.membership_type,
            membershipId: reject.membership_id,
            targetUserId: reject.user_id,
          }),
        ],
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
    console.error("Error resolving rejected application:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอนุมัติใบสมัคร" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
