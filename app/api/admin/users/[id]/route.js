import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

/**
 * GET /api/admin/users/[id]
 *
 * Fetches a single user by ID for admin management.
 * Requires admin authentication.
 */
export async function GET(request, { params }) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const userId = params.id;

    // Query to get user by ID
    const userQuery = `
      SELECT id, name, firstname, lastname, email, phone, status, email_verified, created_at, updated_at
      FROM FTI_Portal_User
      WHERE id = ?
    `;

    const users = await query(userQuery, [userId]);

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" },
      { status: 500 },
    );
  }
}
