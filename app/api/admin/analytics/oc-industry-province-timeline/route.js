import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

// GET /api/admin/analytics/oc-industry-province-timeline
// Returns OC industry and province chapter stats with month range support
// Query params: year, startMonth, endMonth
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

    const year = Number(yearParam) || now.getFullYear();
    const startMonth = startMonthParam ? Math.min(Math.max(Number(startMonthParam), 1), 12) : 1;
    const endMonth = endMonthParam ? Math.min(Math.max(Number(endMonthParam), 1), 12) : 12;

    // Ensure startMonth <= endMonth
    const rangeStart = Math.min(startMonth, endMonth);
    const rangeEnd = Math.max(startMonth, endMonth);

    // Query industry groups for the specified range
    const industryRows = await query(
      `SELECT name, SUM(cnt) AS count
       FROM (
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_OC_IndustryGroups ig
         JOIN MemberRegist_OC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AC_IndustryGroups ig
         JOIN MemberRegist_AC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AM_IndustryGroups ig
         JOIN MemberRegist_AM_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_IC_IndustryGroups ig
         JOIN MemberRegist_IC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
       ) AS combined
       GROUP BY name
       ORDER BY count DESC, name ASC`,
      [
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
      ],
    );

    // Query province chapters for the specified range
    const provinceRows = await query(
      `SELECT name, SUM(cnt) AS count
       FROM (
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_OC_ProvinceChapters pc
         JOIN MemberRegist_OC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AC_ProvinceChapters pc
         JOIN MemberRegist_AC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AM_ProvinceChapters pc
         JOIN MemberRegist_AM_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_IC_ProvinceChapters pc
         JOIN MemberRegist_IC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) BETWEEN ? AND ?
         GROUP BY name
       ) AS combined
       GROUP BY name
       ORDER BY count DESC, name ASC`,
      [
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
        year, rangeStart, rangeEnd,
      ],
    );

    const byIndustry = industryRows.map((r) => ({ name: r.name || "ไม่ระบุ", count: Number(r.count) || 0 }));
    const byProvince = provinceRows.map((r) => ({ name: r.name || "ไม่ระบุ", count: Number(r.count) || 0 }));

    const totalIndustry = byIndustry.reduce((sum, r) => sum + (r.count || 0), 0);
    const totalProvince = byProvince.reduce((sum, r) => sum + (r.count || 0), 0);

    // Get monthly totals for growth calculation (all member types combined)
    const monthlyQuery = `
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

    const monthlyRows = await query(monthlyQuery, [year, year, year, year]);
    const monthlyTotals = Array(12).fill(0);
    for (const row of monthlyRows) {
      const m = Number(row.month);
      if (m >= 1 && m <= 12) {
        monthlyTotals[m - 1] = Number(row.count) || 0;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        year,
        startMonth: rangeStart,
        endMonth: rangeEnd,
        byIndustry,
        byProvince,
        totalIndustry,
        totalProvince,
        monthlyTotals,
      },
    });
  } catch (err) {
    console.error("Error fetching OC industry/province timeline stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติตามกลุ่มอุตสาหกรรม/สภาจังหวัด" },
      { status: 500 },
    );
  }
}
