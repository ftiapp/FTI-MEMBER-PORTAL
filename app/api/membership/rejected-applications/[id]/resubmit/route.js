import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { updateACApplication } from "@/app/lib/ac-application";
import { updateOCApplication } from "@/app/lib/oc-application";
import { updateAMApplication } from "@/app/lib/am-application";
import { updateICApplication } from "@/app/lib/ic-application";
import { createSnapshot } from "@/app/lib/history-snapshot";

// Helper function to validate required documents
function validateDocuments(formData, membershipType) {
  const errors = [];

  if (membershipType === "ac") {
    // AC required documents
    if (!formData.companyRegistration) {
      errors.push("สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล");
    }

    const hasCompanyStamp =
      formData.companyStamp &&
      (formData.companyStamp.file ||
        formData.companyStamp.url ||
        formData.companyStamp instanceof File);

    const hasAuthorizedSignature =
      formData.authorizedSignature &&
      (formData.authorizedSignature.file ||
        formData.authorizedSignature.url ||
        formData.authorizedSignature instanceof File);

    if (!hasCompanyStamp) {
      errors.push("รูปตราประทับบริษัท");
    }
    if (!hasAuthorizedSignature) {
      errors.push("รูปลายเซ็นผู้มีอำนาจลงนาม");
    }
  } else if (membershipType === "oc") {
    // OC required documents
    if (!formData.companyRegistration) {
      errors.push("สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล");
    }
    if (!formData.factoryLicense) {
      errors.push("สำเนาใบอนุญาตประกอบกิจการโรงงาน");
    }

    const hasCompanyStamp =
      formData.companyStamp &&
      (formData.companyStamp.file ||
        formData.companyStamp.url ||
        formData.companyStamp instanceof File);

    const hasAuthorizedSignature =
      formData.authorizedSignature &&
      (formData.authorizedSignature.file ||
        formData.authorizedSignature.url ||
        formData.authorizedSignature instanceof File);

    if (!hasCompanyStamp) {
      errors.push("รูปตราประทับบริษัท");
    }
    if (!hasAuthorizedSignature) {
      errors.push("รูปลายเซ็นผู้มีอำนาจลงนาม");
    }
  } else if (membershipType === "am") {
    // AM required documents
    if (!formData.associationRegistration) {
      errors.push("สำเนาหนังสือรับรองการจดทะเบียนสมาคม");
    }
    if (!formData.associationProfile) {
      errors.push("โปรไฟล์สมาคม");
    }
    if (!formData.memberList) {
      errors.push("รายชื่อสมาชิก");
    }

    const hasCompanyStamp =
      formData.companyStamp &&
      (formData.companyStamp.file ||
        formData.companyStamp.url ||
        formData.companyStamp instanceof File);

    const hasAuthorizedSignature =
      formData.authorizedSignature &&
      (formData.authorizedSignature.file ||
        formData.authorizedSignature.url ||
        formData.authorizedSignature instanceof File);

    if (!hasCompanyStamp) {
      errors.push("รูปตราประทับสมาคม");
    }
    if (!hasAuthorizedSignature) {
      errors.push("รูปลายเซ็นผู้มีอำนาจลงนาม");
    }
  } else if (membershipType === "ic") {
    // IC required documents
    if (!formData.idCardDocument) {
      errors.push("สำเนาบัตรประชาชน");
    }

    const hasAuthorizedSignature =
      formData.authorizedSignature &&
      (formData.authorizedSignature.file ||
        formData.authorizedSignature.url ||
        formData.authorizedSignature instanceof File);

    if (!hasAuthorizedSignature) {
      errors.push("รูปลายเซ็นผู้มีอำนาจลงนาม");
    }
  }

  return errors;
}

