import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * Admin Add Comment API
 * 
 * Add a comment without changing application status
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    const body = await request.json();
    const { message, isInternal = false } = body;

    // Validate
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุข้อความ" },
        { status: 400 }
      );
    }

    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทสมาชิกไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Get admin from session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    connection = await getConnection();

    // Get admin name
    const adminName = `${admin.firstname || ''} ${admin.lastname || ''}`.trim() || 'Admin';

    // Insert conversation record
    const [result] = await connection.execute(
      `INSERT INTO MemberRegist_Conversations 
       (membership_type, membership_id, message_type, message, 
        author_type, author_id, author_name, is_internal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        type,
        id,
        'admin_comment',
        message,
        'admin',
        admin.id,
        adminName,
        isInternal ? 1 : 0
      ]
    );

    return NextResponse.json({
      success: true,
      message: "เพิ่มความคิดเห็นเรียบร้อยแล้ว",
      data: {
        id: result.insertId,
        message,
        authorName: adminName,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง",
      },
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
