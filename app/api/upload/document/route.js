import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { uploadToCloudinary } from "../../../lib/cloudinary";

/**
 * API endpoint to handle document uploads
 * Uploads files to Cloudinary and returns the URL
 */
export async function POST(request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "address_documents";
    const userId = formData.get("userId");

    // Validate required fields
    if (!file) {
      return NextResponse.json({ success: false, message: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่" },
        { status: 401 },
      );
    }

    // Verify user exists
    const userResult = await query("SELECT id FROM FTI_Portal_User WHERE id = ? LIMIT 1", [userId]);
    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้ในระบบ" },
        { status: 401 },
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;

    // Validate file type (only allow PDFs)
    const fileExt = fileName.split(".").pop().toLowerCase();
    if (fileExt !== "pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาอัปโหลดไฟล์ PDF เท่านั้น",
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
    console.log(`Uploading file: ${fileName}, size: ${fileBuffer.length} bytes, folder: ${folder}`);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(fileBuffer, fileName, folder);

    // Check if upload was successful
    if (!uploadResult.success) {
      console.error("Cloudinary upload failed:", uploadResult.error);
      return NextResponse.json(
        {
          success: false,
          message: `เกิดข้อผิดพลาดในการอัปโหลดเอกสาร: ${uploadResult.error || "ไม่ทราบสาเหตุ"}`,
        },
        { status: 500 },
      );
    }

    if (!uploadResult.url) {
      console.error("Cloudinary upload missing URL:", uploadResult);
      return NextResponse.json(
        {
          success: false,
          message: "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร: ไม่ได้รับ URL จาก Cloudinary",
        },
        { status: 500 },
      );
    }

    // Log success
    console.log(`File uploaded successfully to Cloudinary: ${uploadResult.url}`);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Error in document upload API:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในการอัปโหลดเอกสาร: ${error.message || "ไม่ทราบสาเหตุ"}`,
      },
      { status: 500 },
    );
  }
}
