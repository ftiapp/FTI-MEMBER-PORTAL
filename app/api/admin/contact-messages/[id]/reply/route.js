import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";
import { createNotification } from "@/app/lib/notifications";

export async function PUT(request, { params }) {
  try {
    // ตรวจสอบว่ามี params และ id หรือไม่
    if (!params) {
      return NextResponse.json({ success: false, message: "ไม่พบพารามิเตอร์" }, { status: 400 });
    }

    // ใช้ parseInt เพื่อแปลง id เป็นตัวเลข
    const id = parseInt(params?.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const requestData = await request.json();
    const admin_response = requestData.admin_response || "";

    // Get admin session
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ในการดำเนินการนี้" },
        { status: 403 },
      );
    }

    const adminId = admin.id;
    const adminName = admin.username || "Admin";

    if (!id) {
      return NextResponse.json({ success: false, message: "ไม่พบ ID ข้อความ" }, { status: 400 });
    }

    if (!admin_response) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุข้อความตอบกลับ" },
        { status: 400 },
      );
    }

    // Get message details
    const messages = await query(`SELECT * FROM FTI_Portal_User_Contact_Messages WHERE id = ?`, [id]);

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อความติดต่อ" }, { status: 404 });
    }

    const message = messages[0];

    // สร้างตารางใหม่สำหรับเก็บข้อความตอบกลับ
    try {
      // ตรวจสอบว่ามีตาราง contact_message_responses หรือไม่
      await query(
        `CREATE TABLE IF NOT EXISTS contact_message_responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message_id INT NOT NULL,
          admin_id INT NOT NULL,
          response_text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (message_id) REFERENCES contact_messages(id)
        )`,
      );
    } catch (error) {
      console.error("Error creating contact_message_responses table:", error);
      // ไม่ต้อง throw error เพราะถ้าตารางมีอยู่แล้วก็ไม่เป็นไร
    }

    // บันทึกข้อความตอบกลับในตาราง contact_message_responses
    await query(
      `INSERT INTO FTI_Portal_User_Contact_Message_Responses (message_id, admin_id, response_text) VALUES (?, ?, ?)`,
      [id, adminId, admin_response],
    );

    // อัปเดตสถานะของข้อความเป็น 'replied' และตั้งค่า admin_response เป็น 1
    await query(
      `UPDATE FTI_Portal_User_Contact_Messages 
       SET status = 'replied', 
           admin_response = 1, 
           replied_by_admin_id = ?, 
           replied_at = NOW(), 
           updated_at = NOW() 
       WHERE id = ?`,
      [adminId, id],
    );

    // Log admin action
    await query(
      `INSERT INTO FTI_Portal_Admin_Actions_Logs 
       (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, 'contact_message_response', ?, ?, ?, ?, NOW())`,
      [
        adminId,
        id,
        JSON.stringify({
          action: "CONTACT_MESSAGE_RESPONSE",
          message_id: id,
          message_subject: message.subject,
          message_response:
            admin_response.substring(0, 100) + (admin_response.length > 100 ? "..." : ""),
          user_email: message.email,
          userId: message.user_id || null,
          timestamp: new Date().toISOString(),
        }),
        request.headers.get("x-forwarded-for") || "",
        request.headers.get("user-agent") || "",
      ],
    );

    // สร้างการแจ้งเตือนในระบบเมื่อแอดมินตอบข้อความติดต่อ
    if (message.user_id) {
      try {
        await createNotification(
          message.user_id,
          "contact_reply",
          `ข้อความติดต่อของคุณเรื่อง "${message.subject}" ได้รับการตอบกลับแล้ว`,
          `/dashboard?tab=contact&messageId=${id}&reply=true`,
        );
        console.log("Contact reply notification created for user:", message.user_id);
      } catch (notificationError) {
        console.error("Error creating contact reply notification:", notificationError);
        // Continue with the process even if notification creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกการตอบกลับเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error replying to message:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการตอบกลับข้อความ" },
      { status: 500 },
    );
  }
}
