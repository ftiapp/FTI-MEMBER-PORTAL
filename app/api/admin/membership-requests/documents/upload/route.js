import { query } from "../../../../../lib/db";
import { getAdminFromSession } from "../../../../../lib/adminAuth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * API สำหรับอัปโหลดเอกสารเพิ่มเติมหรือแทนที่เอกสารเดิม
 * POST /api/admin/membership-requests/documents/upload
 */
export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const membershipType = formData.get("membershipType"); // OC, AC, AM, IC
    const applicationId = formData.get("applicationId");
    const documentType = formData.get("documentType"); // certificate, financial, tax, other
    const replaceDocumentId = formData.get("replaceDocumentId"); // Optional: ID of document to replace

    if (!file || !membershipType || !applicationId || !documentType) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `membership/${membershipType.toLowerCase()}/${applicationId}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    // If replacing, delete old document
    if (replaceDocumentId) {
      const oldDoc = await query(
        `SELECT * FROM MemberRegist_${membershipType}_Documents WHERE id = ? AND main_id = ?`,
        [replaceDocumentId, applicationId],
      );

      if (oldDoc.length > 0 && oldDoc[0].cloudinary_id) {
        try {
          await cloudinary.uploader.destroy(oldDoc[0].cloudinary_id);
        } catch (error) {
          console.error("Error deleting old file from Cloudinary:", error);
        }
      }

      // Delete from database
      await query(
        `DELETE FROM MemberRegist_${membershipType}_Documents WHERE id = ? AND main_id = ?`,
        [replaceDocumentId, applicationId],
      );
    }

    // Insert new document record
    await query(
      `INSERT INTO MemberRegist_${membershipType}_Documents 
       (main_id, document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        applicationId,
        documentType,
        file.name,
        uploadResult.secure_url,
        file.size,
        file.type,
        uploadResult.public_id,
        uploadResult.secure_url,
      ],
    );

    // Log action
    await query(
      `INSERT INTO FTI_Portal_Admin_Actions_Logs (admin_id, action_type, target_id, description, created_at)
       VALUES (?, 'Admin_Update_MemberRegist', ?, ?, NOW())`,
      [
        admin.id,
        applicationId,
        JSON.stringify({
          event: "upload_document",
          documentType,
          fileName: file.name,
          replaced: !!replaceDocumentId,
        }),
      ],
    );

    return Response.json({
      success: true,
      message: replaceDocumentId ? "แทนที่เอกสารสำเร็จ" : "อัปโหลดเอกสารสำเร็จ",
      data: {
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("[Upload Document] Error:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร",
      },
      { status: 500 },
    );
  }
}
