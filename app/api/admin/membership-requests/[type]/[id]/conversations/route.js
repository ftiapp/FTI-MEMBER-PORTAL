import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { type, id } = await params;

    // Get database connection
    const connection = await getConnection();

    try {
      // First, get the rejection_id for this application
      const [rejectionData] = await connection.execute(
        `
        SELECT id FROM MemberRegist_Rejections 
        WHERE membership_type = ? AND membership_id = ?
        ORDER BY rejected_at DESC
        LIMIT 1
        `,
        [type, id],
      );

      if (!rejectionData.length) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "ไม่พบข้อมูลการสื่อสาร",
        });
      }

      const rejectionId = rejectionData[0].id;

      // Get conversations for this rejection
      const [conversations] = await connection.execute(
        `
        SELECT 
          id,
          sender_type,
          sender_id,
          message,
          attachments,
          is_read,
          read_at,
          created_at
        FROM MemberRegist_Rejection_Conversations 
        WHERE rejection_id = ?
        ORDER BY created_at ASC
        `,
        [rejectionId],
      );

      // Parse attachments JSON if exists
      const processedConversations = conversations.map((conv) => ({
        ...conv,
        attachments: conv.attachments ? JSON.parse(conv.attachments) : null,
      }));

      return NextResponse.json({
        success: true,
        data: processedConversations,
        count: processedConversations.length,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสื่อสาร" },
      { status: 500 },
    );
  }
}
