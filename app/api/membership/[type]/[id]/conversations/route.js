import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * Get Conversations for a Membership Application
 *
 * Returns all conversation messages (excluding internal admin notes)
 */

export async function GET(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;

    // Validate
    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทสมาชิกไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    connection = await getConnection();

    // Verify user owns this application
    const tableMap = {
      oc: "MemberRegist_OC_Main",
      ac: "MemberRegist_AC_Main",
      am: "MemberRegist_AM_Main",
      ic: "MemberRegist_IC_Main",
    };

    const mainTable = tableMap[type];
    const [appRows] = await connection.execute(
      `SELECT user_id, status FROM ${mainTable} WHERE id = ?`,
      [id],
    );

    if (appRows.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบใบสมัครนี้" }, { status: 404 });
    }

    if (appRows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 },
      );
    }

    // Get all conversations (exclude internal admin notes)
    const [conversations] = await connection.execute(
      `SELECT 
        id,
        message_type,
        message,
        author_type,
        author_name,
        status_before,
        status_after,
        created_at
       FROM MemberRegist_Conversations
       WHERE membership_type = ? 
         AND membership_id = ?
         AND is_internal = 0
       ORDER BY created_at ASC`,
      [type, id],
    );

    return NextResponse.json({
      success: true,
      data: {
        applicationStatus: appRows[0].status,
        conversations: conversations.map((conv) => ({
          id: conv.id,
          type: conv.message_type,
          message: conv.message,
          authorType: conv.author_type,
          authorName: conv.author_name,
          statusBefore: conv.status_before,
          statusAfter: conv.status_after,
          createdAt: conv.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลได้",
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
