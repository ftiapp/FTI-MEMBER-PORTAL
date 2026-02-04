import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
const originalMembershipTimelineCache = new Map();

/**
 * GET /api/admin/analytics/original-membership-timeline
 *
 * Returns monthly verification counts for original members (FTI_Original_Membership)
 * Similar to membership-timeline but for existing member verifications
 *
 * Query params:
 *   - year (required)
 *   - startMonth (optional, 1-12)
 *   - endMonth (optional, 1-12)
 *   - status (optional, 0/1/2 for Admin_Submit filter)
 */
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
    const statusParam = searchParams.get("status");

    const year = yearParam === "all" ? null : Number(yearParam) || new Date().getFullYear();
    const startMonth = startMonthParam ? Math.min(Math.max(Number(startMonthParam), 1), 12) : 1;
    const endMonth = endMonthParam ? Math.min(Math.max(Number(endMonthParam), 1), 12) : 12;

    // Optional status filter (0,1,2 for Admin_Submit). If invalid, treat as no filter
    const rawStatus = statusParam !== null ? Number(statusParam) : null;
    const statusFilter =
      rawStatus !== null && !Number.isNaN(rawStatus) && rawStatus >= 0 && rawStatus <= 2
        ? rawStatus
        : null;

    // Ensure startMonth <= endMonth
    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);

    const cacheKey = JSON.stringify({ year: year ?? "all", rangeStart, rangeEnd, status: statusFilter });
    if (isProd && originalMembershipTimelineCache.has(cacheKey)) {
      const cached = originalMembershipTimelineCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.payload);
      }
      originalMembershipTimelineCache.delete(cacheKey);
    }

    // Query original membership verifications grouped by company_type and month
    // ใช้ created_at (วันที่สร้างข้อมูลในระบบ) แทน MEMBER_DATE (วันที่เป็นสมาชิกจริง)
    const statusCondition = statusFilter !== null ? " AND Admin_Submit = ?" : "";
    const yearCondition = year ? "YEAR(created_at) = ? AND " : "";

    const sql = `
      SELECT 
        company_type AS memberType,
        MONTH(created_at) AS month,
        COUNT(*) AS count
      FROM FTI_Original_Membership
      WHERE ${yearCondition}
        MONTH(created_at) BETWEEN ? AND ?
        AND company_type IS NOT NULL
        AND company_type != ''${statusCondition}
      GROUP BY company_type, MONTH(created_at)
    `;

    const baseParams = year ? [year, rangeStart, rangeEnd] : [rangeStart, rangeEnd];
    const queryParams = statusFilter !== null ? [...baseParams, statusFilter] : baseParams;

    const rows = await query(sql, queryParams);

    // Build structure: months[1..12] with countsByType (dynamic based on actual company_type values)
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      countsByType: {},
    }));

    // Collect all unique company types
    const companyTypes = new Set();
    for (const row of rows) {
      const type = row.memberType;
      if (type) companyTypes.add(type);
    }

    // Initialize all company types to 0 for all months
    for (const month of months) {
      for (const type of companyTypes) {
        month.countsByType[type] = 0;
      }
    }

    // Fill in actual counts
    for (const row of rows) {
      const m = Number(row.month);
      const type = row.memberType;
      const count = Number(row.count) || 0;
      if (m >= 1 && m <= 12 && type) {
        months[m - 1].countsByType[type] = count;
      }
    }

    // Aggregate counts by Admin_Submit status for the year and month range
    const statusSql = `
      SELECT 
        Admin_Submit AS status,
        COUNT(*) AS count
      FROM FTI_Original_Membership
      WHERE ${yearCondition}
        MONTH(created_at) BETWEEN ? AND ?
        AND Admin_Submit IS NOT NULL${statusCondition}
      GROUP BY Admin_Submit
    `;

    const statusRows = await query(statusSql, queryParams);

    const statusCounts = { 0: 0, 1: 0, 2: 0 };
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
        year: year ?? "all",
        startMonth: rangeStart,
        endMonth: rangeEnd,
        status: statusFilter,
        months,
        statusCounts,
        companyTypes: Array.from(companyTypes).sort(), // Return available types for UI
      },
    };

    if (isProd) {
      originalMembershipTimelineCache.set(cacheKey, {
        payload: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      });
    }

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Error fetching original membership timeline stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติการยืนยันสมาชิกเดิม" },
      { status: 500 },
    );
  }
}
