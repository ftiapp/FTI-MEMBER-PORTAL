import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../../lib/adminAuth";
import { mssqlQuery } from "../../../../lib/mssql";

export async function GET(request) {
  try {
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").toString().trim();

    if (!q) {
      return NextResponse.json({ success: true, data: [] });
    }

    const like = `%${q}%`;

    const rows = await mssqlQuery(
      `SELECT TOP (10) name
       FROM (
         SELECT [REPRESENT_1] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         UNION ALL
         SELECT [REPRESENT_2] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         UNION ALL
         SELECT [REPRESENT_3] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       ) x
       WHERE x.name IS NOT NULL
         AND LTRIM(RTRIM(x.name)) <> ''
         AND x.name LIKE ?
       GROUP BY x.name
       ORDER BY x.name`,
      [like],
    );

    return NextResponse.json({
      success: true,
      data: (Array.isArray(rows) ? rows : [])
        .map((r) => (r && r.name != null ? String(r.name).trim() : ""))
        .filter(Boolean),
    });
  } catch (error) {
    console.error("Representative suggest error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการค้นหา suggestion" },
      { status: 500 },
    );
  }
}
