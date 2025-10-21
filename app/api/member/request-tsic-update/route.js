import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function POST(request) {
  try {
    // Get the request body
    const { selectedTsicCodes, memberCode, userId } = await request.json();

    // Basic validation
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 },
      );
    }

    // Validate input
    if (!Array.isArray(selectedTsicCodes) || selectedTsicCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: "No TSIC codes provided" },
        { status: 400 },
      );
    }

    if (!memberCode) {
      return NextResponse.json(
        { success: false, message: "Member code is required" },
        { status: 400 },
      );
    }

    // Get user's email for logging
    const userData = await query("SELECT email FROM FTI_Portal_User WHERE id = ?", [userId]);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const userEmail = userData[0].email;

    // Check for existing pending requests for this member
    const existingRequests = await query(
      "SELECT id FROM FTI_Original_Membership_Pending_Tsic_Updates WHERE member_code = ? AND status = ?",
      [memberCode, "pending"],
    );

    // If there are existing pending requests, delete them
    if (existingRequests && existingRequests.length > 0) {
      await query(
        "DELETE FROM FTI_Original_Membership_Pending_Tsic_Updates WHERE member_code = ? AND status = ?",
        [memberCode, "pending"],
      );

      // Log the deletion of previous requests
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await query(
        `INSERT INTO FTI_Portal_User_Logs 
        (user_id, action, details, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          "tsic_update_request_replace",
          `User replaced pending TSIC update request for member ${memberCode}`,
          ipAddress,
          userAgent,
        ],
      );
    }

    // Prepare TSIC data for storage
    const tsicData = JSON.stringify({
      selectedTsicCodes,
      requestedAt: new Date().toISOString(),
    });

    // Insert into FTI_Original_Membership_Pending_Tsic_Updates table
    const insertQuery = `
      INSERT INTO FTI_Original_Membership_Pending_Tsic_Updates 
      (user_id, member_code, tsic_data, status, request_date, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', NOW(), NOW(), NOW())
    `;

    await query(insertQuery, [userId, memberCode, tsicData]);

    // Log the action
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await query(
      `INSERT INTO FTI_Portal_User_Logs 
      (user_id, action, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        "tsic_update_request",
        `User ${userEmail} (${memberCode}) requested to update TSIC codes: ${selectedTsicCodes.join(", ")}`,
        ipAddress,
        userAgent,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "ส่งคำขอแก้ไขรหัส TSIC เรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ",
      data: {
        codesAdded: selectedTsicCodes.length,
      },
    });
  } catch (error) {
    console.error("Error in TSIC update request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
