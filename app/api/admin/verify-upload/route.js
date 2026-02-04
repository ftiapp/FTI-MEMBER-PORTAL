export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/app/lib/adminAuth";
import { query } from "@/app/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { Buffer } from "buffer";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Admin upload document into FTI_Original_Membership_Documents_Member with approved status (Admin_Submit = 1).
 * Expected form-data: file, userId, memberCode, documentType
 */
export async function POST(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");
    const memberCode = formData.get("memberCode") || null;
    const documentType = formData.get("documentType") || "other";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: "กรุณาเลือกไฟล์" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "กรุณาระบุ userId" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]; // allow common image/webp
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "รองรับเฉพาะ PDF, JPG, PNG, WEBP" }, { status: 400 });
    }

    // upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "FTI_Portal-Document",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    // insert record as approved/Admin_Submit=1
    await query(
      `INSERT INTO FTI_Original_Membership_Documents_Member 
        (user_id, MEMBER_CODE, document_type, file_name, file_path, status, uploaded_at, updated_at, Admin_Submit, reject_reason, admin_id, admin_name)
        VALUES (?, ?, ?, ?, ?, 'approved', NOW(), NOW(), 1, NULL, ?, ?)` ,
      [userId, memberCode, documentType, file.name, uploadResult.secure_url, admin.id, admin.name || "Admin"],
    );

    return NextResponse.json({
      success: true,
      message: "อัปโหลดและบันทึกสำเร็จ",
      fileName: file.name,
      fileUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("[verify-upload] error:", error);
    return NextResponse.json({ success: false, message: error.message || "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
