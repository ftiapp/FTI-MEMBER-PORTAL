import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
const membershipTimelineAnalyticsCache = new Map();

// GET /api/admin/analytics/membership-timeline
// Returns signup counts with flexible date range support
// Query params: 
//   - startDate (optional, YYYY-MM-DD format)
//   - endDate (optional, YYYY-MM-DD format)
//   - year (optional, for backward compatibility)
//   - startMonth, endMonth (optional, for backward compatibility)
//   - status (optional, 0-4)
export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const yearParam = searchParams.get("year");
    const startMonthParam = searchParams.get("startMonth");
    const endMonthParam = searchParams.get("endMonth");
    const statusParam = searchParams.get("status");

    let startDate, endDate, useDateRange = false;

    // Priority 1: Use date range if provided
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      
      // Ensure valid dates
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Ensure startDate <= endDate
        if (startDate > endDate) {
          [startDate, endDate] = [endDate, startDate];
        }
        // Set to start of day for startDate and end of day for endDate
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        useDateRange = true;
      }
    }

    // Priority 2: Fall back to year/month range for backward compatibility
    if (!useDateRange) {
      const year = yearParam === "all" ? null : Number(yearParam) || new Date().getFullYear();
      const startMonth = startMonthParam ? Math.min(Math.max(Number(startMonthParam), 1), 12) : 1;
      const endMonth = endMonthParam ? Math.min(Math.max(Number(endMonthParam), 1), 12) : 12;
      
      const rangeStart = Math.min(startMonth, endMonth);
      const rangeEnd = Math.max(startMonth, endMonth);
      
      if (year) {
        startDate = new Date(year, rangeStart - 1, 1, 0, 0, 0, 0);
        endDate = new Date(year, rangeEnd, 0, 23, 59, 59, 999); // Last day of rangeEnd month
      } else {
        // "all" years - use a wide range
        startDate = new Date(2000, 0, 1);
        endDate = new Date(2099, 11, 31);
      }
    }

    // Optional status filter (0,1,2,3,4). If invalid, treat as no filter
    const rawStatus = statusParam !== null ? Number(statusParam) : null;
    const statusFilter =
      rawStatus !== null && !Number.isNaN(rawStatus) && rawStatus >= 0 && rawStatus <= 4
        ? rawStatus
        : null;

    const cacheKey = JSON.stringify({ 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString(), 
      status: statusFilter 
    });
    
    if (isProd && membershipTimelineAnalyticsCache.has(cacheKey)) {
      const cached = membershipTimelineAnalyticsCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.payload);
      }
      membershipTimelineAnalyticsCache.delete(cacheKey);
    }

    // Query all 4 member types for the specified date range
    const statusCondition = statusFilter !== null ? " AND status = ?" : "";

    const sql = `
      SELECT 'OC' AS memberType, 
             YEAR(created_at) AS year,
             MONTH(created_at) AS month, 
             DAY(created_at) AS day,
             COUNT(*) AS count
      FROM MemberRegist_OC_Main
      WHERE created_at >= ? AND created_at <= ?${statusCondition}
      GROUP BY YEAR(created_at), MONTH(created_at), DAY(created_at)
      UNION ALL
      SELECT 'AC' AS memberType, 
             YEAR(created_at) AS year,
             MONTH(created_at) AS month, 
             DAY(created_at) AS day,
             COUNT(*) AS count
      FROM MemberRegist_AC_Main
      WHERE created_at >= ? AND created_at <= ?${statusCondition}
      GROUP BY YEAR(created_at), MONTH(created_at), DAY(created_at)
      UNION ALL
      SELECT 'AM' AS memberType, 
             YEAR(created_at) AS year,
             MONTH(created_at) AS month, 
             DAY(created_at) AS day,
             COUNT(*) AS count
      FROM MemberRegist_AM_Main
      WHERE created_at >= ? AND created_at <= ?${statusCondition}
      GROUP BY YEAR(created_at), MONTH(created_at), DAY(created_at)
      UNION ALL
      SELECT 'IC' AS memberType, 
             YEAR(created_at) AS year,
             MONTH(created_at) AS month, 
             DAY(created_at) AS day,
             COUNT(*) AS count
      FROM MemberRegist_IC_Main
      WHERE created_at >= ? AND created_at <= ?${statusCondition}
      GROUP BY YEAR(created_at), MONTH(created_at), DAY(created_at)
      ORDER BY year, month, day
    `;

    const baseParams = [startDate, endDate];
    const rows = await query(sql, [
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
    ]);

    // Build daily data structure
    const dailyData = {};
    for (const row of rows) {
      const dateKey = `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          year: Number(row.year),
          month: Number(row.month),
          day: Number(row.day),
          countsByType: { IC: 0, OC: 0, AM: 0, AC: 0 },
        };
      }
      const type = row.memberType;
      const count = Number(row.count) || 0;
      dailyData[dateKey].countsByType[type] = count;
    }

    // Convert to array and sort by date
    const days = Object.values(dailyData).sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, a.day);
      const dateB = new Date(b.year, b.month - 1, b.day);
      return dateA - dateB;
    });

    // Aggregate counts by status across all tables for the date range
    const statusSql = `
      SELECT status, SUM(cnt) AS count
      FROM (
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_OC_Main
        WHERE created_at >= ? AND created_at <= ?${statusCondition}
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AC_Main
        WHERE created_at >= ? AND created_at <= ?${statusCondition}
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AM_Main
        WHERE created_at >= ? AND created_at <= ?${statusCondition}
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_IC_Main
        WHERE created_at >= ? AND created_at <= ?${statusCondition}
        GROUP BY status
      ) AS combined
      GROUP BY status
    `;

    const statusRows = await query(statusSql, [
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
      ...baseParams,
      ...(statusFilter !== null ? [statusFilter] : []),
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
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: statusFilter,
        days,
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
