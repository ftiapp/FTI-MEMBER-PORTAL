import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/app/lib/adminAuth";
import { getClientIp } from "@/app/lib/utils";
import { createNotification } from "@/app/lib/notifications";
import { sendProfileUpdateApprovalEmail } from "@/app/lib/postmark";

export async function POST(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { requestId, comment, new_firstname, new_lastname } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: "กรุณาระบุ ID คำขอ" }, { status: 400 });
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

    // Update user information with potentially edited name fields
    await query(
      `UPDATE FTI_Portal_User 
       SET firstname = ?, lastname = ?, email = ?, phone = ? 
       WHERE id = ?`,
      [
        // Use edited name fields if provided, otherwise use original values
        new_firstname !== undefined ? new_firstname : request_data.new_firstname,
        new_lastname !== undefined ? new_lastname : request_data.new_lastname,
        request_data.new_email,
        request_data.new_phone,
        userId,
      ],
    );

    // Update request status
    await query(
      `UPDATE FTI_Portal_User_Profile_Update_Requests 
       SET status = "approved", admin_id = ?, admin_comment = ?, updated_at = NOW() 
       WHERE id = ?`,
      [admin.id, comment || null, requestId],
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
        "approve_profile_update",
        requestId,
        JSON.stringify({
          userId,
          requestId,
          comment,
          original_firstname: request_data.new_firstname,
          original_lastname: request_data.new_lastname,
          edited_firstname: new_firstname,
          edited_lastname: new_lastname,
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
        `คำขอแก้ไขข้อมูลส่วนตัวของคุณได้รับการอนุมัติแล้ว`,
        "/dashboard?tab=updatemember",
      );
      console.log("Profile update approval notification created for user:", userId);
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // ไม่ต้องหยุดการทำงานหากไม่สามารถสร้างการแจ้งเตือนได้
    }

    // ส่งอีเมลแจ้งเตือนผู้ใช้
    try {
      // ดึงข้อมูลผู้ใช้
      const userData = await query("SELECT email, firstname, lastname FROM FTI_Portal_User WHERE id = ?", [userId]);
      if (userData && userData.length > 0 && userData[0].email) {
        await sendProfileUpdateApprovalEmail(
          userData[0].email,
          userData[0].firstname || "",
          userData[0].lastname || "",
        );
        console.log("Profile update approval email sent to:", userData[0].email);
      }
    } catch (emailError) {
      console.error("Error sending profile update approval email:", emailError);
      // Continue with the process even if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: "อนุมัติคำขอแก้ไขข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Error approving profile update request:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขข้อมูล" },
      { status: 500 },
    );
  }
}
