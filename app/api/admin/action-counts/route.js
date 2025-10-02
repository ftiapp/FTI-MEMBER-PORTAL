import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * API endpoint to get counts of member verifications from companies_Member
 * Only counts approved members (Admin_Submit = 2)
 *
 * @returns {Object} Counts of approved members and other actions
 */
export async function GET(request) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get count of approved members from companies_Member
    const memberSql = `
      SELECT 
        COUNT(*) as count 
      FROM 
        companies_Member 
      WHERE 
        Admin_Submit = 1
    `;

    const memberResults = await query(memberSql);

    // Get counts for other action types from Member_portal_User_log
    const logSql = `
      SELECT 
        action, 
        COUNT(*) as count 
      FROM 
        Member_portal_User_log 
      WHERE 
        action != 'member_verification'
      GROUP BY 
        action 
      ORDER BY 
        count DESC
    `;

    const logResults = await query(logSql);

    // Format the response
    const actionCounts = {
      member_verification: memberResults[0].count,
    };

    logResults.forEach((row) => {
      actionCounts[row.action] = row.count;
    });

    return NextResponse.json({
      success: true,
      data: actionCounts,
    });
  } catch (error) {
    console.error("Error fetching action counts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch action counts",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
