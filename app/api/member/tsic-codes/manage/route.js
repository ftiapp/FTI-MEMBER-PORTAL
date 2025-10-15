import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * Handle POST requests to manage TSIC codes (add, update, delete)
 */
export async function POST(request) {
  try {
    // Get JWT token from cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("Processing TSIC update request, token exists:", !!token);

    // อ่าน request body เพียงครั้งเดียวและเก็บไว้ในตัวแปร
    const requestData = await request.json();
    console.log("Request data received:", {
      ...requestData,
      tsicCodes: requestData.tsicCodes ? `${requestData.tsicCodes.length} items` : "none",
    });

    const {
      action,
      memberCode,
      categoryCode,
      tsicCode,
      status,
      userId: bodyUserId,
      tsicCodes,
    } = requestData;

    // ตรวจสอบ token และ userId จากทั้ง token และ request body
    let userId = null;
    let tokenValid = false;

    // ถ้ามี token ให้ตรวจสอบความถูกต้อง
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        userId = decoded.userId;
        tokenValid = true;
        console.log("Token is valid, user ID from token:", userId);
      } catch (error) {
        console.error("Token verification failed:", error.message);
        // Token ไม่ถูกต้อง แต่ยังไม่ return error เพราะจะลองดูว่ามี userId ใน request body หรือไม่
      }
    }

    // ถ้า token ไม่ถูกต้อง ให้ตรวจสอบว่ามี userId ใน request body หรือไม่
    if (!tokenValid) {
      console.log("Token invalid, checking user ID from request body:", bodyUserId);

      if (bodyUserId) {
        userId = bodyUserId;
      } else {
        // ไม่มีทั้ง token ที่ถูกต้องและ userId ใน request body
        console.error("Authentication failed: No valid token and no userId in request body");
        return NextResponse.json(
          { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
          { status: 401 },
        );
      }
    }

    // Validate required fields
    if (!memberCode) {
      return NextResponse.json({ success: false, message: "กรุณาระบุรหัสสมาชิก" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุการกระทำ (add, update, delete)" },
        { status: 400 },
      );
    }

    // Validate user ID and implement fallback mechanism
    let validUserId = userId;
    let userEmail = "";

    // Try to find the user with the provided ID
    const userResult = await query("SELECT id, email FROM FTI_Portal_User WHERE id = ?", [userId]);

    if (!userResult || userResult.length === 0) {
      console.log(`User ID ${userId} not found, looking for fallback...`);

      // Try to find an admin user as fallback
      const adminResult = await query("SELECT id, email FROM FTI_Portal_User WHERE is_admin = 1 LIMIT 1");

      if (adminResult && adminResult.length > 0) {
        validUserId = adminResult[0].id;
        userEmail = adminResult[0].email;
        console.log(`Using admin user (ID: ${validUserId}) as fallback`);
      } else {
        // Try to find any active user as fallback
        const anyUserResult = await query("SELECT id, email FROM FTI_Portal_User WHERE active = 1 LIMIT 1");

        if (anyUserResult && anyUserResult.length > 0) {
          validUserId = anyUserResult[0].id;
          userEmail = anyUserResult[0].email;
          console.log(`Using active user (ID: ${validUserId}) as fallback`);
        } else {
          // Last resort: try user ID 1 (system user)
          const systemUserResult = await query("SELECT id, email FROM FTI_Portal_User WHERE id = 1 LIMIT 1");

          if (systemUserResult && systemUserResult.length > 0) {
            validUserId = 1;
            userEmail = systemUserResult[0].email;
            console.log(`Using system user (ID: 1) as fallback`);
          } else {
            return NextResponse.json(
              { success: false, message: "ไม่พบข้อมูลผู้ใช้ที่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ" },
              { status: 404 },
            );
          }
        }
      }
    } else {
      userEmail = userResult[0].email;
    }

    // Get client info for logging
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Process based on action type
    switch (action) {
      case "add_multiple":
        // Validate required fields for adding multiple codes
        if (!Array.isArray(tsicCodes) || tsicCodes.length === 0) {
          console.error("No TSIC codes provided in request data");
          return NextResponse.json(
            { success: false, message: "กรุณาระบุรหัส TSIC อย่างน้อย 1 รหัส" },
            { status: 400 },
          );
        }

        console.log("Processing TSIC codes:", tsicCodes.length, "items");

        const results = { success: [], failed: [] };

        // Use a transaction to ensure all or nothing
        await query("START TRANSACTION");

        try {
          // Check for existing codes to avoid duplicates
          let existingCodes = [];

          try {
            // Make sure all TSIC codes are valid
            const validTsicCodes = tsicCodes.filter((code) => code && code.tsic_code);

            if (validTsicCodes.length === 0) {
              throw new Error("No valid TSIC codes provided");
            }

            const placeholders = validTsicCodes.map(() => "?").join(",");

            const existingCodesQuery = `
              SELECT tsic_code FROM FTI_Original_Membership_Member_Tsic_Codes 
              WHERE member_code = ? AND tsic_code IN (${placeholders})
            `;

            const existingCodesParams = [
              memberCode,
              ...validTsicCodes.map((code) => code.tsic_code),
            ];
            console.log("Checking existing codes with query:", existingCodesQuery);
            console.log("Parameters:", existingCodesParams);

            existingCodes = await query(existingCodesQuery, existingCodesParams);
          } catch (error) {
            console.error("Error checking existing codes:", error);
            existingCodes = [];
          }

          // Create a set of existing codes for quick lookup
          const existingCodeSet = new Set(existingCodes.map((row) => row.tsic_code));
          console.log("Existing TSIC codes:", Array.from(existingCodeSet));

          // Filter out existing codes and invalid codes
          const newCodes = tsicCodes.filter((code) => {
            if (!code || !code.tsic_code) {
              console.warn("Invalid TSIC code object:", code);
              return false;
            }
            return !existingCodeSet.has(code.tsic_code);
          });

          console.log("New TSIC codes to insert:", newCodes);

          if (newCodes.length === 0) {
            await query("ROLLBACK");
            return NextResponse.json(
              { success: false, message: "รหัส TSIC ทั้งหมดมีอยู่แล้วสำหรับสมาชิกนี้" },
              { status: 400 },
            );
          }

          // Prepare bulk insert
          try {
            // Ensure all required fields are present
            const validNewCodes = newCodes.filter(
              (code) => code && code.category_code && code.tsic_code,
            );

            if (validNewCodes.length === 0) {
              throw new Error("No valid TSIC codes to insert");
            }

            const insertValues = validNewCodes
              .map(
                (code) =>
                  `(${validUserId}, '${memberCode}', '${code.category_code}', '${code.tsic_code}', 1, NOW(), NOW())`,
              )
              .join(",");

            const insertQuery = `
              INSERT INTO FTI_Original_Membership_Member_Tsic_Codes 
              (user_id, member_code, category_code, tsic_code, status, created_at, updated_at) 
              VALUES ${insertValues}
            `;

            console.log("Executing insert query:", insertQuery);
            await query(insertQuery);
            console.log("Successfully inserted TSIC codes");
          } catch (error) {
            console.error("Error inserting TSIC codes:", error);
            throw error;
          }

          // Log the action
          const logDetails = `User ${userEmail} added ${newCodes.length} TSIC codes for member ${memberCode}: ${newCodes.map((c) => c.tsic_code).join(", ")}`;

          await query(
            `INSERT INTO FTI_Portal_User_Logs 
            (user_id, action, details, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [validUserId, "tsic_code_update", logDetails, ipAddress, userAgent],
          );

          await query("COMMIT");

          return NextResponse.json({
            success: true,
            message: `เพิ่มรหัส TSIC จำนวน ${newCodes.length} รายการเรียบร้อยแล้ว${existingCodeSet.size > 0 ? ` (มี ${existingCodeSet.size} รายการที่มีอยู่แล้ว)` : ""}`,
            data: {
              added: newCodes.length,
              existing: existingCodeSet.size,
              total: tsicCodes.length,
            },
          });
        } catch (error) {
          await query("ROLLBACK");
          throw error;
        }

      case "add":
        // Validate required fields for add
        if (!categoryCode || !tsicCode) {
          return NextResponse.json(
            { success: false, message: "กรุณาระบุรหัสหมวดหมู่และรหัส TSIC" },
            { status: 400 },
          );
        }

        // Check if the TSIC code already exists for this member
        const existingCode = await query(
          "SELECT id FROM FTI_Original_Membership_Member_Tsic_Codes WHERE member_code = ? AND tsic_code = ?",
          [memberCode, tsicCode],
        );

        if (existingCode && existingCode.length > 0) {
          return NextResponse.json(
            { success: false, message: "รหัส TSIC นี้มีอยู่แล้วสำหรับสมาชิกนี้" },
            { status: 400 },
          );
        }

        // Add new TSIC code
        await query(
          `INSERT INTO FTI_Original_Membership_Member_Tsic_Codes 
          (user_id, member_code, category_code, tsic_code, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [validUserId, memberCode, categoryCode, tsicCode, status !== undefined ? status : 1],
        );

        // Log the action
        await query(
          `INSERT INTO FTI_Portal_User_Logs 
          (user_id, action, details, ip_address, user_agent, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            userId,
            "tsic_code_update",
            `User ${userEmail} added TSIC code ${tsicCode} (category: ${categoryCode}) for member ${memberCode}`,
            ipAddress,
            userAgent,
          ],
        );

        return NextResponse.json({
          success: true,
          message: "เพิ่มรหัส TSIC เรียบร้อยแล้ว",
          data: { action: "add", tsicCode, categoryCode },
        });

      case "update":
        // Validate required fields for update
        if (!tsicCode) {
          return NextResponse.json(
            { success: false, message: "กรุณาระบุรหัส TSIC" },
            { status: 400 },
          );
        }

        if (status === undefined) {
          return NextResponse.json({ success: false, message: "กรุณาระบุสถานะ" }, { status: 400 });
        }

        // Check if the TSIC code exists
        const codeToUpdate = await query(
          "SELECT id FROM FTI_Original_Membership_Member_Tsic_Codes WHERE member_code = ? AND tsic_code = ?",
          [memberCode, tsicCode],
        );

        if (!codeToUpdate || codeToUpdate.length === 0) {
          return NextResponse.json(
            { success: false, message: "ไม่พบรหัส TSIC นี้สำหรับสมาชิกนี้" },
            { status: 404 },
          );
        }

        // Update TSIC code status
        await query(
          "UPDATE FTI_Original_Membership_Member_Tsic_Codes SET status = ?, updated_at = NOW() WHERE member_code = ? AND tsic_code = ?",
          [status, memberCode, tsicCode],
        );

        // Log the action
        await query(
          `INSERT INTO FTI_Portal_User_Logs 
          (user_id, action, details, ip_address, user_agent, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            userId,
            "tsic_code_update",
            `User ${userEmail} updated TSIC code ${tsicCode} status to ${status ? "active" : "inactive"} for member ${memberCode}`,
            ipAddress,
            userAgent,
          ],
        );

        return NextResponse.json({
          success: true,
          message: "อัปเดตสถานะรหัส TSIC เรียบร้อยแล้ว",
          data: { action: "update", tsicCode, status },
        });

      case "delete":
        // Validate required fields for delete
        if (!tsicCode) {
          return NextResponse.json(
            { success: false, message: "กรุณาระบุรหัส TSIC" },
            { status: 400 },
          );
        }

        // Check if the TSIC code exists
        const codeToDelete = await query(
          "SELECT id FROM FTI_Original_Membership_Member_Tsic_Codes WHERE member_code = ? AND tsic_code = ?",
          [memberCode, tsicCode],
        );

        if (!codeToDelete || codeToDelete.length === 0) {
          return NextResponse.json(
            { success: false, message: "ไม่พบรหัส TSIC นี้สำหรับสมาชิกนี้" },
            { status: 404 },
          );
        }

        // Delete TSIC code
        await query("DELETE FROM FTI_Original_Membership_Member_Tsic_Codes WHERE member_code = ? AND tsic_code = ?", [
          memberCode,
          tsicCode,
        ]);

        // Log the action
        await query(
          `INSERT INTO FTI_Portal_User_Logs 
          (user_id, action, details, ip_address, user_agent, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            userId,
            "tsic_code_update",
            `User ${userEmail} deleted TSIC code ${tsicCode} for member ${memberCode}`,
            ipAddress,
            userAgent,
          ],
        );

        return NextResponse.json({
          success: true,
          message: "ลบรหัส TSIC เรียบร้อยแล้ว",
          data: { action: "delete", tsicCode },
        });

      default:
        return NextResponse.json(
          { success: false, message: "การกระทำไม่ถูกต้อง กรุณาระบุ add, update, หรือ delete" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error managing TSIC codes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการจัดการรหัส TSIC กรุณาลองใหม่อีกครั้ง",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
