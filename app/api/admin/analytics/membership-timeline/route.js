import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
const membershipTimelineAnalyticsCache = new Map();

// GET /api/admin/analytics/membership-timeline
// Returns monthly signup counts with flexible date range support
// Query params: year (required), startMonth (optional, 1-12), endMonth (optional, 1-12)
export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const startMonthParam = searchParams.get("startMonth");
    const endMonthParam = searchParams.get("endMonth");

    const year = Number(yearParam) || new Date().getFullYear();
    const startMonth = startMonthParam ? Math.min(Math.max(Number(startMonthParam), 1), 12) : 1;
    const endMonth = endMonthParam ? Math.min(Math.max(Number(endMonthParam), 1), 12) : 12;

    // Ensure startMonth <= endMonth
    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);

    const cacheKey = JSON.stringify({ year, rangeStart, rangeEnd });
    if (isProd && membershipTimelineAnalyticsCache.has(cacheKey)) {
      const cached = membershipTimelineAnalyticsCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.payload);
      }
      membershipTimelineAnalyticsCache.delete(cacheKey);
    }

    // Query all 4 member types for the specified year and month range
    const sql = `
      SELECT 'OC' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_OC_Main
      WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
      GROUP BY MONTH(created_at)
      UNION ALL
      SELECT 'AC' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_AC_Main
      WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
      GROUP BY MONTH(created_at)
      UNION ALL
      SELECT 'AM' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_AM_Main
      WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
      GROUP BY MONTH(created_at)
      UNION ALL
      SELECT 'IC' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_IC_Main
      WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
      GROUP BY MONTH(created_at)
    `;

    const rows = await query(sql, [
      year, rangeStart, rangeEnd,
      year, rangeStart, rangeEnd,
      year, rangeStart, rangeEnd,
      year, rangeStart, rangeEnd,
    ]);

    // Build structure: months[1..12] with countsByType (always return full year for consistency)
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      countsByType: { IC: 0, OC: 0, AM: 0, AC: 0 },
    }));

    for (const row of rows) {
      const m = Number(row.month);
      const type = row.memberType;
      const count = Number(row.count) || 0;
      if (m >= 1 && m <= 12) {
        const target = months[m - 1];
        if (!target.countsByType[type]) target.countsByType[type] = 0;
        target.countsByType[type] += count;
      }
    }

    // Aggregate counts by status across all tables for the year and month range
    const statusSql = `
      SELECT status, SUM(cnt) AS count
      FROM (
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_OC_Main
        WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AC_Main
        WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AM_Main
        WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_IC_Main
        WHERE YEAR(created_at) = ? AND MONTH(created_at) BETWEEN ? AND ?
        GROUP BY status
      ) AS combined
      GROUP BY status
    `;

    const statusRows = await query(statusSql, [
      year, rangeStart, rangeEnd,
      year, rangeStart, rangeEnd,
      year, rangeStart, rangeEnd,
      year, rangeStart, rangeEnd,
    ]);

    const statusCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const row of statusRows) {
      const s = Number(row.status);
      const c = Number(row.count) || 0;
      if (s in statusCounts) {
        statusCounts[s] += c;
      }
    }

    const responseBody = {
      success: true,
      data: {
        year,
        startMonth: rangeStart,
        endMonth: rangeEnd,
        months,
        statusCounts,
      },
    };

    if (isProd) {
      membershipTimelineAnalyticsCache.set(cacheKey, {
        payload: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      });
    }

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Error fetching membership timeline stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติการสมัครสมาชิก" },
      { status: 500 },
    );
  }
}
