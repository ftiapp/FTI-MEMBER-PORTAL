import {
  query,
  beginTransaction,
  executeQuery,
  commitTransaction,
  rollbackTransaction,
} from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

async function getJwt() {
  const mod = await import("jsonwebtoken");
  return mod.default || mod;
}

/**
 * API endpoint to update social media links for a member
 * @route POST /api/member/social-media/update
 * @param {string} memberCode - The member code to update social media for
 * @param {Array} socialMedia - Array of social media items to update
 * @returns {Object} JSON response with updated social media data
 */
export async function POST(request) {
  let connection = null;

  try {
    const body = await request.json();
    const { memberCode, socialMedia, userId: bodyUserId } = body;

    if (!memberCode) {
      return NextResponse.json({ success: false, error: "รหัสสมาชิกไม่ถูกต้อง" }, { status: 400 });
    }

    if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลโซเชียลมีเดียไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // ใช้ user ID จาก body หรือจาก token
    let userId = bodyUserId;

    // ถ้าไม่มี userId จาก body ให้ใช้จาก token
    if (!userId) {
      // Verify user authentication - using await with cookies()
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: "ไม่พบข้อมูลการเข้าสู่ระบบ" },
          { status: 401 },
        );
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        userId = decoded.id;
      } catch (err) {
        console.error("JWT verification error:", err);
        return NextResponse.json(
          { success: false, error: "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง" },
          { status: 401 },
        );
      }
    }

    // ตรวจสอบว่า userId มีอยู่จริงในฐานข้อมูล
    const userCheckQuery = "SELECT id FROM FTI_Portal_User WHERE id = ? LIMIT 1";
    const userCheckResult = await query(userCheckQuery, [userId]);

    if (userCheckResult.length === 0) {
      // ถ้าไม่พบ userId ในฐานข้อมูล ให้ใช้ค่า default
      const defaultUserQuery = "SELECT id FROM FTI_Portal_User ORDER BY id LIMIT 1";
      const defaultUserResult = await query(defaultUserQuery);

      if (defaultUserResult.length === 0) {
        // ถ้าไม่มี user ในระบบเลย ให้แจ้งเตือน
        console.error("No FTI_Portal_User found in the database");
      } else {
        // ใช้ user แรกในฐานข้อมูล
        userId = defaultUserResult[0].id;
        console.log(`Using default user ID: ${userId}`);
      }
    }

    // Check if the FTI_Original_Membership_Member_Social_Media table exists, create if it doesn't
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS FTI_Original_Membership_Member_Social_Media (
          id int(11) NOT NULL AUTO_INCREMENT,
          member_code varchar(20) NOT NULL COMMENT 'รหัสสมาชิก',
          platform varchar(50) NOT NULL COMMENT 'ชื่อแพลตฟอร์ม เช่น Facebook, Line, YouTube',
          url text NOT NULL COMMENT 'URL หรือ username ของโซเชียลมีเดีย',
          display_name varchar(255) DEFAULT NULL COMMENT 'ชื่อที่แสดงของโซเชียลมีเดีย',
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY member_code_idx (member_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (err) {
      console.error("Error creating FTI_Original_Membership_Member_Social_Media table:", err);
      // Continue anyway, the table might already exist
    }

    // Start transaction
    connection = await beginTransaction();

    // Delete existing social media entries for this member
    await executeQuery(
      connection,
      "DELETE FROM FTI_Original_Membership_Member_Social_Media WHERE member_code = ?",
      [memberCode],
    );

    // Insert new social media entries
    const insertPromises = socialMedia.map((item) => {
      if (!item.platform || !item.url) return null;

      return executeQuery(
        connection,
        "INSERT INTO FTI_Original_Membership_Member_Social_Media (member_code, platform, url, display_name) VALUES (?, ?, ?, ?)",
        [memberCode, item.platform, item.url, item.display_name || null],
      );
    });

    // Filter out null promises and execute all valid ones
    await Promise.all(insertPromises.filter((p) => p !== null));

    // Log the action in FTI_Portal_User_Logs
    try {
      // Determine the action type based on what happened
      let action = "social_media_update";
      let details = "";

      // Get existing social media entries before deletion
      const existingEntries = await executeQuery(
        connection,
        "SELECT id, platform FROM FTI_Original_Membership_Member_Social_Media WHERE member_code = ?",
        [memberCode],
      );

      // Check if this is a new addition or update
      if (existingEntries.length === 0 && socialMedia.length > 0) {
        action = "social_media_add";
        details = `Added ${socialMedia.length} social media platforms for member ${memberCode}`;
      }
      // Check if this is a deletion
      else if (existingEntries.length > 0 && socialMedia.length === 0) {
        action = "social_media_delete";
        details = `Deleted all social media platforms for member ${memberCode}`;
      }
      // Otherwise it's an update
      else {
        details = `Updated social media platforms for member ${memberCode}. `;
        details += `Previous: ${existingEntries.length}, New: ${socialMedia.length}`;
      }

      // Get client IP and user agent from headers
      const forwardedFor = request.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Unknown";

      // Implement robust user ID fallback mechanism
      let validUserId = userId;

      // If userId is null or undefined, try to find a valid user ID
      if (!validUserId) {
        console.log("User ID from token is null or invalid, attempting to find a fallback user ID");

        try {
          // First try to find if the provided user ID exists in the database
          const userCheck = await executeQuery(
            connection,
            "SELECT id FROM FTI_Portal_User WHERE id = ? LIMIT 1",
            [userId],
          );

          if (userCheck.length > 0) {
            validUserId = userCheck[0].id;
          } else {
            // Try to find an admin user
            const adminUser = await executeQuery(
              connection,
              'SELECT id FROM FTI_Portal_User WHERE role = "admin" AND status = "active" LIMIT 1',
            );

            if (adminUser.length > 0) {
              validUserId = adminUser[0].id;
              console.log("Using admin user ID as fallback:", validUserId);
            } else {
              // Try to find any active user
              const anyUser = await executeQuery(
                connection,
                'SELECT id FROM FTI_Portal_User WHERE status = "active" LIMIT 1',
              );

              if (anyUser.length > 0) {
                validUserId = anyUser[0].id;
                console.log("Using active user ID as fallback:", validUserId);
              } else {
                // Last resort: use user ID 1 without verification
                validUserId = 1;
                console.log("Using system user ID (1) as fallback without verification");
              }
            }
          }
        } catch (error) {
          console.error("Error finding fallback user ID:", error);
          // If all else fails, use 1 as the user ID
          validUserId = 1;
          console.log("Using default user ID (1) after error");
        }
      }

      // Insert log entry with the valid user ID
      await executeQuery(
        connection,
        `INSERT INTO FTI_Portal_User_Logs 
         (user_id, action, details, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [validUserId, action, details, ip, userAgent],
      );
    } catch (err) {
      console.error("Error logging action to FTI_Portal_User_Logs:", err);
      // Continue anyway, this is not critical
    }

    // Commit transaction
    await commitTransaction(connection);
    connection = null;

    // Fetch the updated social media data
    const updatedData = await query(
      "SELECT id, member_code, platform, url, display_name, created_at, updated_at FROM FTI_Original_Membership_Member_Social_Media WHERE member_code = ?",
      [memberCode],
    );

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Error updating social media data:", error);

    // Rollback transaction if it was started
    if (connection) {
      await rollbackTransaction(connection);
    }

    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลโซเชียลมีเดีย" },
      { status: 500 },
    );
  }
}
