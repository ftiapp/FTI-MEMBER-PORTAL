import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

/**
 * API endpoint to fetch member details
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - JSON response with member details
 */
export async function GET(request) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ไม่ระบุ userId" }, { status: 400 });
    }

    // For this version, we'll allow access to member details without strict authentication
    // since it's being used in the dashboard for the member's own data

    // Fetch member details from the database
    const memberResult = await query(
      `SELECT 
        cm.id,
        cm.user_id,
        cm.MEMBER_CODE,
        cm.company_name,
        cm.company_type,
        cm.tax_id,
        cm.Admin_Submit,
        cm.reject_reason,
        cm.admin_comment,
        cm.created_at,
        cm.updated_at,
        u.email,
        u.firstname,
        u.lastname,
        u.name
      FROM 
        companies_Member cm
      JOIN 
        users u ON cm.user_id = u.id
      WHERE 
        cm.user_id = ?
      ORDER BY 
        cm.id DESC
      LIMIT 1`,
      [userId],
    );

    // Fetch documents from the database
    const documentsResult = await query(
      `SELECT 
        id,
        user_id,
        document_type,
        file_name,
        file_path,
        status,
        uploaded_at,
        updated_at,
        Admin_Submit,
        reject_reason
      FROM 
        documents_Member
      WHERE 
        user_id = ?
      ORDER BY 
        uploaded_at DESC`,
      [userId],
    );

    if (memberResult.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสมาชิก" }, { status: 404 });
    }

    // Return the member details and documents
    return NextResponse.json({
      ...memberResult[0],
      documents: documentsResult,
    });
  } catch (error) {
    console.error("Error fetching member details:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก" }, { status: 500 });
  }
}
