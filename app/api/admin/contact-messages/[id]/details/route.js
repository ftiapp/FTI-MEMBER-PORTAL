import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ในการดำเนินการนี้" },
        { status: 403 },
      );
    }

    // Get the message ID from params
    if (!params) {
      return NextResponse.json({ success: false, message: "ไม่พบพารามิเตอร์" }, { status: 400 });
    }

    const id = parseInt(await params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    // Fetch the message details
    const messages = await query(
      `SELECT cm.*, 
              a1.name as read_by_admin_name, 
              a2.name as replied_by_admin_name 
       FROM FTI_Portal_User_Contact_Messages cm
       LEFT JOIN FTI_Portal_Admin_Users a1 ON cm.read_by_admin_id = a1.id
       LEFT JOIN FTI_Portal_Admin_Users a2 ON cm.replied_by_admin_id = a2.id
       WHERE cm.id = ?`,
      [id],
    );

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อความติดต่อ" }, { status: 404 });
    }

    const message = messages[0];

    // Check if contact_message_responses table exists and fetch admin responses
    let adminResponses = [];
    try {
      // Try to fetch admin responses from the contact_message_responses table
      adminResponses = await query(
        `SELECT cmr.id, cmr.admin_id, cmr.response_text, cmr.created_at, au.name as admin_name
         FROM FTI_Portal_User_Contact_Message_Responses cmr
         LEFT JOIN FTI_Portal_Admin_Users au ON cmr.admin_id = au.id
         WHERE cmr.message_id = ?
         ORDER BY cmr.created_at ASC`,
        [id],
      );
    } catch (error) {
      console.log("Error fetching admin responses, table might not exist:", error);
      // Continue even if table doesn't exist
    }

    // Check if contact_message_replies table exists and fetch user replies
    let userReplies = [];
    try {
      // Try to fetch user replies from the contact_message_replies table
      userReplies = await query(
        `SELECT id, user_id, reply_text, created_at
         FROM FTI_Portal_User_Contact_Message_Replies
         WHERE message_id = ?
         ORDER BY created_at ASC`,
        [id],
      );
    } catch (error) {
      console.log("Error fetching user replies, table might not exist:", error);
      // Continue even if table doesn't exist
    }

    // Create a conversation thread that includes the original message, admin responses, and user replies
    const conversationThread = [];

    // Add the original message as the first item in the thread
    conversationThread.push({
      id: message.id,
      type: "original",
      content: message.message,
      sender: {
        id: message.user_id,
        name: message.name,
        email: message.email,
        phone: message.phone,
      },
      created_at: message.created_at,
    });

    // Add admin responses and user replies to the thread, sorted by timestamp
    const allResponses = [
      ...adminResponses.map((response) => ({
        id: response.id,
        type: "admin_response",
        content: response.response_text,
        sender: {
          id: response.admin_id,
          name: response.admin_name || "Admin",
          type: "admin",
        },
        created_at: response.created_at,
      })),
      ...userReplies.map((reply) => ({
        id: reply.id,
        type: "user_reply",
        content: reply.reply_text,
        sender: {
          id: reply.user_id,
          type: "user",
          name: message.name, // Use the original message sender name
        },
        created_at: reply.created_at,
      })),
    ];

    // Sort all responses by creation timestamp
    allResponses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Add sorted responses to the conversation thread
    conversationThread.push(...allResponses);

    // Update message with conversation thread
    const messageWithThread = {
      ...message,
      conversation_thread: conversationThread,
      has_user_replies: userReplies.length > 0,
    };

    // If message is unread, mark it as read
    if (message.status === "unread") {
      await query(
        `UPDATE FTI_Portal_User_Contact_Messages 
         SET status = 'read', 
             read_by_admin_id = ?, 
             read_at = NOW(), 
             updated_at = NOW() 
         WHERE id = ?`,
        [admin.id, id],
      );

      // Log admin action
      await query(
        `INSERT INTO FTI_Portal_Admin_Actions_Logs 
         (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
         VALUES (?, 'contact_message_read', ?, ?, ?, ?, NOW())`,
        [
          admin.id,
          id,
          JSON.stringify({
            action: "CONTACT_MESSAGE_READ",
            message_id: id,
            message_subject: message.subject,
            user_email: message.email,
            userId: message.user_id || null,
            timestamp: new Date().toISOString(),
          }),
          request.headers.get("x-forwarded-for") || "",
          request.headers.get("user-agent") || "",
        ],
      );
    }

    return NextResponse.json({
      success: true,
      message: messageWithThread,
    });
  } catch (error) {
    console.error("Error fetching message details:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ" },
      { status: 500 },
    );
  }
}
