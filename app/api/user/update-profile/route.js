import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getClientIp } from "@/app/lib/utils";
import { sendProfileUpdateRequestEmail } from "@/app/lib/postmark";

export async function POST(request) {
  try {
    const { userId, firstName, lastName, email, phone } = await request.json();

    if (!userId || !firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // Check if user exists
    const FTI_Portal_User = await query("SELECT * FROM FTI_Portal_User WHERE id = ?", [userId]);
    if (FTI_Portal_User.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // Check if there's already a pending request
    const pendingRequests = await query(
      'SELECT id FROM FTI_Portal_User_Profile_Update_Requests WHERE user_id = ? AND status = "pending"',
      [userId],
    );

    if (pendingRequests.length > 0) {
      return NextResponse.json(
        { error: "คุณมีคำขอแก้ไขข้อมูลที่รออนุมัติอยู่แล้ว" },
        { status: 400 },
      );
    }

    // Get client IP and user agent
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    // Create profile update request
    const result = await query(
      `INSERT INTO FTI_Portal_User_Profile_Update_Requests 
       (user_id, new_firstname, new_lastname, new_email, new_phone, status, created_at) 
       VALUES (?, ?, ?, ?, ?, "pending", NOW())`,
      [userId, firstName, lastName, email, phone],
    );

    const requestId = result.insertId;

    // Log the action
    await query(
      `INSERT INTO FTI_Portal_User_Logs 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        "profile_update_request",
        JSON.stringify({
          requestId,
          firstName,
          lastName,
          email,
          phone,
        }),
        ip,
        userAgent,
      ],
    );

    // ส่งอีเมลแจ้งเตือนผู้ใช้
    try {
      await sendProfileUpdateRequestEmail(email, firstName, lastName);
      console.log("Profile update request email sent to:", email);
    } catch (emailError) {
      console.error("Error sending profile update request email:", emailError);
      // Continue with the process even if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: "ส่งคำขอแก้ไขข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ",
      requestId,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการส่งคำขอแก้ไขข้อมูล" }, { status: 500 });
  }
}
