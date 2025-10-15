import { query } from "../../../lib/db";
import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../lib/adminAuth";
import { getClientIp } from "../../../lib/utils";
import { createNotification } from "../../../lib/notifications";
import { sendProfileUpdateRejectionEmail } from "../../../lib/postmark";

export async function POST(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { requestId, reason, comment } = await request.json();

    if (!requestId || !reason) {
      return NextResponse.json({ error: "กรุณาระบุ ID คำขอและเหตุผลในการปฏิเสธ" }, { status: 400 });
    }

    // Get request details
    const requests = await query(
      'SELECT * FROM FTI_Portal_User_Profile_Update_Requests WHERE id = ? AND status = "pending"',
      [requestId],
    );

    if (requests.length === 0) {
      return NextResponse.json({ error: "ไม่พบคำขอแก้ไขข้อมูลที่รออนุมัติ" }, { status: 404 });
    }

    const request_data = requests[0];
    const userId = request_data.user_id;

    // Update request status
    await query(
      `UPDATE FTI_Portal_User_Profile_Update_Requests 
       SET status = "rejected", reject_reason = ?, admin_id = ?, admin_comment = ?, updated_at = NOW() 
       WHERE id = ?`,
      [reason, admin.id, comment || null, requestId],
    );

    // Get client IP and user agent
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    // Log admin action
    await query(
      `INSERT INTO FTI_Portal_Admin_Actions_Logs 
       (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        admin.id,
        "reject_profile_update",
        requestId,
        JSON.stringify({
          userId,
          requestId,
          reason,
          comment,
        }),
        ip,
        userAgent,
      ],
    );

    // สร้างการแจ้งเตือนให้ผู้ใช้
    try {
      await createNotification(
        userId,
        "profile_update",
        `คำขอแก้ไขข้อมูลส่วนตัวของคุณถูกปฏิเสธ: ${reason || "ไม่ระบุเหตุผล"}`,
        "/dashboard?tab=updatemember",
      );
      console.log("Profile update rejection notification created for user:", userId);
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // ไม่ต้องหยุดการทำงานหากไม่สามารถสร้างการแจ้งเตือนได้
    }

    // ส่งอีเมลแจ้งเตือนผู้ใช้
    try {
      // ดึงข้อมูลผู้ใช้
      const userData = await query("SELECT email, firstname, lastname FROM FTI_Portal_User WHERE id = ?", [userId]);
      if (userData && userData.length > 0 && userData[0].email) {
        await sendProfileUpdateRejectionEmail(
          userData[0].email,
          userData[0].firstname || "",
          userData[0].lastname || "",
          reason,
        );
        console.log("Profile update rejection email sent to:", userData[0].email);
      }
    } catch (emailError) {
      console.error("Error sending profile update rejection email:", emailError);
      // Continue with the process even if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: "ปฏิเสธคำขอแก้ไขข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Error rejecting profile update request:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูล" },
      { status: 500 },
    );
  }
}
