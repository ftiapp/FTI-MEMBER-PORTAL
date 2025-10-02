import { NextResponse } from "next/server";
import {
  query,
  beginTransaction,
  executeQuery,
  commitTransaction,
  rollbackTransaction,
} from "@/app/lib/db";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * API endpoint to delete a company logo
 * @route DELETE /api/member/logo/delete
 */
export async function DELETE(request) {
  let connection = null;

  try {
    const { searchParams } = new URL(request.url);
    const logoId = searchParams.get("id");
    const bodyUserId = searchParams.get("userId");

    if (!logoId) {
      return NextResponse.json({ success: false, message: "ไม่ได้ระบุ ID โลโก้" }, { status: 400 });
    }

    // ใช้ user ID จาก query parameter หรือจาก token
    let userId = bodyUserId;

    // ถ้าไม่มี userId จาก query parameter ให้ใช้จาก token
    if (!userId) {
      // Verify user authentication - using await with cookies()
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "ไม่พบข้อมูลการเข้าสู่ระบบ" },
          { status: 401 },
        );
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        userId = decoded.id;
      } catch (err) {
        console.error("JWT verification error:", err);
        return NextResponse.json(
          { success: false, message: "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง" },
          { status: 401 },
        );
      }
    }

    // Start transaction
    connection = await beginTransaction();

    // Get logo information before deleting
    const logoResult = await executeQuery(
      connection,
      "SELECT member_code, public_id FROM company_logos WHERE id = ?",
      [logoId],
    );

    if (logoResult.length === 0) {
      await rollbackTransaction(connection);
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลโลโก้ที่ต้องการลบ" },
        { status: 404 },
      );
    }

    const { member_code, public_id } = logoResult[0];

    // Delete file from Cloudinary
    if (public_id) {
      try {
        const deleteResult = await deleteFromCloudinary(public_id);
        console.log("Cloudinary delete result:", deleteResult);
      } catch (cloudinaryError) {
        console.error("Error deleting logo from Cloudinary:", cloudinaryError);
        // Continue anyway, we still want to delete the database record
      }
    }

    // Delete logo record from database
    await executeQuery(connection, "DELETE FROM company_logos WHERE id = ?", [logoId]);

    // Log the action in Member_portal_User_log
    try {
      // Get client IP and user agent from headers
      const forwardedFor = request.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Unknown";

      let validUserId = null;

      if (userId != null) {
        // ตรวจสอบว่า userId มีอยู่จริงในฐานข้อมูล (เฉพาะเมื่อ userId มีค่า)
        const userCheckQuery = await executeQuery(
          connection,
          "SELECT id FROM users WHERE id = ? LIMIT 1",
          [userId],
        );

        if (userCheckQuery.length > 0) {
          validUserId = userCheckQuery[0].id;
        }
      }

      if (validUserId == null) {
        // ถ้าไม่พบหรือไม่มี userId ให้หา user อื่นแทนโดยไม่ส่ง undefined เข้า bind params
        console.log("User ID missing/invalid, searching for fallback user");

        // ค้นหา user ที่เป็น admin
        const adminUserQuery = await executeQuery(
          connection,
          'SELECT id FROM users WHERE role = "admin" LIMIT 1',
        );

        if (adminUserQuery.length > 0) {
          validUserId = adminUserQuery[0].id;
          console.log(`Using admin user ID: ${validUserId}`);
        } else {
          // ค้นหา user คนแรกในระบบ
          const anyUserQuery = await executeQuery(
            connection,
            "SELECT id FROM users ORDER BY id LIMIT 1",
          );

          if (anyUserQuery.length > 0) {
            validUserId = anyUserQuery[0].id;
            console.log(`Using first available user ID: ${validUserId}`);
          } else {
            // ถ้าไม่มี user ในระบบเลย ให้ข้ามการบันทึก log
            console.error("No users found in database, skipping log entry");
            throw new Error("No users found in database");
          }
        }
      }

      await executeQuery(
        connection,
        `INSERT INTO Member_portal_User_log 
         (user_id, action, details, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          validUserId,
          "logo_delete",
          `Deleted company logo for member ${member_code}`,
          ip,
          userAgent,
        ],
      );
    } catch (err) {
      console.error("Error logging action to Member_portal_User_log:", err);
      // Continue anyway, this is not critical
    }

    // Commit transaction
    await commitTransaction(connection);
    connection = null;

    return NextResponse.json({
      success: true,
      message: "ลบโลโก้สำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting logo:", error);

    // Rollback transaction if it was started
    if (connection) {
      await rollbackTransaction(connection);
    }

    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในการลบโลโก้: ${error.message || "ไม่ทราบสาเหตุ"}`,
      },
      { status: 500 },
    );
  }
}
