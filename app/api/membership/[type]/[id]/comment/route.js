import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * User Add Comment API
 *
 * Add a comment without changing application status
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    const body = await request.json();
    const { message } = body;

    // Validate
    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: "กรุณาระบุข้อความ" }, { status: 400 });
    }

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
    const [appRows] = await connection.execute(`SELECT user_id FROM ${mainTable} WHERE id = ?`, [
      id,
    ]);

    if (appRows.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบใบสมัครนี้" }, { status: 404 });
    }

    if (appRows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "คุณไม่มีสิทธิ์เพิ่มความคิดเห็นในใบสมัครนี้" },
        { status: 403 },
      );
    }

    // Get user name
    const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "ผู้ใช้";

    // Insert conversation record
    const [result] = await connection.execute(
      `INSERT INTO MemberRegist_Conversations 
       (membership_type, membership_id, message_type, message, 
        author_type, author_id, author_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [type, id, "user_comment", message, "user", user.id, userName],
    );

    return NextResponse.json({
      success: true,
      message: "เพิ่มความคิดเห็นเรียบร้อยแล้ว",
      data: {
        id: result.insertId,
        message,
        authorName: userName,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง",
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
