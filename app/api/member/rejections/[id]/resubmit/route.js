import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { updateOCApplication } from "@/app/lib/oc-application";
import { updateACApplication } from "@/app/lib/ac-application";
import { updateAMApplication } from "@/app/lib/am-application";
import { updateICApplication } from "@/app/lib/ic-application";
import { createSnapshot } from "@/app/lib/history-snapshot";

/**
 * POST /api/member/rejections/[id]/resubmit
 * Member resubmits a rejected application after making changes
 */
export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { formData, userComment } = body;

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Get rejection info
      const [rejections] = await connection.execute(
        `SELECT * FROM MemberRegist_Rejections WHERE id = ? AND user_id = ?`,
        [id, user.id],
      );

      if (!rejections.length) {
        throw new Error("ไม่พบข้อมูลการปฏิเสธ");
      }

      const rejection = rejections[0];
      const { membership_type, membership_id } = rejection;

      // Update application data if formData provided
      if (formData) {
        console.log(`📝 Updating ${membership_type} application ${membership_id}`);

        switch (membership_type) {
          case "oc":
            await updateOCApplication(membership_id, formData, user.id, id, userComment);
            break;
          case "ac":
            await updateACApplication(membership_id, formData, user.id, id, userComment);
            break;
          case "am":
            await updateAMApplication(membership_id, formData, user.id, id, userComment);
            break;
          case "ic":
            await updateICApplication(membership_id, formData, user.id, id, userComment);
            break;
          default:
            throw new Error(`Unknown membership type: ${membership_type}`);
        }
      }

      // Create new history snapshot for resubmission
      console.log(`📸 Creating resubmission snapshot for ${membership_type} ${membership_id}`);
      const newHistoryId = await createSnapshot(
        connection,
        membership_type,
        membership_id,
        "resubmission",
        user.id,
      );
      console.log(`✅ Resubmission snapshot created: ${newHistoryId}`);

      // Update main table status back to pending (0)
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        ac: "MemberRegist_AC_Main",
        am: "MemberRegist_AM_Main",
        ic: "MemberRegist_IC_Main",
      };

      await connection.execute(
        `UPDATE ${tableMap[membership_type]} 
         SET status = 0, 
             rejection_reason = NULL,
             resubmitted_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [membership_id],
      );

      // Update rejection record
      await connection.execute(
        `UPDATE MemberRegist_Rejections 
         SET resubmission_count = resubmission_count + 1,
             history_snapshot_id = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [newHistoryId, id],
      );

      // Add conversation message if provided
      if (userComment && userComment.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Rejection_Conversations 
           (rejection_id, sender_type, sender_id, message) 
           VALUES (?, 'member', ?, ?)`,
          [id, user.id, userComment.trim()],
        );

        await connection.execute(
          `UPDATE MemberRegist_Rejections 
           SET last_conversation_at = NOW(), unread_admin_count = unread_admin_count + 1
           WHERE id = ?`,
          [id],
        );
      }

      // Log action
      await connection.execute(
        `INSERT INTO FTI_Portal_User_log (user_id, action_type, details, created_at)
         VALUES (?, 'member_resubmit_application', ?, NOW())`,
        [
          user.id,
          JSON.stringify({
            rejectionId: id,
            membershipType: membership_type,
            membershipId: membership_id,
            newHistorySnapshotId: newHistoryId,
            resubmissionCount: rejection.resubmission_count + 1,
          }),
        ],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "ส่งใบสมัครใหม่เรียบร้อยแล้ว ระบบจะดำเนินการพิจารณาใหม่",
        data: {
          rejectionId: id,
          membershipType: membership_type,
          membershipId: membership_id,
          newHistorySnapshotId: newHistoryId,
          resubmissionCount: rejection.resubmission_count + 1,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error resubmitting application:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการส่งใบสมัครใหม่" },
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
