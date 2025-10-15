import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

/**
 * GET /api/admin/FTI_Portal_User/search
 *
 * Searches for FTI_Portal_User based on the provided search term.
 * Searches in name, email, and phone fields.
 * Requires admin authentication.
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get search term from query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("term") || "";

    if (!searchTerm.trim()) {
      return NextResponse.json({ success: false, message: "กรุณาระบุคำค้นหา" }, { status: 400 });
    }

    // Create search pattern
    const searchPattern = `%${searchTerm}%`;

    // Query to search FTI_Portal_User
    const searchQuery = `
      SELECT id, name, firstname, lastname, email, phone, status, email_verified, created_at, updated_at
      FROM FTI_Portal_User
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY id DESC
      LIMIT 50
    `;

    const FTI_Portal_User = await query(searchQuery, [searchPattern, searchPattern, searchPattern]);

    return NextResponse.json({
      success: true,
      FTI_Portal_User,
      total: FTI_Portal_User.length,
    });
  } catch (error) {
    console.error("Error searching FTI_Portal_User:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการค้นหาผู้ใช้" },
      { status: 500 },
    );
  }
}
