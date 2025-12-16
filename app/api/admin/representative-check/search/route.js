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
    const qRaw = (searchParams.get("q") || "").toString().trim();
    const pageRaw = (searchParams.get("page") || "1").toString();
    const pageSizeRaw = (searchParams.get("pageSize") || "10").toString();

    if (!qRaw) {
      return NextResponse.json({ success: false, message: "กรุณาระบุคำค้นหา" }, { status: 400 });
    }

    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(pageSizeRaw, 10) || 10));
    const offset = (page - 1) * pageSize;

    const like = `%${qRaw}%`;

    const whereSql =
      "([REPRESENT_1] LIKE ? OR [REPRESENT_1_NO_PREFIX] LIKE ? OR [REPRESENT_2] LIKE ? OR [REPRESENT_2_NO_PREFIX] LIKE ? OR [REPRESENT_3] LIKE ? OR [REPRESENT_3_NO_PREFIX] LIKE ?)";
    const whereParams = [like, like, like, like, like, like];

    const totalRows = await mssqlQuery(
      `SELECT COUNT(DISTINCT [MEMBER_CODE]) AS totalCompanies
       FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       WHERE ${whereSql}`,
      whereParams,
    );

    const totalCompanies = Number(totalRows?.[0]?.totalCompanies || 0);
    const totalPages = Math.max(1, Math.ceil(totalCompanies / pageSize));

    const countRows = await mssqlQuery(
      `SELECT [MEMBER_TYPE_CODE] AS memberTypeCode, COUNT(DISTINCT [MEMBER_CODE]) AS cnt
       FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       WHERE ${whereSql}
       GROUP BY [MEMBER_TYPE_CODE]`,
      whereParams,
    );

    const byMemberType = {};
    for (const r of Array.isArray(countRows) ? countRows : []) {
      byMemberType[String(r.memberTypeCode == null ? "UNKNOWN" : r.memberTypeCode)] = Number(r.cnt || 0);
    }

    const rows = await mssqlQuery(
      `SELECT
         [MEMBER_CODE],
         [COMPANY_NAME],
         [MEMBER_TYPE_CODE],
         CASE
           WHEN [REPRESENT_1] LIKE ? OR [REPRESENT_1_NO_PREFIX] LIKE ? THEN 1
           WHEN [REPRESENT_2] LIKE ? OR [REPRESENT_2_NO_PREFIX] LIKE ? THEN 2
           WHEN [REPRESENT_3] LIKE ? OR [REPRESENT_3_NO_PREFIX] LIKE ? THEN 3
           ELSE NULL
         END AS representative_order,
         CASE
           WHEN [REPRESENT_1] LIKE ? THEN [REPRESENT_1]
           WHEN [REPRESENT_1_NO_PREFIX] LIKE ? THEN [REPRESENT_1_NO_PREFIX]
           WHEN [REPRESENT_2] LIKE ? THEN [REPRESENT_2]
           WHEN [REPRESENT_2_NO_PREFIX] LIKE ? THEN [REPRESENT_2_NO_PREFIX]
           WHEN [REPRESENT_3] LIKE ? THEN [REPRESENT_3]
           WHEN [REPRESENT_3_NO_PREFIX] LIKE ? THEN [REPRESENT_3_NO_PREFIX]
           ELSE NULL
         END AS representative_name
       FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       WHERE ${whereSql}
       ORDER BY [COMPANY_NAME]
       OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        like,
        ...whereParams,
        offset,
        pageSize,
      ],
    );

    const items = (Array.isArray(rows) ? rows : []).map((r) => ({
      memberCode: r.MEMBER_CODE,
      companyName: r.COMPANY_NAME,
      representativeName: r.representative_name,
      representativeOrder: r.representative_order,
      memberTypeCode: r.MEMBER_TYPE_CODE,
    }));

    return NextResponse.json({
      success: true,
      data: {
        query: qRaw,
        page,
        pageSize,
        totalPages,
        totalCompanies,
        counts: {
          byMemberType,
        },
        items,
      },
    });
  } catch (error) {
    console.error("Representative search error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการค้นหา" },
      { status: 500 },
    );
  }
}
