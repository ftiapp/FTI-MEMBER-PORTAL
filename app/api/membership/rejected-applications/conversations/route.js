import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/membership/rejected-applications/conversations?rejectId={id}
 * Get all conversations for a rejected application
 * Accessible by: Member (owner) and Admin
 */
export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rejectId = searchParams.get("rejectId");

    if (!rejectId) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ rejectId" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Verify access rights
    const [rejectData] = await connection.execute(
      `SELECT user_id, membership_type, membership_id FROM MemberRegist_Reject_DATA WHERE id = ? AND is_active = 1`,
      [rejectId]
    );

    if (!rejectData.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลใบสมัครที่ถูกปฏิเสธ" },
        { status: 404 }
      );
    }

    const reject = rejectData[0];

    // Check access: must be owner or admin
    if (user.role !== "admin" && user.id !== reject.user_id) {
      return NextResponse.json(
        { success: false, message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    // Get all conversations
    const [conversations] = await connection.execute(
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
      FROM MemberRegist_Reject_Conversations c
      LEFT JOIN FTI_Portal_User u ON c.sender_type = 'member' AND c.sender_id = u.id
      LEFT JOIN FTI_Portal_User a ON c.sender_type = 'admin' AND c.sender_id = a.id
      WHERE c.reject_id = ?
      ORDER BY c.created_at ASC`,
      [rejectId]
    );

    // Mark as read for the current user
    if (user.role === "admin") {
      // Mark member messages as read for admin
      await connection.execute(
        `UPDATE MemberRegist_Reject_Conversations 
         SET is_read = 1 
         WHERE reject_id = ? AND sender_type = 'member' AND is_read = 0`,
        [rejectId]
      );

      // Reset unread count for admin
      await connection.execute(
        `UPDATE MemberRegist_Reject_DATA SET unread_count = 0 WHERE id = ?`,
        [rejectId]
      );
    } else {
      // Mark admin messages as read for member
      await connection.execute(
        `UPDATE MemberRegist_Reject_Conversations 
         SET is_read = 1 
         WHERE reject_id = ? AND sender_type = 'admin' AND is_read = 0`,
        [rejectId]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        rejectId: parseInt(rejectId),
        membershipType: reject.membership_type,
        membershipId: reject.membership_id,
        conversations: conversations.map((c) => ({
          id: c.id,
          senderType: c.sender_type,
          senderId: c.sender_id,
          senderName: c.sender_name,
          message: c.message,
          attachments: c.attachments ? JSON.parse(c.attachments) : null,
          isRead: c.is_read === 1,
          createdAt: c.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสนทนา" },
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
 * POST /api/membership/rejected-applications/conversations
 * Add a new message to the conversation
 * Accessible by: Member (owner) and Admin
 */
export async function POST(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rejectId, message, attachments } = body;

    if (!rejectId || !message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ rejectId และข้อความ" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Verify access rights
    const [rejectData] = await connection.execute(
      `SELECT user_id, membership_type, membership_id FROM MemberRegist_Reject_DATA WHERE id = ? AND is_active = 1`,
      [rejectId]
    );

    if (!rejectData.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลใบสมัครที่ถูกปฏิเสธ" },
        { status: 404 }
      );
    }

    const reject = rejectData[0];

    // Check access: must be owner or admin
    if (user.role !== "admin" && user.id !== reject.user_id) {
      return NextResponse.json(
        { success: false, message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    const senderType = user.role === "admin" ? "admin" : "member";

    // Insert new conversation
    const [result] = await connection.execute(
      `INSERT INTO MemberRegist_Reject_Conversations 
       (reject_id, sender_type, sender_id, message, attachments, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [rejectId, senderType, user.id, message.trim(), attachments ? JSON.stringify(attachments) : null]
    );

    // Update last_conversation_at and unread count
    if (senderType === "member") {
      // Member sent message - increment unread for admin
      await connection.execute(
        `UPDATE MemberRegist_Reject_DATA 
         SET last_conversation_at = NOW(), unread_count = unread_count + 1 
         WHERE id = ?`,
        [rejectId]
      );
    } else {
      // Admin sent message - just update timestamp
      await connection.execute(
        `UPDATE MemberRegist_Reject_DATA 
         SET last_conversation_at = NOW() 
         WHERE id = ?`,
        [rejectId]
      );
    }

    // Get the created conversation with sender info
    const [newConversation] = await connection.execute(
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
      FROM MemberRegist_Reject_Conversations c
      LEFT JOIN FTI_Portal_User u ON c.sender_type = 'member' AND c.sender_id = u.id
      LEFT JOIN FTI_Portal_User a ON c.sender_type = 'admin' AND c.sender_id = a.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    const conv = newConversation[0];

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความเรียบร้อยแล้ว",
      data: {
        id: conv.id,
        senderType: conv.sender_type,
        senderId: conv.sender_id,
        senderName: conv.sender_name,
        message: conv.message,
        attachments: conv.attachments ? JSON.parse(conv.attachments) : null,
        isRead: conv.is_read === 1,
        createdAt: conv.created_at,
      },
    });
  } catch (error) {
    console.error("Error adding conversation:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการส่งข้อความ" },
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
