import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sendEmailChangeNotificationToOld } from "@/app/lib/mailersend-email-change.postmark";
import { createNotification } from "@/app/lib/notifications";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "กรุณาระบุโทเคนยืนยัน" }, { status: 400 });
    }

    // Try to get the verification token with the token_id join first
    try {
      const verificationToken = await query(
        `SELECT vt.*, pec.new_email, pec.id as pending_id, u.email as old_email, u.firstname, u.lastname
         FROM FTI_Portal_User_Verification_Tokens vt
         JOIN FTI_Original_Membership_Pending_Email_Changes pec ON vt.id = pec.token_id
         JOIN FTI_Portal_User u ON vt.user_id = u.id
         WHERE vt.token = ? AND vt.token_type = 'new_email_verification' AND vt.used = 0 AND vt.expires_at > NOW()`,
        [token],
      );

      if (verificationToken && verificationToken.length > 0) {
        return await processVerification(verificationToken[0], request);
      }
    } catch (error) {
      // If token_id column doesn't exist, try with user_id join instead
      if (error.code === "ER_BAD_FIELD_ERROR" && error.sqlMessage.includes("token_id")) {
        console.log("Falling back to user_id join for verification");
      } else {
        // If it's another error, re-throw it
        throw error;
      }
    }

    // Try with user_id join if token_id join failed or returned no results
    const verificationToken = await query(
      `SELECT vt.*, pec.new_email, pec.id as pending_id, u.email as old_email, u.firstname, u.lastname
       FROM FTI_Portal_User_Verification_Tokens vt
       JOIN FTI_Original_Membership_Pending_Email_Changes pec ON vt.user_id = pec.user_id
       JOIN FTI_Portal_User u ON vt.user_id = u.id
       WHERE vt.token = ? AND vt.token_type = 'new_email_verification' AND vt.used = 0 AND vt.expires_at > NOW()
       ORDER BY pec.created_at DESC LIMIT 1`,
      [token],
    );

    if (!verificationToken || verificationToken.length === 0) {
      return NextResponse.json({ error: "โทเคนไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
    }

    return await processVerification(verificationToken[0], request);
  } catch (error) {
    console.error("Error verifying new email:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการยืนยันอีเมล: " + error.message },
      { status: 500 },
    );
  }
}

async function processVerification(tokenData, request) {
  try {
    if (!tokenData) {
      return NextResponse.json({ error: "โทเคนไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
    }

    const { user_id, new_email, old_email, firstname, lastname, pending_id } = tokenData;

    // อัปเดตอีเมลของผู้ใช้จาก FTI_Original_Membership_Pending_Email_Changes และตั้งค่า email_verified เป็น 1
    await query("UPDATE FTI_Portal_User SET email = ?, email_verified = 1, updated_at = NOW() WHERE id = ?", [
      new_email,
      user_id,
    ]);

    // อัปเดตสถานะ token เป็นใช้งานแล้ว
    await query("UPDATE FTI_Portal_User_Verification_Tokens SET used = 1 WHERE id = ?", [tokenData.id]);

    // อัปเดตสถานะการยืนยันอีเมลใหม่
    try {
      // Try to update the verified status
      await query(
        "UPDATE FTI_Original_Membership_Pending_Email_Changes SET verified = 1, verified_at = NOW() WHERE id = ?",
        [pending_id],
      );
    } catch (error) {
      // If verified column doesn't exist, try with status column
      if (error.code === "ER_BAD_FIELD_ERROR" && error.sqlMessage.includes("verified")) {
        await query(
          "UPDATE FTI_Original_Membership_Pending_Email_Changes SET status = 'verified', updated_at = NOW() WHERE id = ?",
          [pending_id],
        );
      } else {
        throw error;
      }
    }

    // บันทึกประวัติการเปลี่ยนอีเมล
    await query(
      `INSERT INTO FTI_Portal_User_Logs 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, 'change_email', ?, ?, ?, NOW())`,
      [
        user_id,
        `เปลี่ยนอีเมลจาก ${old_email} เป็น ${new_email}`,
        request.headers.get("x-forwarded-for") || "unknown",
        request.headers.get("user-agent") || "unknown",
      ],
    );

    // ส่งอีเมลแจ้งเตือนไปยังอีเมลเก่า (ถ้ายังเข้าถึงได้)
    try {
      await sendEmailChangeNotificationToOld(old_email, `${firstname} ${lastname}`, new_email);
    } catch (emailError) {
      console.error("Error sending notification to old email:", emailError);
      // ไม่ต้องหยุดการทำงานหากส่งอีเมลไม่สำเร็จ
    }

    // สร้างการแจ้งเตือนในระบบเมื่อเปลี่ยนอีเมลสำเร็จ
    try {
      await createNotification(
        user_id,
        "profile_update",
        `อีเมลของคุณถูกเปลี่ยนจาก ${old_email} เป็น ${new_email} เรียบร้อยแล้ว`,
        "/dashboard?tab=profile",
      );
      console.log("Email change notification created for user:", user_id);
    } catch (notificationError) {
      console.error("Error creating email change notification:", notificationError);
      // Continue with the process even if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: "ยืนยันอีเมลใหม่สำเร็จ",
      userId: user_id,
      newEmail: new_email,
    });
  } catch (error) {
    console.error("Error in processVerification:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการยืนยันอีเมล: " + error.message },
      { status: 500 },
    );
  }
}
