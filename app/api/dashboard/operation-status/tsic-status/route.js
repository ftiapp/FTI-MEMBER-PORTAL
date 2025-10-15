import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

/**
 * API route to get TSIC code update status for a user
 * @route GET /api/dashboard/operation-status/tsic-status
 * @param {string} userId - The user ID to get TSIC code update status for
 * @returns {Array} - Array of TSIC code update status objects
 */
export async function GET(request) {
  try {
    // Get the user ID from the request URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // First, get all member codes associated with this user
    const memberCodesQuery = `
      SELECT MEMBER_CODE 
      FROM FTI_Original_Membership 
      WHERE USER_ID = ?
    `;

    const memberCodes = await query(memberCodesQuery, [userId]);

    if (!memberCodes || memberCodes.length === 0) {
      return NextResponse.json({
        message: "No member codes found for this user",
        tsicUpdates: [],
      });
    }

    // Create a parameter placeholder for the IN clause
    const placeholders = memberCodes.map(() => "?").join(",");
    const memberCodeValues = memberCodes.map((m) => m.MEMBER_CODE);

    // Query TSIC code updates for these member codes
    const tsicQuery = `
      SELECT 
        t.id,
        t.user_id,
        t.member_code,
        t.category_code,
        t.tsic_code,
        t.status,
        t.created_at,
        t.updated_at,
        c.COMPANY_NAME as company_name
      FROM 
        FTI_Original_Membership_Member_Tsic_Codes t
      JOIN 
        FTI_Original_Membership c ON t.member_code = c.MEMBER_CODE
      WHERE 
        t.member_code IN (${placeholders})
      ORDER BY 
        t.created_at DESC
    `;

    const tsicUpdates = await query(tsicQuery, memberCodeValues);

    // Map status codes to readable status
    const mappedTsicUpdates = tsicUpdates.map((update) => {
      let status;
      switch (update.status) {
        case 0:
          status = "pending";
          break;
        case 1:
          status = "approved";
          break;
        case 2:
          status = "rejected";
          break;
        default:
          status = "pending";
      }

      return {
        id: update.id,
        user_id: update.user_id,
        member_code: update.member_code,
        category_code: update.category_code,
        tsic_code: update.tsic_code,
        status: status,
        created_at: update.created_at,
        updated_at: update.updated_at,
        company_name: update.company_name,
        description: `รหัส TSIC: ${update.tsic_code} (${update.category_code})`,
      };
    });

    // If no TSIC updates found, return a placeholder
    if (mappedTsicUpdates.length === 0) {
      return NextResponse.json({
        success: true,
        tsicUpdates: [
          {
            id: "no-tsic-updates",
            status: "none",
            description: "คุณยังไม่มีการอัปเดตรหัส TSIC",
            created_at: new Date().toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ success: true, tsicUpdates: mappedTsicUpdates });
  } catch (error) {
    console.error("Error fetching TSIC code update status:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch TSIC code update status",
        tsicUpdates: [
          {
            id: "error-tsic-updates",
            status: "error",
            description: "เกิดข้อผิดพลาดในการโหลดข้อมูลการอัปเดตรหัส TSIC",
            created_at: new Date().toISOString(),
          },
        ],
      },
      { status: 500 },
    );
  }
}
