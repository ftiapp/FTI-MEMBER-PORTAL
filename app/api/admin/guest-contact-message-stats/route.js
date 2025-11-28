import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
let guestContactMessageStatsCache = { data: null, expiresAt: 0 };

export async function GET() {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (
      isProd &&
      guestContactMessageStatsCache.data &&
      guestContactMessageStatsCache.expiresAt > Date.now()
    ) {
      return NextResponse.json(guestContactMessageStatsCache.data);
    }

    // Query to count messages by status
    const statusCountsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM FTI_Portal_Guest_Contact_Messages
      GROUP BY status
    `;

    // Query to get total count
    const totalCountQuery = `
      SELECT COUNT(*) as count FROM FTI_Portal_Guest_Contact_Messages
    `;

    const statusCountsResult = await query(statusCountsQuery);
    const totalCountResult = await query(totalCountQuery);

    // Format the data
    const statusCounts = {
      unread: 0,
      read: 0,
      replied: 0,
      closed: 0,
    };

    statusCountsResult.forEach((row) => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = row.count;
      }
    });

    const responseBody = {
      success: true,
      data: {
        statusCounts,
        totalCount: totalCountResult[0]?.count || 0,
      },
    };

    if (isProd) {
      guestContactMessageStatsCache = {
        data: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      };
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error fetching guest contact message statistics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch guest contact message statistics" },
      { status: 500 },
    );
  }
}