export async function POST(request, { params }) {
  let connection;

  try {
    const { id } = await params;
    const body = await request.json();
    const { formData, userComment, apiData } = body;

    console.log("📝 User comment:", userComment);

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Debug: Log incoming parameters
      console.log("🔍 DEBUG Resubmit - ID:", id, "User ID:", userId);

      // Verify ownership and get rejection data from MemberRegist_Rejections (new system)
      const [rejectData] = await connection.execute(
        `
        SELECT id, membership_type, membership_id, history_snapshot_id, status, resubmission_count
        FROM MemberRegist_Rejections 
        WHERE id = ? AND user_id = ?
      `,
        [id, userId],
      );

      console.log("🔍 DEBUG RejectData found:", rejectData.length, "records");
      if (rejectData.length > 0) {
        console.log("🔍 DEBUG Record:", rejectData[0]);
      }

      if (!rejectData.length) {
        console.log("🔍 DEBUG No rejection record found with id:", id);
        throw new Error(`Rejected application with id ${id} not found`);
      }

      const { membership_type, membership_id, history_snapshot_id } = rejectData[0];

      // Save user comment as conversation if provided
      if (userComment && userComment.trim()) {
        await connection.execute(
          `
          INSERT INTO MemberRegist_Rejection_Conversations 
          (rejection_id, sender_type, sender_id, message, created_at)
          VALUES (?, 'member', ?, ?, NOW())
          `,
          [id, userId, userComment.trim()],
        );

        console.log("💬 Saved user comment to conversation");
      }

      // Validate required documents before proceeding
      if (formData) {
        const documentErrors = validateDocuments(formData, membership_type);
        if (documentErrors.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `กรุณาอัพโหลดเอกสารที่จำเป็นให้ครบถ้วน: ${documentErrors.join(", ")}`,
              errors: documentErrors,
            },
            { status: 400 },
          );
        }
      }

      // อัปเดตข้อมูลตามประเภทสมาชิก
      if (membership_type === "ac" && formData) {
        // ใช้ utility function สำหรับ AC
        await updateACApplication(membership_id, formData, userId, id, userComment, apiData);
      } else if (membership_type === "oc" && formData) {
        // ใช้ utility function สำหรับ OC
        await updateOCApplication(membership_id, formData, userId, id, userComment);
      } else if (membership_type === "am" && formData) {
        await updateAMApplication(membership_id, formData, userId, id, userComment);
      } else if (membership_type === "ic" && formData) {
        await updateICApplication(membership_id, formData, userId, id, userComment);

        // Create history snapshot for IC resubmission
        console.log(`📸 Creating resubmission snapshot for IC ${membership_id}`);
        const historyId = await createSnapshot(
          connection,
          "ic",
          membership_id,
          "resubmission",
          userId,
        );
        console.log(`✅ IC resubmission snapshot created: ${historyId}`);

        // Update rejection record with history snapshot ID
        await connection.execute(
          `UPDATE MemberRegist_Rejections 
           SET history_snapshot_id = ?, updated_at = NOW()
           WHERE id = ?`,
          [historyId, id],
        );
      } else {
        // ถ้าไม่มี formData ให้ทำแบบเดิม (แค่เปลี่ยนสถานะ)
        await legacyResubmit(connection, membership_type, membership_id, userId, id);
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message:
          "ส่งใบสมัครใหม่เรียบร้อยแล้ว ข้อมูลของท่านได้รับการอัปเดตและส่งไปยังผู้ดูแลระบบเพื่อพิจารณาใหม่",
        data: {
          membershipType: membership_type,
          membershipId: membership_id,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error resubmitting rejected application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถส่งใบสมัครใหม่ได้ กรุณาลองใหม่อีกครั้ง",
      },
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

/**
 * ฟังก์ชันสำหรับ resubmit แบบเดิม (แค่เปลี่ยนสถานะ) สำหรับกรณีที่ไม่มี formData
 */
async function legacyResubmit(connection, membership_type, membership_id, userId, rejectionId) {
  // Update rejection status to resubmitted
  await connection.execute(
    `
    UPDATE MemberRegist_Rejections 
    SET status = 'resolved', updated_at = NOW()
    WHERE id = ?
  `,
    [rejectionId],
  );

  // Update the main application status to resubmitted (status = 3) and increment resubmission count
  const tableMap = {
    oc: "MemberRegist_OC_Main",
    am: "MemberRegist_AM_Main",
    ac: "MemberRegist_AC_Main",
    ic: "MemberRegist_IC_Main",
  };

  const mainTable = tableMap[membership_type];
  await connection.execute(
    `
    UPDATE ${mainTable} 
    SET status = 3, 
        resubmission_count = resubmission_count + 1,
        rejection_reason = NULL,
        created_at = NOW(),
        updated_at = NOW()
    WHERE id = ?
  `,
    [membership_id],
  );

  // บันทึก log ของผู้ใช้
  await connection.execute(
    `
    INSERT INTO FTI_Portal_User_Logs (user_id, action, details, created_at)
    VALUES (?, 'resubmit_membership', ?, NOW())
  `,
    [
      userId,
      JSON.stringify({
        membershipType: membership_type,
        membershipId: membership_id,
        rejectionId,
        method: "legacy",
      }),
    ],
  );
}
