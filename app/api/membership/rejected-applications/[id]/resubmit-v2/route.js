import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { submitACMembershipForm } from "@/app/membership/ac/components/ACFormSubmission";
import { submitOCMembershipForm } from "@/app/membership/oc/components/OCFormSubmission";
import { submitAMMembershipForm } from "@/app/membership/am/components/AMFormSubmission";
import { submitICMembershipForm } from "@/app/membership/ic/components/ICFormSubmission";

/**
 * NEW RESUBMIT API v2 - Simple & Clean
 * 
 * Flow:
 * 1. Load rejection data
 * 2. Submit as NEW application (call submit functions directly)
 * 3. Mark old application as archived
 * 4. Mark rejection_data as used
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { id } = await params;
    const body = await request.json();
    const { membershipType, formData, userComment } = body;

    // Validate input
    if (!membershipType || !formData) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลไม่ครบถ้วน" },
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
      // 1. Verify ownership and get rejection data
      const [rejectedApp] = await connection.execute(
        `SELECT membership_type, membership_id, rejection_data 
         FROM MemberRegist_Reject_DATA 
         WHERE id = ? AND user_id = ? AND is_active = 1`,
        [id, user.id]
      );

      if (!rejectedApp.length) {
        throw new Error("ไม่พบข้อมูลใบสมัครที่ถูกปฏิเสธ หรือคุณไม่มีสิทธิ์เข้าถึง");
      }

      const { membership_id: oldMembershipId } = rejectedApp[0];

      // 2. Get old application version
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        am: "MemberRegist_AM_Main",
        ac: "MemberRegist_AC_Main",
        ic: "MemberRegist_IC_Main",
      };

      const mainTable = tableMap[membershipType];
      const [oldApp] = await connection.execute(
        `SELECT version FROM ${mainTable} WHERE id = ?`,
        [oldMembershipId]
      );

      const oldVersion = oldApp[0]?.version || 1;
      const newVersion = oldVersion + 1;

      // 3. Call submit function directly with parent_id and version
      const enhancedFormData = {
        ...formData,
        parent_id: oldMembershipId,
        version: newVersion,
      };

      let submitResult;
      
      if (membershipType === "ac") {
        submitResult = await submitACMembershipForm(enhancedFormData);
      } else if (membershipType === "oc") {
        submitResult = await submitOCMembershipForm(enhancedFormData);
      } else if (membershipType === "am") {
        submitResult = await submitAMMembershipForm(enhancedFormData);
      } else if (membershipType === "ic") {
        submitResult = await submitICMembershipForm(enhancedFormData);
      } else {
        throw new Error(`Invalid membership type: ${membershipType}`);
      }

      if (!submitResult || !submitResult.success) {
        throw new Error(submitResult?.message || "ไม่สามารถส่งใบสมัครได้");
      }

      const newMembershipId = submitResult.data?.id || submitResult.membershipId;

      // 4. Mark old application as archived
      await connection.execute(
        `UPDATE ${mainTable} 
         SET is_archived = 1, 
             resubmitted_at = NOW(),
             status = 3
         WHERE id = ?`,
        [oldMembershipId]
      );

      // 5. Mark rejection_data as used
      await connection.execute(
        `UPDATE MemberRegist_Reject_DATA 
         SET is_active = 0,
             resubmitted_at = NOW()
         WHERE id = ?`,
        [id]
      );

      // 6. Add user comment if provided
      if (userComment && userComment.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Comments 
           (membership_type, membership_id, user_id, comment_type, comment_text)
           VALUES (?, ?, ?, ?, ?)`,
          [membershipType, newMembershipId, user.id, "user_resubmit", userComment]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "ส่งใบสมัครใหม่เรียบร้อยแล้ว ข้อมูลของท่านได้รับการส่งไปยังผู้ดูแลระบบเพื่อพิจารณาใหม่",
        data: {
          newMembershipId,
          oldMembershipId,
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
