import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { createNotification } from "@/app/lib/notifications";

// ใช้ secret key เดียวกับที่ใช้ในการสร้าง token
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request) {
  try {
    const data = await request.json();
    const { messageId, userId, replyText } = data;

    // Validate required fields
    if (!messageId || !userId || !replyText) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    // Verify user authentication
    // ใช้ request.cookies แทน next/headers เพื่อให้ทำงานใน route handler
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    try {
      const decoded = verify(token, JWT_SECRET);

      // Check if the authenticated user is replying to their own message
      if (decoded.userId !== parseInt(userId)) {
        return NextResponse.json(
          { success: false, message: "ไม่มีสิทธิ์ในการตอบกลับข้อความนี้" },
          { status: 403 },
        );
      }
    } catch (error) {
      console.error("Error verifying user token:", error);
      return NextResponse.json({ success: false, message: "โทเค็นไม่ถูกต้อง" }, { status: 401 });
    }

    // Verify the message exists and belongs to this user
    const messages = await query(`SELECT * FROM contact_messages WHERE id = ? AND user_id = ?`, [
      messageId,
      userId,
    ]);

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อความหรือคุณไม่มีสิทธิ์ในการตอบกลับข้อความนี้" },
        { status: 404 },
      );
    }

    // ตารางถูกสร้างโดย migration แล้ว ไม่จำเป็นต้องสร้างที่นี่อีก

    // Insert user reply into database
    try {
      await query(
        `INSERT INTO contact_message_replies 
         (message_id, regular_user_id, reply_type, reply_text) 
         VALUES (?, ?, 'user', ?)`,
        [messageId, userId, replyText],
      );
    } catch (error) {
      console.error("Error inserting user reply:", error);
      return NextResponse.json(
        { success: false, message: `เกิดข้อผิดพลาดในการบันทึกข้อความตอบกลับ: ${error.message}` },
        { status: 500 },
      );
    }

    // Update the status of the original message to 'user_replied'
    await query(
      `UPDATE contact_messages 
       SET status = 'user_replied', updated_at = NOW() 
       WHERE id = ?`,
      [messageId],
    );

    // Log the activity
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        "contact_message_reply",
        JSON.stringify({
          action: "CONTACT_MESSAGE_REPLY",
          message_id: messageId,
          timestamp: new Date().toISOString(),
        }),
        request.headers.get("x-forwarded-for") || "",
        request.headers.get("user-agent") || "",
      ],
    );

    // Create notification for admin
    try {
      // We don't have a specific admin ID to notify, so we'll create a system notification
      // that will be visible to all admins when they view the contact messages
      await query(
        `UPDATE contact_messages 
         SET has_new_reply = 1 
         WHERE id = ?`,
        [messageId],
      );
    } catch (notificationError) {
      console.error("Error updating message has_new_reply flag:", notificationError);
      // Continue with the process even if notification update fails
    }

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความตอบกลับเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error submitting reply to contact message:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการส่งข้อความตอบกลับ" },
      { status: 500 },
    );
  }
}
