import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const year = Number(yearParam) || now.getFullYear();
    const month = Math.min(Math.max(Number(monthParam) || now.getMonth() + 1, 1), 12);

    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;

    const industryRowsCurrent = await query(
      `SELECT name, SUM(cnt) AS count
       FROM (
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_OC_IndustryGroups ig
         JOIN MemberRegist_OC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AC_IndustryGroups ig
         JOIN MemberRegist_AC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AM_IndustryGroups ig
         JOIN MemberRegist_AM_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(ig.industry_group_name USING utf8mb4),
                  CONVERT(ig.industry_group_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_IC_IndustryGroups ig
         JOIN MemberRegist_IC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
       ) AS combined
       GROUP BY name
       ORDER BY count DESC, name ASC`,
      [year, month, year, month, year, month, year, month],
    );

    const industryRowsPrevious = await query(
      `SELECT SUM(cnt) AS count
       FROM (
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_OC_IndustryGroups ig
         JOIN MemberRegist_OC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         UNION ALL
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_AC_IndustryGroups ig
         JOIN MemberRegist_AC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         UNION ALL
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_AM_IndustryGroups ig
         JOIN MemberRegist_AM_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         UNION ALL
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_IC_IndustryGroups ig
         JOIN MemberRegist_IC_Main m ON ig.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
       ) AS combined`,
      [prevYear, prevMonth, prevYear, prevMonth, prevYear, prevMonth, prevYear, prevMonth],
    );

    const provinceRowsCurrent = await query(
      `SELECT name, SUM(cnt) AS count
       FROM (
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_OC_ProvinceChapters pc
         JOIN MemberRegist_OC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AC_ProvinceChapters pc
         JOIN MemberRegist_AC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_AM_ProvinceChapters pc
         JOIN MemberRegist_AM_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
         UNION ALL
         SELECT COALESCE(
                  CONVERT(pc.province_chapter_name USING utf8mb4),
                  CONVERT(pc.province_chapter_id USING utf8mb4)
                ) COLLATE utf8mb4_unicode_ci AS name,
                COUNT(*) AS cnt
         FROM MemberRegist_IC_ProvinceChapters pc
         JOIN MemberRegist_IC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY name
       ) AS combined
       GROUP BY name
       ORDER BY count DESC, name ASC`,
      [year, month, year, month, year, month, year, month],
    );

    const provinceRowsPrevious = await query(
      `SELECT SUM(cnt) AS count
       FROM (
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_OC_ProvinceChapters pc
         JOIN MemberRegist_OC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         UNION ALL
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_AC_ProvinceChapters pc
         JOIN MemberRegist_AC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         UNION ALL
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_AM_ProvinceChapters pc
         JOIN MemberRegist_AM_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         UNION ALL
         SELECT COUNT(*) AS cnt
         FROM MemberRegist_IC_ProvinceChapters pc
         JOIN MemberRegist_IC_Main m ON pc.main_id = m.id
         WHERE YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
       ) AS combined`,
      [prevYear, prevMonth, prevYear, prevMonth, prevYear, prevMonth, prevYear, prevMonth],
    );

    const byIndustry = industryRowsCurrent.map((r) => ({ name: r.name || "ไม่ระบุ", count: Number(r.count) || 0 }));
    const byProvince = provinceRowsCurrent.map((r) => ({ name: r.name || "ไม่ระบุ", count: Number(r.count) || 0 }));

    const totalIndustryCurrent = byIndustry.reduce((sum, r) => sum + (r.count || 0), 0);
    const totalProvinceCurrent = byProvince.reduce((sum, r) => sum + (r.count || 0), 0);

    const totalIndustryPrevious = Number(industryRowsPrevious?.[0]?.count) || 0;
    const totalProvincePrevious = Number(provinceRowsPrevious?.[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        current: {
          byIndustry,
          byProvince,
          totalIndustry: totalIndustryCurrent,
          totalProvince: totalProvinceCurrent,
        },
        previous: {
          totalIndustry: totalIndustryPrevious,
          totalProvince: totalProvincePrevious,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching OC industry/province stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติตามกลุ่มอุตสาหกรรม/สภาจังหวัด" },
      { status: 500 },
    );
  }
}
