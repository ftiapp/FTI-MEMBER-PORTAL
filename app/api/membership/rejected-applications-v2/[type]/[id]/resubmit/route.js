import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { submitACMembershipForm } from "@/app/membership/ac/components/ACFormSubmission";
import { submitOCMembershipForm } from "@/app/membership/oc/components/OCFormSubmission";
import { submitAMMembershipForm } from "@/app/membership/am/components/AMFormSubmission";
import { submitICMembershipForm } from "@/app/membership/ic/components/ICFormSubmission";

/**
 * RESUBMIT API v2 - No Reject_DATA
 * 
 * Flow:
 * 1. Verify old application is rejected (status = 2)
 * 2. Submit NEW application
 * 3. Mark old as archived
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    const body = await request.json();
    const { formData, userComment } = body;

    if (!formData) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

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
      // 1. Verify old application
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        ac: "MemberRegist_AC_Main",
        am: "MemberRegist_AM_Main",
        ic: "MemberRegist_IC_Main",
      };

      const mainTable = tableMap[type];
      const [oldApp] = await connection.execute(
        `SELECT id, version, status FROM ${mainTable} 
         WHERE id = ? AND user_id = ? AND status = 2 AND is_archived = 0`,
        [id, user.id]
      );

      if (!oldApp.length) {
        throw new Error("ไม่พบใบสมัครที่ถูกปฏิเสธ หรือคุณไม่มีสิทธิ์เข้าถึง");
      }

      const oldVersion = oldApp[0].version || 1;
      const newVersion = oldVersion + 1;

      // 2. Submit NEW application
      const enhancedFormData = {
        ...formData,
        parent_id: id,
        version: newVersion,
      };

      let submitResult;
      
      if (type === "ac") {
        submitResult = await submitACMembershipForm(enhancedFormData);
      } else if (type === "oc") {
        submitResult = await submitOCMembershipForm(enhancedFormData);
      } else if (type === "am") {
        submitResult = await submitAMMembershipForm(enhancedFormData);
      } else if (type === "ic") {
        submitResult = await submitICMembershipForm(enhancedFormData);
      } else {
        throw new Error(`Invalid membership type: ${type}`);
      }

      if (!submitResult || !submitResult.success) {
        throw new Error(submitResult?.message || "ไม่สามารถส่งใบสมัครได้");
      }

      const newMembershipId = submitResult.data?.id || submitResult.membershipId;

      // 3. Mark old as archived
      await connection.execute(
        `UPDATE ${mainTable} 
         SET is_archived = 1, 
             resubmitted_at = NOW(),
             status = 3
         WHERE id = ?`,
        [id]
      );

      // 4. Add user comment if provided
      if (userComment && userComment.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Comments 
           (membership_type, membership_id, user_id, comment_type, comment_text)
           VALUES (?, ?, ?, ?, ?)`,
          [type, newMembershipId, user.id, "user_resubmit", userComment]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "ส่งใบสมัครใหม่เรียบร้อยแล้ว",
        data: {
          newMembershipId,
          oldMembershipId: id,
          version: newVersion,
        },
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
        message: error.message || "ไม่สามารถส่งใบสมัครใหม่ได้",
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
