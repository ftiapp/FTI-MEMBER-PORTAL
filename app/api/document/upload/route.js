import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId");
    const documentType = formData.get("documentType");
    const file = formData.get("file");

    if (!userId || !documentType || !file) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // ตรวจสอบว่าเป็นไฟล์หรือไม่
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาอัพโหลดไฟล์ที่ถูกต้อง" }, { status: 400 });
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 10MB" }, { status: 400 });
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น" },
        { status: 400 },
      );
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // กำหนดพาธสำหรับบันทึกไฟล์
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);

    // บันทึกไฟล์
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // บันทึกข้อมูลลงฐานข้อมูล
    const fileUrl = `/uploads/${fileName}`;
    const result = await query(
      `INSERT INTO FTI_Original_Membership_Documents_Member (user_id, document_type, file_name, file_path, original_name, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, documentType, fileName, fileUrl, file.name],
    );

    // บันทึกประวัติการอัพโหลดเอกสาร
    await query(
      `INSERT INTO FTI_Portal_User_Logs (user_id, action, details, created_at)
       VALUES (?, 'document_upload', ?, NOW())`,
      [userId, `อัพโหลดเอกสาร: ${file.name}`],
    );

    return NextResponse.json({
      success: true,
      message: "อัพโหลดเอกสารสำเร็จ",
      documentId: result.insertId,
      filePath: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพโหลดเอกสาร" }, { status: 500 });
  }
}
