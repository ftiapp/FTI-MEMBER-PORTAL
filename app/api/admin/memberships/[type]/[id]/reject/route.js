import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { createSnapshot } from "@/app/lib/history-snapshot";

/**
 * POST /api/admin/memberships/[type]/[id]/reject
 * Admin rejects a membership application
 */
export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const { type, id } = await params;
    const body = await request.json();
    const { rejectionReason, adminMessage } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเหตุผลการปฏิเสธ" },
        { status: 400 },
      );
    }

    // Validate membership type
    if (!["oc", "ac", "am", "ic"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทสมาชิกไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Get membership info
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        ac: "MemberRegist_AC_Main",
        am: "MemberRegist_AM_Main",
        ic: "MemberRegist_IC_Main",
      };

      const [appRecords] = await connection.execute(
        `SELECT id, user_id, status FROM ${tableMap[type]} WHERE id = ?`,
        [id],
      );

      if (!appRecords.length) {
        throw new Error("ไม่พบใบสมัคร");
      }

      const app = appRecords[0];

      // Check if already rejected
      if (app.status === 2) {
        throw new Error("ใบสมัครนี้ถูกปฏิเสธแล้ว");
      }

      // Create history snapshot
      console.log(`📸 Creating history snapshot for ${type} ${id}`);
      const historyId = await createSnapshot(connection, type, id, "rejection", user.id);
      console.log(`✅ History snapshot created: ${historyId}`);

      // Update main table status to rejected (2)
      await connection.execute(
        `UPDATE ${tableMap[type]} 
         SET status = 2, 
             rejection_reason = ?,
             rejected_at = NOW(),
             rejected_by = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [rejectionReason, user.id, id],
      );

      // Create rejection record
      const [rejectionResult] = await connection.execute(
        `INSERT INTO MemberRegist_Rejections (
          user_id, membership_type, membership_id, history_snapshot_id,
          rejected_by, rejection_reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending_fix')`,
        [app.user_id, type, id, historyId, user.id, rejectionReason],
      );

      const rejectionId = rejectionResult.insertId;

      // Create initial conversation message
      if (adminMessage && adminMessage.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Rejection_Conversations (
            rejection_id, sender_type, sender_id, message
          ) VALUES (?, 'admin', ?, ?)`,
          [rejectionId, user.id, adminMessage.trim()],
        );

        await connection.execute(
          `UPDATE MemberRegist_Rejections 
           SET last_conversation_at = NOW(), unread_member_count = 1
           WHERE id = ?`,
          [rejectionId],
        );
      }

      // Log action
      await connection.execute(
        `INSERT INTO FTI_Portal_User_log (user_id, action_type, details, created_at)
         VALUES (?, 'admin_reject_application', ?, NOW())`,
        [
          user.id,
          JSON.stringify({
            membershipType: type,
            membershipId: id,
            rejectionId,
            historySnapshotId: historyId,
            targetUserId: app.user_id,
          }),
        ],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธใบสมัครเรียบร้อยแล้ว",
        data: {
          rejectionId,
          historySnapshotId: historyId,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการปฏิเสธใบสมัคร" },
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
