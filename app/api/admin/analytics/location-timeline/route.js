import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
const locationTimelineCache = new Map();

// GET /api/admin/analytics/location-timeline
// Returns membership signup counts by company province with month range support
// Query params: year, startMonth, endMonth, memberType (optional: IC/OC/AM/AC/all)
export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const yearParam = searchParams.get("year");
    const startMonthParam = searchParams.get("startMonth");
    const endMonthParam = searchParams.get("endMonth");
    const memberTypeParam = (searchParams.get("memberType") || "all").toUpperCase();

    const year = Number(yearParam) || now.getFullYear();
    const startMonth = startMonthParam ? Math.min(Math.max(Number(startMonthParam), 1), 12) : 1;
    const endMonth = endMonthParam ? Math.min(Math.max(Number(endMonthParam), 1), 12) : 12;
    const memberType = ["IC", "OC", "AM", "AC"].includes(memberTypeParam) ? memberTypeParam : "ALL";

    // Ensure startMonth <= endMonth
    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);

    const cacheKey = JSON.stringify({ year, rangeStart, rangeEnd, memberType });
    if (isProd && locationTimelineCache.has(cacheKey)) {
      const cached = locationTimelineCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.payload);
      }
      locationTimelineCache.delete(cacheKey);
    }

    // We use address_type = '2' (ที่อยู่จัดส่งเอกสาร/ที่อยู่หลักบริษัท) for province
    let queryText;
    let params;

    if (memberType === "OC") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_OC_Address a
         JOIN MemberRegist_OC_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, rangeStart, rangeEnd];
    } else if (memberType === "AC") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_AC_Address a
         JOIN MemberRegist_AC_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, rangeStart, rangeEnd];
    } else if (memberType === "AM") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_AM_Address a
         JOIN MemberRegist_AM_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, rangeStart, rangeEnd];
    } else if (memberType === "IC") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_IC_Address a
         JOIN MemberRegist_IC_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, rangeStart, rangeEnd];
    } else {
      queryText =
        `SELECT province AS name, SUM(cnt) AS count
         FROM (
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_OC_Address a
           JOIN MemberRegist_OC_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
           GROUP BY a.province
           UNION ALL
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_AC_Address a
           JOIN MemberRegist_AC_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
           GROUP BY a.province
           UNION ALL
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_AM_Address a
           JOIN MemberRegist_AM_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
           GROUP BY a.province
           UNION ALL
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_IC_Address a
           JOIN MemberRegist_IC_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
           GROUP BY a.province
         ) AS combined
         GROUP BY province
         ORDER BY count DESC, province ASC`;
      params = [
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
      ];
    }

    const rows = await query(queryText, params);

    const byProvince = rows.map((r) => ({ name: r.name || "ไม่ระบุ", count: Number(r.count) || 0 }));
    const total = byProvince.reduce((sum, r) => sum + (r.count || 0), 0);

    // Get monthly totals for growth calculation
    let monthlyQuery;
    let monthlyParams;
    
    if (memberType === "OC") {
      monthlyQuery = `
        SELECT MONTH(m.created_at) AS month, COUNT(*) AS count
        FROM MemberRegist_OC_Main m
        WHERE YEAR(m.created_at) = ?
        GROUP BY MONTH(m.created_at)
      `;
      monthlyParams = [year];
    } else if (memberType === "AC") {
      monthlyQuery = `
        SELECT MONTH(m.created_at) AS month, COUNT(*) AS count
        FROM MemberRegist_AC_Main m
        WHERE YEAR(m.created_at) = ?
        GROUP BY MONTH(m.created_at)
      `;
      monthlyParams = [year];
    } else if (memberType === "AM") {
      monthlyQuery = `
        SELECT MONTH(m.created_at) AS month, COUNT(*) AS count
        FROM MemberRegist_AM_Main m
        WHERE YEAR(m.created_at) = ?
        GROUP BY MONTH(m.created_at)
      `;
      monthlyParams = [year];
    } else if (memberType === "IC") {
      monthlyQuery = `
        SELECT MONTH(m.created_at) AS month, COUNT(*) AS count
        FROM MemberRegist_IC_Main m
        WHERE YEAR(m.created_at) = ?
        GROUP BY MONTH(m.created_at)
      `;
      monthlyParams = [year];
    } else {
      monthlyQuery = `
        SELECT month, SUM(cnt) AS count
        FROM (
          SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM MemberRegist_OC_Main WHERE YEAR(created_at) = ? GROUP BY MONTH(created_at)
          UNION ALL
          SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM MemberRegist_AC_Main WHERE YEAR(created_at) = ? GROUP BY MONTH(created_at)
          UNION ALL
          SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM MemberRegist_AM_Main WHERE YEAR(created_at) = ? GROUP BY MONTH(created_at)
          UNION ALL
          SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM MemberRegist_IC_Main WHERE YEAR(created_at) = ? GROUP BY MONTH(created_at)
        ) AS combined
        GROUP BY month
      `;
      monthlyParams = [year, year, year, year];
    }

    const monthlyRows = await query(monthlyQuery, monthlyParams);
    const monthlyTotals = Array(12).fill(0);
    for (const row of monthlyRows) {
      const m = Number(row.month);
      if (m >= 1 && m <= 12) {
        monthlyTotals[m - 1] = Number(row.count) || 0;
      }
    }

    const responseBody = {
      success: true,
      data: {
        year,
        startMonth: rangeStart,
        endMonth: rangeEnd,
        memberType: memberType === "ALL" ? "all" : memberType,
        total,
        byProvince,
        monthlyTotals,
      },
    };

    if (isProd) {
      locationTimelineCache.set(cacheKey, {
        payload: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      });
    }

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Error fetching location timeline stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติการสมัครสมาชิกตามจังหวัด" },
      { status: 500 },
    );
  }
}
