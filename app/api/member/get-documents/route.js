import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

/**
 * GET handler for retrieving member documents
 *
 * This endpoint retrieves all documents associated with a specific MEMBER_CODE.
 * It ensures that only the user who owns the documents can access them.
 */
export async function GET(request) {
  try {
    // Get user from cookies
    const cookieStore = cookies();
    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);

    // Get member code from query params
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get("memberCode");

    if (!memberCode) {
      return NextResponse.json({ success: false, message: "ไม่พบรหัสสมาชิก" }, { status: 400 });
    }

    // Verify that the member code belongs to the user
    const memberCheck = await query(
      `SELECT * FROM FTI_Original_Membership WHERE MEMBER_CODE = ? AND user_id = ?`,
      [memberCode, user.id],
    );

    if (memberCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้" },
        { status: 403 },
      );
    }

    // Fetch documents
    const documents = await query(
      `SELECT * FROM FTI_Original_Membership_Documents_Member WHERE MEMBER_CODE = ? AND user_id = ? ORDER BY uploaded_at DESC`,
      [memberCode, user.id],
    );

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching member documents:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร" },
      { status: 500 },
    );
  }
}
