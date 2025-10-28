import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function POST(request, { params }) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const requestBody = await request.json();
    const replyMessage = requestBody.replyMessage || requestBody.remark;

    if (!replyMessage || replyMessage.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Remark message is required" },
        { status: 400 },
      );
    }

    console.log("Saving remark for message ID:", id, "Remark:", replyMessage);

    // Update message with remark
    const updateQuery = `
      UPDATE FTI_Portal_Guest_Contact_Messages
      SET 
        status = 'replied', 
        replied_at = NOW(), 
        replied_by_admin_id = ?,
        remark = ?
      WHERE id = ?
    `;

    try {
      // First check if message is already assigned
      const checkQuery = `SELECT assigned_to FROM FTI_Portal_Guest_Contact_Messages WHERE id = ?`;
      const checkResult = await query(checkQuery, [id]);

      if (checkResult && checkResult.length > 0) {
        // If not assigned, assign it
        if (!checkResult[0].assigned_to) {
          const assignQuery = `UPDATE FTI_Portal_Guest_Contact_Messages SET assigned_to = ? WHERE id = ?`;
          await query(assignQuery, [admin.name || "Unknown admin", id]);
        }
      }

      // Update the message with remark
      await query(updateQuery, [admin.id, replyMessage, id]);
    } catch (dbError) {
      console.error("Database error when updating message:", dbError);
      return NextResponse.json(
        { success: false, message: `Database error: ${dbError.message}` },
        { status: 500 },
      );
    }

    // Log the action
    const logQuery = `
      INSERT INTO FTI_Portal_Admin_Actions_Logs 
      (admin_id, action_type, target_id, description, ip_address, user_agent, created_at)
      VALUES (?, 'contact_message_response', ?, ?, ?, ?, NOW())
    `;

    try {
      await query(logQuery, [
        admin.id,
        id,
        `Added remark to guest contact message: ${replyMessage.substring(0, 50)}${replyMessage.length > 50 ? "..." : ""}`,
        request.headers.get("x-forwarded-for") || "unknown",
        request.headers.get("user-agent") || "unknown",
      ]);
    } catch (logError) {
      console.error("Error logging admin action:", logError);
      // Continue even if logging fails
    }

    return NextResponse.json({
      success: true,
      message: "Remark saved successfully",
    });
  } catch (error) {
    console.error("Error saving remark:", error);
    return NextResponse.json(
      { success: false, message: `Failed to save remark: ${error.message}` },
      { status: 500 },
    );
  }
}
