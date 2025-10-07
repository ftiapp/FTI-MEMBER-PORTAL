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
 * API สำหรับลบเอกสาร
 * DELETE /api/admin/membership-requests/documents/delete
 */
export async function DELETE(request) {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const membershipType = searchParams.get("membershipType");
    const applicationId = searchParams.get("applicationId");

    if (!documentId || !membershipType || !applicationId) {
      return Response.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get document info
    const docs = await query(
      `SELECT * FROM MemberRegist_${membershipType}_Documents WHERE id = ? AND main_id = ?`,
      [documentId, applicationId]
    );

    if (docs.length === 0) {
      return Response.json(
        { success: false, message: "Document not found" },
        { status: 404 }
      );
    }

    const doc = docs[0];

    // Delete from Cloudinary
    if (doc.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(doc.cloudinary_id);
      } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        // Continue even if Cloudinary delete fails
      }
    }

    // Delete from database
    await query(
      `DELETE FROM MemberRegist_${membershipType}_Documents WHERE id = ? AND main_id = ?`,
      [documentId, applicationId]
    );

    // Log action
    await query(
      `INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, created_at)
       VALUES (?, 'Admin_Update_MemberRegist', ?, ?, NOW())`,
      [
        admin.id,
        applicationId,
        JSON.stringify({
          event: "delete_document",
          documentType: doc.document_type,
          fileName: doc.file_name,
        }),
      ]
    );

    return Response.json({
      success: true,
      message: "ลบเอกสารสำเร็จ",
    });
  } catch (error) {
    console.error("[Delete Document] Error:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการลบเอกสาร",
      },
      { status: 500 }
    );
  }
}
