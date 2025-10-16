import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Make sure admin.name is not undefined
    const adminName = admin.name || "Unknown admin";
    console.log("Assigning message to admin:", adminName);

    // Assign message to the admin
    const updateQuery = `
      UPDATE FTI_Portal_Guest_Contact_Messages
      SET assigned_to = ?
      WHERE id = ?
    `;

    try {
      await query(updateQuery, [adminName, id]);
      console.log("Message assigned successfully");
    } catch (dbError) {
      console.error("Database error when assigning message:", dbError);
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
      const adminId = admin.id || 0; // Use 0 if admin.id is undefined
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";
      const description = `Admin ${adminName} assigned to guest contact message`;

      await query(logQuery, [adminId, id, description, ipAddress, userAgent]);
    } catch (logError) {
      // Just log the error but continue
      console.error("Error logging admin action:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Message assigned successfully",
      adminName: admin.name,
    });
  } catch (error) {
    console.error("Error assigning message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign message" },
      { status: 500 },
    );
  }
}
