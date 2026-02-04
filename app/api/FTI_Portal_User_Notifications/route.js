import { NextResponse } from "next/server";
import { getPool } from "@/app/lib/db";

/**
 * API Route: Get user notifications
 * GET /api/FTI_Portal_User_Notifications?userId={userId}
 */
export async function GET(request) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId parameter" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    connection = await pool.getConnection();

    // Fetch notifications for the user
    const [notifications] = await connection.execute(
      `SELECT id, user_id, type, message, link, status, metadata, created_at, updated_at, read_at
       FROM FTI_Portal_User_Notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId],
    );

    return NextResponse.json({
      success: true,
      FTI_Portal_User_Notifications: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
