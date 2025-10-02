import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ไม่พบ ID ผู้ใช้" }, { status: 400 });
    }

    // Check for pending profile update requests
    const pendingRequests = await query(
      `SELECT id, status, reject_reason, created_at 
       FROM profile_update_requests 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId],
    );

    if (pendingRequests.length === 0) {
      return NextResponse.json({ status: null });
    }

    const updateRequest = pendingRequests[0];

    return NextResponse.json({
      status: {
        id: updateRequest.id,
        status: updateRequest.status,
        reason: updateRequest.reject_reason,
        created_at: updateRequest.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching profile update status:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงสถานะการอัพเดตโปรไฟล์" },
      { status: 500 },
    );
  }
}
