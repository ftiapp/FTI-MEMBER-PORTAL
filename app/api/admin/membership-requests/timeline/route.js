import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

// GET /api/admin/membership-requests/timeline
// Returns monthly signup counts for current year, grouped by member type
export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const currentYearResult = await query("SELECT YEAR(CURDATE()) AS year");
    const year = currentYearResult?.[0]?.year || new Date().getFullYear();

    // We assume each MemberRegist_*_Main table has a created_at column
    const sql = `
      SELECT 'OC' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_OC_Main
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      UNION ALL
      SELECT 'AC' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_AC_Main
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      UNION ALL
      SELECT 'AM' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_AM_Main
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      UNION ALL
      SELECT 'IC' AS memberType, MONTH(created_at) AS month, COUNT(*) AS count
      FROM MemberRegist_IC_Main
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
    `;

    const rows = await query(sql, [year, year, year, year]);

    // Build structure: months[1..12] with countsByType
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      countsByType: { IC: 0, OC: 0, AM: 0, AC: 0 },
    }));

    for (const row of rows) {
      const m = Number(row.month);
      const type = row.memberType;
      const count = Number(row.count) || 0;
      const target = months[m - 1];
      if (!target.countsByType[type]) target.countsByType[type] = 0;
      target.countsByType[type] += count;
    }

    // Aggregate counts by status across all tables for the current year
    const statusSql = `
      SELECT status, SUM(cnt) AS count
      FROM (
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_OC_Main
        WHERE YEAR(created_at) = ?
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AC_Main
        WHERE YEAR(created_at) = ?
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_AM_Main
        WHERE YEAR(created_at) = ?
        GROUP BY status
        UNION ALL
        SELECT status, COUNT(*) AS cnt
        FROM MemberRegist_IC_Main
        WHERE YEAR(created_at) = ?
        GROUP BY status
      ) AS combined
      GROUP BY status
    `;

    const statusRows = await query(statusSql, [year, year, year, year]);

    const statusCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const row of statusRows) {
      const s = Number(row.status);
      const c = Number(row.count) || 0;
      if (s in statusCounts) {
        statusCounts[s] += c;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        year,
        months,
        statusCounts,
      },
    });
  } catch (err) {
    console.error("Error fetching membership timeline stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติการสมัครสมาชิก" },
      { status: 500 },
    );
  }
}
