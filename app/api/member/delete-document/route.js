import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!documentId || !userId) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้ระบุ ID เอกสารหรือ ID ผู้ใช้" },
        { status: 400 },
      );
    }

    // Get document information before deleting
    const documentResult = await query(
      `SELECT file_path FROM FTI_Original_Membership_Documents_Member WHERE id = ? AND user_id = ?`,
      [documentId, userId],
    );

    if (documentResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบเอกสารที่ต้องการลบ" },
        { status: 404 },
      );
    }

    const filePath = documentResult[0].file_path;

    // Extract public ID from Cloudinary URL
    const publicId = filePath.split("/").pop().split(".")[0];

    // Delete file from Cloudinary
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete document record from database
    await query(`DELETE FROM FTI_Original_Membership_Documents_Member WHERE id = ? AND user_id = ?`, [documentId, userId]);

    // Log the activity
    await query(
      `INSERT INTO FTI_Portal_User_Logs 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        "member_verification",
        JSON.stringify({
          action: "DOCUMENT_DELETED",
          documentId,
          timestamp: new Date().toISOString(),
        }),
        request.headers.get("x-forwarded-for") || "",
        request.headers.get("user-agent") || "",
      ],
    );

    return NextResponse.json({
      success: true,
      message: "ลบเอกสารสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบเอกสาร" },
      { status: 500 },
    );
  }
}
