import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

// Admin view of membership conversations
// Reads from MemberRegist_Conversations using membership_type + membership_id
export async function GET(request, { params }) {
  let connection;

  try {
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { type, id } = await params;

    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทสมาชิกไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    connection = await getConnection();

    // Fetch all conversations for this application (admin sees both internal/external)
    const [rows] = await connection.execute(
      `SELECT 
         id,
         message_type,
         message,
         author_type,
         author_name,
         status_before,
         status_after,
         is_internal,
         attachments,
         created_at
       FROM MemberRegist_Conversations
       WHERE membership_type = ?
         AND membership_id = ?
       ORDER BY created_at ASC`,
      [type, id],
    );

    const conversations = rows.map((row) => ({
      id: row.id,
      // Keep existing ConversationHistory prop names for compatibility
      sender_type: row.author_type, // 'admin' | 'user' | 'system'
      message: row.message,
      attachments:
        row.attachments && typeof row.attachments === "string"
          ? JSON.parse(row.attachments)
          : row.attachments || [],
      created_at: row.created_at,
      // Extra fields (not yet used by UI but available if needed)
      message_type: row.message_type,
      author_name: row.author_name,
      status_before: row.status_before,
      status_after: row.status_after,
      is_internal: row.is_internal,
    }));

    return NextResponse.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสื่อสาร" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
