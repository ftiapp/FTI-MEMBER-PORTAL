import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import {
  sendEmailChangeNotificationToOld,
  sendEmailChangeNotificationToNew,
} from "@/app/lib/mailersend-email-change.postmark";

export async function POST(request) {
  try {
    const { userId, otp } = await request.json();

    if (!userId || !otp) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // ตรวจสอบ OTP ใน FTI_Original_Membership_Pending_Email_Changes
    const pending = await query(
      `SELECT * FROM FTI_Original_Membership_Pending_Email_Changes WHERE user_id = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
      [userId, otp],
    );

    if (!pending || pending.length === 0) {
      return NextResponse.json({ error: "OTP ไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
    }

    const newEmail = pending[0].new_email;

    // ตรวจสอบว่าอีเมลนี้ถูกใช้โดย user อื่นที่ verified แล้วหรือไม่
    const existingUser = await query("SELECT id FROM FTI_Portal_User WHERE email = ? AND id != ?", [
      newEmail,
      userId,
    ]);
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว" }, { status: 400 });
    }

    // ดึงข้อมูลอีเมลเดิมของผู้ใช้
    const userData = await query("SELECT email, firstname, lastname FROM FTI_Portal_User WHERE id = ?", [
      userId,
    ]);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const oldEmail = userData[0].email;
    const firstname = userData[0].firstname;
    const lastname = userData[0].lastname;

    // อัปเดต FTI_Portal_User: เปลี่ยน email และ set email_verified = 1
    await query("UPDATE FTI_Portal_User SET email = ?, email_verified = 1, updated_at = NOW() WHERE id = ?", [
      newEmail,
      userId,
    ]);

    // ลบ FTI_Original_Membership_Pending_Email_Changes
    await query("DELETE FROM FTI_Original_Membership_Pending_Email_Changes WHERE id = ?", [pending[0].id]);

    // บันทึกประวัติการเปลี่ยนอีเมล (ใช้ action เดิมแต่แยกด้วยข้อความใน details)
    await query(
      `INSERT INTO FTI_Portal_User_Logs 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, 'change_email', ?, ?, ?, NOW())`,
      [
        userId,
        `เปลี่ยนอีเมลจาก ${oldEmail} เป็น ${newEmail} (ยืนยันแล้ว)`,
        request.headers.get("x-forwarded-for") || "unknown",
        request.headers.get("user-agent") || "unknown",
      ],
    );

    // ส่งอีเมลแจ้งการเปลี่ยนอีเมลไปยังอีเมลเก่า
    try {
      await sendEmailChangeNotificationToOld(oldEmail, firstname, lastname, newEmail);
    } catch (emailError) {
      console.error("Error sending notification to old email:", emailError);
      // ไม่ต้องหยุดการทำงานหากส่งอีเมลไม่สำเร็จ
    }

    // ส่งอีเมลแจ้งการเปลี่ยนอีเมลไปยังอีเมลใหม่
    try {
      await sendEmailChangeNotificationToNew(newEmail, firstname, lastname);
    } catch (emailError) {
      console.error("Error sending notification to new email:", emailError);
      // ไม่ต้องหยุดการทำงานหากส่งอีเมลไม่สำเร็จ
    }

    return NextResponse.json({ success: true, message: "ยืนยันอีเมลใหม่สำเร็จ" });
  } catch (error) {
    console.error("Error verifying new email OTP:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการยืนยันอีเมลใหม่" }, { status: 500 });
  }
}
