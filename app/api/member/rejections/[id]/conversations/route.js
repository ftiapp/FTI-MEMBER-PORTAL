import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/member/rejections/[id]/conversations
 * Get all conversations for a rejection
 */
export async function GET(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;
    connection = await getConnection();

    // Verify access
    const [rejections] = await connection.execute(
      `SELECT user_id FROM MemberRegist_Rejections WHERE id = ?`,
      [id]
    );

    if (!rejections.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูล" },
        { status: 404 }
      );
    }

    // Check access (member must be owner, or admin)
    if (user.role !== "admin" && user.id !== rejections[0].user_id) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    // Get conversations
    const [conversations] = await connection.execute(
      `SELECT 
        c.id,
        c.sender_type,
        c.sender_id,
        c.message,
        c.attachments,
        c.is_read,
        c.read_at,
        c.created_at,
        CASE 
          WHEN c.sender_type = 'admin' THEN CONCAT(a.firstname, ' ', a.lastname)
          WHEN c.sender_type = 'member' THEN CONCAT(u.firstname, ' ', u.lastname)
        END as sender_name
      FROM MemberRegist_Rejection_Conversations c
      LEFT JOIN FTI_Portal_User u ON c.sender_type = 'member' AND c.sender_id = u.id
      LEFT JOIN FTI_Portal_User a ON c.sender_type = 'admin' AND c.sender_id = a.id
      WHERE c.rejection_id = ?
      ORDER BY c.created_at ASC`,
      [id]
    );

    // Mark messages as read
    if (user.role === "admin") {
      await connection.execute(
        `UPDATE MemberRegist_Rejection_Conversations 
         SET is_read = 1, read_at = NOW()
         WHERE rejection_id = ? AND sender_type = 'member' AND is_read = 0`,
        [id]
      );
      await connection.execute(
        `UPDATE MemberRegist_Rejections SET unread_admin_count = 0 WHERE id = ?`,
        [id]
      );
    } else {
      await connection.execute(
        `UPDATE MemberRegist_Rejection_Conversations 
         SET is_read = 1, read_at = NOW()
         WHERE rejection_id = ? AND sender_type = 'admin' AND is_read = 0`,
        [id]
      );
      await connection.execute(
        `UPDATE MemberRegist_Rejections SET unread_member_count = 0 WHERE id = ?`,
        [id]
      );
    }

    return NextResponse.json({
      success: true,
      data: conversations.map((c) => ({
        id: c.id,
        senderType: c.sender_type,
        senderId: c.sender_id,
        senderName: c.sender_name,
        message: c.message,
        attachments: c.attachments ? JSON.parse(c.attachments) : null,
        isRead: c.is_read === 1,
        readAt: c.read_at,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด" },
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

/**
 * POST /api/member/rejections/[id]/conversations
 * Add a new message
 */
export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { message, attachments } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุข้อความ" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Verify access
    const [rejections] = await connection.execute(
      `SELECT user_id FROM MemberRegist_Rejections WHERE id = ?`,
      [id]
    );

    if (!rejections.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูล" },
        { status: 404 }
      );
    }

    if (user.role !== "admin" && user.id !== rejections[0].user_id) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const senderType = user.role === "admin" ? "admin" : "member";

    // Insert message
    const [result] = await connection.execute(
      `INSERT INTO MemberRegist_Rejection_Conversations 
       (rejection_id, sender_type, sender_id, message, attachments) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, senderType, user.id, message.trim(), attachments ? JSON.stringify(attachments) : null]
    );

    // Update rejection record
    if (senderType === "member") {
      await connection.execute(
        `UPDATE MemberRegist_Rejections 
         SET last_conversation_at = NOW(), unread_admin_count = unread_admin_count + 1 
         WHERE id = ?`,
        [id]
      );
    } else {
      await connection.execute(
        `UPDATE MemberRegist_Rejections 
         SET last_conversation_at = NOW(), unread_member_count = unread_member_count + 1 
         WHERE id = ?`,
        [id]
      );
    }

    // Get created message
    const [newMsg] = await connection.execute(
      `SELECT 
        c.id,
        c.sender_type,
        c.sender_id,
        c.message,
        c.attachments,
        c.is_read,
        c.created_at,
        CASE 
          WHEN c.sender_type = 'admin' THEN CONCAT(a.firstname, ' ', a.lastname)
          WHEN c.sender_type = 'member' THEN CONCAT(u.firstname, ' ', u.lastname)
        END as sender_name
      FROM MemberRegist_Rejection_Conversations c
      LEFT JOIN FTI_Portal_User u ON c.sender_type = 'member' AND c.sender_id = u.id
      LEFT JOIN FTI_Portal_User a ON c.sender_type = 'admin' AND c.sender_id = a.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    const msg = newMsg[0];

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความเรียบร้อย",
      data: {
        id: msg.id,
        senderType: msg.sender_type,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        message: msg.message,
        attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
        isRead: msg.is_read === 1,
        createdAt: msg.created_at,
      },
    });
  } catch (error) {
    console.error("Error adding conversation:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด" },
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
