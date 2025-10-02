import { NextResponse } from "next/server";
import {
  query,
  beginTransaction,
  executeQuery,
  commitTransaction,
  rollbackTransaction,
} from "../../../../lib/db";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../../lib/cloudinary";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

/**
 * API endpoint to upload company logo
 * @route POST /api/member/logo/upload
 */
export async function POST(request) {
  let connection = null;

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const memberCode = formData.get("memberCode");
    const displayMode = formData.get("displayMode") || "circle";
    const existingId = formData.get("existingId");
    const bodyUserId = formData.get("userId");

    // Validate required fields
    if (!file) {
      return NextResponse.json({ success: false, message: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
    }

    if (!memberCode) {
      return NextResponse.json({ success: false, message: "ไม่พบรหัสสมาชิก" }, { status: 400 });
    }

    // ใช้ user ID จาก form data หรือจาก token
    let userId = bodyUserId;

    // ถ้าไม่มี userId จาก form data ให้ใช้จาก token
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

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;

    // Validate file type (only allow images)
    const fileExt = fileName.split(".").pop().toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG, GIF, WebP)",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "ขนาดไฟล์ต้องไม่เกิน 5MB",
        },
        { status: 400 },
      );
    }

    // Log file details for debugging
    console.log(
      `Uploading logo: ${fileName}, size: ${fileBuffer.length} bytes, member: ${memberCode}`,
    );

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(fileBuffer, fileName, "company_logos");

    // Check if upload was successful
    if (!uploadResult.success) {
      console.error("Cloudinary upload failed:", uploadResult.error);
      return NextResponse.json(
        {
          success: false,
          message: `เกิดข้อผิดพลาดในการอัปโหลดโลโก้: ${uploadResult.error || "ไม่ทราบสาเหตุ"}`,
        },
        { status: 500 },
      );
    }

    if (!uploadResult.url) {
      console.error("Cloudinary upload missing URL:", uploadResult);
      return NextResponse.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการอัปโหลดโลโก้: ไม่ได้รับ URL จาก Cloudinary",
        },
        { status: 500 },
      );
    }

    // Start transaction
    connection = await beginTransaction();

    // Check if there's an existing logo for this member
    const existingLogo = await executeQuery(
      connection,
      "SELECT id, public_id FROM company_logos WHERE member_code = ?",
      [memberCode],
    );

    // Always delete the existing logo from Cloudinary when uploading a new one
    if (existingLogo.length > 0) {
      try {
        // Only attempt to delete if there's a valid public_id
        if (existingLogo[0].public_id) {
          await deleteFromCloudinary(existingLogo[0].public_id);
          console.log(`Deleted existing logo: ${existingLogo[0].public_id}`);
        }
      } catch (deleteErr) {
        console.error("Error deleting existing logo from Cloudinary:", deleteErr);
        // Continue anyway, this is not critical
      }
    }

    // Insert or update logo data in database
    if (existingLogo.length > 0) {
      await executeQuery(
        connection,
        "UPDATE company_logos SET logo_url = ?, public_id = ?, display_mode = ?, updated_at = NOW() WHERE member_code = ?",
        [uploadResult.url, uploadResult.public_id, displayMode, memberCode],
      );
    } else {
      await executeQuery(
        connection,
        "INSERT INTO company_logos (member_code, logo_url, public_id, display_mode) VALUES (?, ?, ?, ?)",
        [memberCode, uploadResult.url, uploadResult.public_id, displayMode],
      );
    }

    // Log the action in Member_portal_User_log
    try {
      // Get client IP and user agent from headers
      const forwardedFor = request.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Unknown";

      const action = existingLogo.length > 0 ? "logo_update" : "logo_add";
      const details =
        existingLogo.length > 0
          ? `Updated company logo for member ${memberCode}`
          : `Added company logo for member ${memberCode}`;

      // ตรวจสอบว่า userId มีอยู่จริงในฐานข้อมูล
      const userCheckQuery = await executeQuery(
        connection,
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [userId],
      );

      let validUserId;

      if (userCheckQuery.length > 0) {
        // ใช้ userId ที่มีอยู่จริง
        validUserId = userCheckQuery[0].id;
      } else {
        // ถ้าไม่พบ userId ในฐานข้อมูล ให้หา user อื่นแทน
        console.log("User ID not found in database, searching for alternative user");

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
        [validUserId, action, details, ip, userAgent],
      );
    } catch (err) {
      console.error("Error logging action to Member_portal_User_log:", err);
      // Continue anyway, this is not critical
    }

    // Commit transaction
    await commitTransaction(connection);
    connection = null;

    // Fetch the updated logo data
    const updatedLogo = await query(
      "SELECT id, member_code, logo_url, public_id, display_mode, created_at, updated_at FROM company_logos WHERE member_code = ?",
      [memberCode],
    );

    // Log success
    console.log(`Logo uploaded successfully to Cloudinary: ${uploadResult.url}`);

    return NextResponse.json({
      success: true,
      data: updatedLogo[0],
      message: "อัปโหลดโลโก้สำเร็จ",
    });
  } catch (error) {
    console.error("Error in logo upload API:", error);

    // Rollback transaction if it was started
    if (connection) {
      await rollbackTransaction(connection);
    }

    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในการอัปโหลดโลโก้: ${error.message || "ไม่ทราบสาเหตุ"}`,
      },
      { status: 500 },
    );
  }
}
