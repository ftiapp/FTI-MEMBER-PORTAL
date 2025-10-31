import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = await params;

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    console.log("🔍 Fetching conversations for rejection ID:", id);

    // Verify rejection belongs to user
    const [rejectData] = await connection.execute(
      `SELECT id FROM MemberRegist_Rejections WHERE id = ? AND user_id = ?`,
      [id, userId],
    );

    if (!rejectData.length) {
      console.log("❌ Rejection not found or access denied");
      return NextResponse.json(
        {
          success: false,
          message: "Rejection not found or access denied",
        },
        { status: 404 },
      );
    }

    // Fetch conversations
    const [conversations] = await connection.execute(
      `SELECT 
        id,
        rejection_id,
        sender_type,
        sender_id,
        message,
        attachments,
        is_read,
        read_at,
        created_at
       FROM MemberRegist_Rejection_Conversations 
       WHERE rejection_id = ?
       ORDER BY created_at ASC`,
      [id],
    );

    console.log("✅ Fetched conversations:", conversations.length);

    // Parse attachments JSON
    const parsedConversations = conversations.map((conv) => ({
      ...conv,
      attachments: conv.attachments
        ? typeof conv.attachments === "string"
          ? JSON.parse(conv.attachments)
          : conv.attachments
        : [],
    }));

    return NextResponse.json({
      success: true,
      data: parsedConversations,
    });
  } catch (error) {
    console.error("💥 Error fetching conversations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch conversations",
      },
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
