import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
const membershipSignupSummaryCache = new Map();

/**
 * GET /api/admin/analytics/membership-signup-summary
 * 
 * Returns lifetime total counts of membership signups by type
 * Used for dashboard cards showing total signups since system launch
 * 
 * No date filtering - counts ALL records from MemberRegist_* tables
 */
export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const cacheKey = "lifetime-summary";
    if (isProd && membershipSignupSummaryCache.has(cacheKey)) {
      const cached = membershipSignupSummaryCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.payload);
      }
      membershipSignupSummaryCache.delete(cacheKey);
    }

    // Query all 4 member types - lifetime totals (no date filter)
    const sql = `
      SELECT 'OC' AS memberType, COUNT(*) AS count
      FROM MemberRegist_OC_Main
      UNION ALL
      SELECT 'AC' AS memberType, COUNT(*) AS count
      FROM MemberRegist_AC_Main
      UNION ALL
      SELECT 'AM' AS memberType, COUNT(*) AS count
      FROM MemberRegist_AM_Main
      UNION ALL
      SELECT 'IC' AS memberType, COUNT(*) AS count
      FROM MemberRegist_IC_Main
    `;

    const rows = await query(sql);

    // Build totalByType object
    const totalByType = { IC: 0, OC: 0, AM: 0, AC: 0 };
    let totalAll = 0;

    for (const row of rows) {
      const type = row.memberType;
      const count = Number(row.count) || 0;
      if (type in totalByType) {
        totalByType[type] = count;
        totalAll += count;
      }
    }

    // Also get status breakdown (lifetime)
    const statusSql = `
      SELECT status, SUM(cnt) AS count
      FROM (
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_OC_Main
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AC_Main
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AM_Main
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_IC_Main
        GROUP BY status
      ) AS combined
      GROUP BY status
    `;

    const statusRows = await query(statusSql);

    const statusCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const row of statusRows) {
      const s = Number(row.status);
      const c = Number(row.count) || 0;
      if (s in statusCounts) {
        statusCounts[s] = c;
      }
    }

    const responseBody = {
      success: true,
      data: {
        totalByType,
        totalAll,
        statusCounts,
      },
    };

    if (isProd) {
      membershipSignupSummaryCache.set(cacheKey, {
        payload: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      });
    }

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Error fetching membership signup summary:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติการสมัครสมาชิก" },
      { status: 500 },
    );
  }
}
