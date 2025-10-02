import { NextResponse } from "next/server";
import { query } from "../../lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "../../lib/token";

/**
 * API endpoint สำหรับบันทึกข้อมูลเอกสารที่อัปโหลดตรงไปยัง Cloudinary
 * @param {Request} request - คำขอ HTTP
 * @returns {Promise<NextResponse>} - การตอบกลับ HTTP
 */
export async function POST(request) {
  try {
    // ดึงข้อมูลจาก request body
    const { url, public_id, fileName, fileSize, fileType, userId, documentType } =
      await request.json();

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!url || !public_id || !fileName || !documentType) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลไม่ครบถ้วน กรุณาระบุ url, public_id, fileName และ documentType",
        },
        { status: 400 },
      );
    }

    // ตรวจสอบ userId จาก request หรือ token
    let userIdToUse = userId;

    if (!userIdToUse) {
      // ถ้าไม่มี userId ในคำขอ ให้ดึงจาก token
      const cookieStore = cookies();
      const token = cookieStore.get("token")?.value;

      if (token) {
        try {
          const decoded = await verifyToken(token);
          userIdToUse = decoded.userId;
        } catch (error) {
          console.error("Token verification failed:", error);
        }
      }
    }

    // ตรวจสอบว่า user มีอยู่จริงหรือไม่
    if (userIdToUse) {
      const userResult = await query("SELECT id FROM users WHERE id = ? LIMIT 1", [userIdToUse]);
      if (userResult.length === 0) {
        // ถ้าไม่พบ user ให้ใช้ fallback เป็น admin หรือ user คนแรก
        const fallbackUserResult = await query(
          'SELECT id FROM users WHERE role = "admin" OR id = 1 LIMIT 1',
        );

        if (fallbackUserResult.length > 0) {
          userIdToUse = fallbackUserResult[0].id;
        } else {
          // ถ้าไม่มี user ในระบบเลย ให้ข้ามการบันทึก log
          userIdToUse = null;
        }
      }
    }

    // บันทึกข้อมูลเอกสารลงในตาราง documents
    const insertResult = await query(
      `INSERT INTO documents (
        user_id, 
        cloudinary_url, 
        cloudinary_id, 
        file_name, 
        file_size, 
        mime_type, 
        document_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userIdToUse, url, public_id, fileName, fileSize || null, fileType || null, documentType],
    );

    // บันทึก log การอัปโหลดเอกสาร
    if (userIdToUse) {
      await query(
        `INSERT INTO Member_portal_User_log (
          user_id, 
          action_type, 
          action_detail, 
          action_status
        ) VALUES (?, ?, ?, ?)`,
        [
          userIdToUse,
          "upload_document",
          JSON.stringify({
            document_type: documentType,
            file_name: fileName,
            cloudinary_id: public_id,
          }),
          "success",
        ],
      );
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเอกสารสำเร็จ",
      documentId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error in save-document API:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในการบันทึกข้อมูลเอกสาร: ${error.message || "ไม่ทราบสาเหตุ"}`,
      },
      { status: 500 },
    );
  }
}
