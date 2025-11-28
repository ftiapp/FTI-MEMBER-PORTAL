import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
let contactMessageStatsCache = { data: null, expiresAt: 0 };

/**
 * API endpoint to get statistics for contact messages by status
 *
 * @returns {Object} Counts of contact messages grouped by status
 */
export async function GET() {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (
      isProd &&
      contactMessageStatsCache.data &&
      contactMessageStatsCache.expiresAt > Date.now()
    ) {
      return NextResponse.json(contactMessageStatsCache.data);
    }

    // Get counts for each status type
    const sql = `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM 
        FTI_Portal_User_Contact_Messages 
      GROUP BY 
        status
    `;

    const results = await query(sql);

    // Format the response with all possible statuses
    const statusCounts = {
      unread: 0,
      read: 0,
      replied: 0,
    };

    // Fill in the actual counts
    results.forEach((row) => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = row.count;
      }
    });

    // Get total count
    const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    const responseBody = {
      success: true,
      data: {
        statusCounts,
        totalCount,
      },
    };

    if (isProd) {
      contactMessageStatsCache = {
        data: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      };
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error fetching contact message stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact message statistics",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
