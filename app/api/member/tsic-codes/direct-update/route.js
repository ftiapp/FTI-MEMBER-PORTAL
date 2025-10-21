import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * API endpoint to directly update TSIC codes without admin approval
 * This endpoint bypasses the FTI_Original_Membership_Pending_Tsic_Updates table and writes directly to FTI_Original_Membership_Member_Tsic_Codes
 */
export async function POST(request) {
  try {
    // Get the request data
    const requestData = await request.json();
    console.log("Direct TSIC update request received:", {
      memberCode: requestData.memberCode,
      tsicCodesCount: requestData.tsicCodes ? requestData.tsicCodes.length : 0,
    });

    const { tsicCodes, memberCode, userId: bodyUserId } = requestData;

    // Validate input
    if (!Array.isArray(tsicCodes) || tsicCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุรหัส TSIC อย่างน้อย 1 รหัส" },
        { status: 400 },
      );
    }

    if (!memberCode) {
      return NextResponse.json({ success: false, message: "กรุณาระบุรหัสสมาชิก" }, { status: 400 });
    }

    // Get user ID from token or request body
    let userId = null;

    // Try to get user ID from token
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("token");
    const token = tokenCookie?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        userId = decoded.userId;
        console.log("Got user ID from token:", userId);
      } catch (error) {
        console.error("Token verification failed:", error.message);
      }
    }

    // If no user ID from token, try to use the one from request body
    if (!userId && bodyUserId) {
      userId = bodyUserId;
      console.log("Using user ID from request body:", userId);
    }

    // If still no user ID, return error
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 },
      );
    }

    // Validate user ID
    const userResult = await query("SELECT id, email FROM FTI_Portal_User WHERE id = ?", [userId]);

    if (!userResult || userResult.length === 0) {
      // Try to find an admin user as fallback
      const adminResult = await query(
        "SELECT id, email FROM FTI_Portal_User WHERE is_admin = 1 LIMIT 1",
      );

      if (adminResult && adminResult.length > 0) {
        userId = adminResult[0].id;
        console.log(`Using admin user (ID: ${userId}) as fallback`);
      } else {
        // Last resort: try user ID 1 (system user)
        const systemUserResult = await query("SELECT id FROM FTI_Portal_User WHERE id = 1 LIMIT 1");

        if (systemUserResult && systemUserResult.length > 0) {
          userId = 1;
          console.log("Using system user (ID: 1) as fallback");
        } else {
          return NextResponse.json(
            { success: false, message: "ไม่พบข้อมูลผู้ใช้ที่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ" },
            { status: 404 },
          );
        }
      }
    }

    // Start transaction
    await query("START TRANSACTION");

    try {
      // ตรวจสอบว่ามีรหัส TSIC ที่ถูกต้องหรือไม่
      const validTsicCodes = tsicCodes.filter((code) => code && code.tsic_code);

      if (validTsicCodes.length === 0) {
        throw new Error("No valid TSIC codes provided");
      }

      // ลบข้อมูลเดิมทั้งหมดก่อนบันทึกข้อมูลใหม่
      console.log(`Deleting all existing TSIC codes for member: ${memberCode}`);
      const deleteQuery = `
        DELETE FROM FTI_Original_Membership_Member_Tsic_Codes 
        WHERE member_code = ?
      `;

      await query(deleteQuery, [memberCode]);
      console.log("Deleted existing TSIC codes successfully");

      // เตรียมข้อมูลสำหรับการบันทึก
      console.log(`Inserting ${validTsicCodes.length} new TSIC codes for member: ${memberCode}`);

      // บันทึกข้อมูลใหม่
      const insertValues = validTsicCodes
        .map(
          (code) =>
            `(${userId}, '${memberCode}', '${code.category_code || "00"}', '${code.tsic_code}', 1, NOW(), NOW())`,
        )
        .join(",");

      const insertQuery = `
        INSERT INTO FTI_Original_Membership_Member_Tsic_Codes 
        (user_id, member_code, category_code, tsic_code, status, created_at, updated_at) 
        VALUES ${insertValues}
      `;

      console.log("Executing insert query...");
      await query(insertQuery);

      // Log the action
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await query(
        `INSERT INTO FTI_Portal_User_Logs 
        (user_id, action, details, ip_address, user_agent, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          "tsic_code_update",
          `User updated TSIC codes for member ${memberCode} with ${validTsicCodes.length} codes`,
          ipAddress,
          userAgent,
        ],
      );

      await query("COMMIT");

      return NextResponse.json({
        success: true,
        message: `บันทึกรหัส TSIC จำนวน ${validTsicCodes.length} รายการเรียบร้อยแล้ว`,
        data: {
          total: validTsicCodes.length,
        },
      });
    } catch (error) {
      console.error("Error in TSIC direct update:", error);
      await query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error processing TSIC direct update request:", error);

    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการประมวลผลคำขอ" },
      { status: 500 },
    );
  }
}
