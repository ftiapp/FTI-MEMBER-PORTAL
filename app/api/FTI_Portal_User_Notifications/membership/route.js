import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

/**
 * API Route: Send notification after membership application
 * POST /api/FTI_Portal_User_Notifications/membership
 */
export async function POST(request) {
  let connection;
  
  try {
    const body = await request.json();
    const {
      userId,
      applicationType,
      applicationId,
      applicantName,
      applicantEmail,
    } = body;

    // Validate required fields
    if (!userId || !applicationType || !applicationId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Create notification message based on application type
    const typeLabels = {
      AC: "สมาชิกสมทบ (นิติบุคคล)",
      OC: "สมาชิกสามัญ (นิติบุคคล)",
      AM: "สมาชิกสมทบ (สมาคมการค้า)",
      IC: "สมาชิกสามัญ (บุคคลธรรมดา)",
    };

    const typeLabel = typeLabels[applicationType] || applicationType;
    const message = `คุณได้ยื่นใบสมัครสมาชิก${typeLabel}สำเร็จแล้ว เลขที่ใบสมัคร: ${applicationId}`;

    // Build link and metadata per current schema
    const link = `/membership/${applicationType}/${applicationId}`;
    const status = "new"; // or "unread" depending on your convention
    const metadata = JSON.stringify({ applicationId, applicantName, applicantEmail, applicationType });

    // Insert notification into database (match table schema)
    const [result] = await connection.execute(
      `INSERT INTO FTI_Portal_User_Notifications 
       (user_id, type, message, link, status, metadata, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, "membership_application", message, link, status, metadata]
    );

    // Optional: Send email notification if email is provided
    if (applicantEmail) {
      // TODO: Implement email sending logic here
      // For now, just log it
      console.log(`Email notification should be sent to: ${applicantEmail}`);
    }

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      notificationId: result.insertId,
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create notification",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
