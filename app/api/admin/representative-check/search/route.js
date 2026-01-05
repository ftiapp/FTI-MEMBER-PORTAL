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

    const whereNewWithRep3 =
      "([REPRESENT_1_FULLNAME_TH] LIKE ? OR [REPRESENT_1_FULLNAME_EN] LIKE ? OR [REPRESENT_2_FULLNAME_TH] LIKE ? OR [REPRESENT_2_FULLNAME_EN] LIKE ? OR [REPRESENT_3_FULLNAME_TH] LIKE ? OR [REPRESENT_3_FULLNAME_EN] LIKE ?)";
    const whereNewWithoutRep3 =
      "([REPRESENT_1_FULLNAME_TH] LIKE ? OR [REPRESENT_1_FULLNAME_EN] LIKE ? OR [REPRESENT_2_FULLNAME_TH] LIKE ? OR [REPRESENT_2_FULLNAME_EN] LIKE ?)";

    const whereLegacyWithRep3 =
      "([REPRESENT_1] LIKE ? OR [REPRESENT_1_NO_PREFIX] LIKE ? OR [REPRESENT_2] LIKE ? OR [REPRESENT_2_NO_PREFIX] LIKE ? OR [REPRESENT_3] LIKE ? OR [REPRESENT_3_NO_PREFIX] LIKE ?)";
    const whereLegacyWithoutRep3 =
      "([REPRESENT_1] LIKE ? OR [REPRESENT_1_NO_PREFIX] LIKE ? OR [REPRESENT_2] LIKE ? OR [REPRESENT_2_NO_PREFIX] LIKE ?)";

    const params6 = [like, like, like, like, like, like];
    const params4 = [like, like, like, like];

    const isInvalidColumn = (err, col) => {
      const msg = err?.message ? String(err.message) : "";
      return msg.includes(`Invalid column name '${col}'`);
    };

    // Prefer new schema first
    let schema = "new"; // 'new' | 'legacy'
    let hasRep3 = true;
    let whereSql = whereNewWithRep3;
    let whereParams = params6;

    let totalRows;
    try {
      totalRows = await mssqlQuery(
        `SELECT COUNT(DISTINCT [MEMBER_CODE]) AS totalCompanies
         FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         WHERE ${whereSql}`,
        whereParams,
      );
    } catch (error) {
      // New schema but no REP3 -> drop rep3
      if (isInvalidColumn(error, "REPRESENT_3_FULLNAME_TH") || isInvalidColumn(error, "REPRESENT_3_FULLNAME_EN")) {
        hasRep3 = false;
        whereSql = whereNewWithoutRep3;
        whereParams = params4;
        totalRows = await mssqlQuery(
          `SELECT COUNT(DISTINCT [MEMBER_CODE]) AS totalCompanies
           FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
           WHERE ${whereSql}`,
          whereParams,
        );
      } else if (isInvalidColumn(error, "REPRESENT_1_FULLNAME_TH") || isInvalidColumn(error, "REPRESENT_1_FULLNAME_EN")) {
        // Fallback to legacy schema
        schema = "legacy";
        hasRep3 = true;
        whereSql = whereLegacyWithRep3;
        whereParams = params6;
        try {
          totalRows = await mssqlQuery(
            `SELECT COUNT(DISTINCT [MEMBER_CODE]) AS totalCompanies
             FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
             WHERE ${whereSql}`,
            whereParams,
          );
        } catch (legacyError) {
          if (isInvalidColumn(legacyError, "REPRESENT_3")) {
            hasRep3 = false;
            whereSql = whereLegacyWithoutRep3;
            whereParams = params4;
            totalRows = await mssqlQuery(
              `SELECT COUNT(DISTINCT [MEMBER_CODE]) AS totalCompanies
               FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
               WHERE ${whereSql}`,
              whereParams,
            );
          } else {
            throw legacyError;
          }
        }
      } else {
        throw error;
      }
    }

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

    const buildItemsQuery = ({ schema, hasRep3 }) => {
      if (schema === "new") {
        const repOrderCase = hasRep3
          ? `CASE
             WHEN [REPRESENT_1_FULLNAME_TH] LIKE ? OR [REPRESENT_1_FULLNAME_EN] LIKE ? THEN 1
             WHEN [REPRESENT_2_FULLNAME_TH] LIKE ? OR [REPRESENT_2_FULLNAME_EN] LIKE ? THEN 2
             WHEN [REPRESENT_3_FULLNAME_TH] LIKE ? OR [REPRESENT_3_FULLNAME_EN] LIKE ? THEN 3
             ELSE NULL
           END`
          : `CASE
             WHEN [REPRESENT_1_FULLNAME_TH] LIKE ? OR [REPRESENT_1_FULLNAME_EN] LIKE ? THEN 1
             WHEN [REPRESENT_2_FULLNAME_TH] LIKE ? OR [REPRESENT_2_FULLNAME_EN] LIKE ? THEN 2
             ELSE NULL
           END`;

        const repNameCase = hasRep3
          ? `CASE
             WHEN [REPRESENT_1_FULLNAME_TH] LIKE ? THEN [REPRESENT_1_FULLNAME_TH]
             WHEN [REPRESENT_1_FULLNAME_EN] LIKE ? THEN [REPRESENT_1_FULLNAME_EN]
             WHEN [REPRESENT_2_FULLNAME_TH] LIKE ? THEN [REPRESENT_2_FULLNAME_TH]
             WHEN [REPRESENT_2_FULLNAME_EN] LIKE ? THEN [REPRESENT_2_FULLNAME_EN]
             WHEN [REPRESENT_3_FULLNAME_TH] LIKE ? THEN [REPRESENT_3_FULLNAME_TH]
             WHEN [REPRESENT_3_FULLNAME_EN] LIKE ? THEN [REPRESENT_3_FULLNAME_EN]
             ELSE NULL
           END`
          : `CASE
             WHEN [REPRESENT_1_FULLNAME_TH] LIKE ? THEN [REPRESENT_1_FULLNAME_TH]
             WHEN [REPRESENT_1_FULLNAME_EN] LIKE ? THEN [REPRESENT_1_FULLNAME_EN]
             WHEN [REPRESENT_2_FULLNAME_TH] LIKE ? THEN [REPRESENT_2_FULLNAME_TH]
             WHEN [REPRESENT_2_FULLNAME_EN] LIKE ? THEN [REPRESENT_2_FULLNAME_EN]
             ELSE NULL
           END`;

        return `SELECT
           [MEMBER_CODE],
           [COMPANY_NAME],
           [MEMBER_TYPE_CODE],
           ${repOrderCase} AS representative_order,
           ${repNameCase} AS representative_name
         FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         WHERE ${whereSql}
         ORDER BY [COMPANY_NAME]
         OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
      }

      const repOrderCase = hasRep3
        ? `CASE
           WHEN [REPRESENT_1] LIKE ? OR [REPRESENT_1_NO_PREFIX] LIKE ? THEN 1
           WHEN [REPRESENT_2] LIKE ? OR [REPRESENT_2_NO_PREFIX] LIKE ? THEN 2
           WHEN [REPRESENT_3] LIKE ? OR [REPRESENT_3_NO_PREFIX] LIKE ? THEN 3
           ELSE NULL
         END`
        : `CASE
           WHEN [REPRESENT_1] LIKE ? OR [REPRESENT_1_NO_PREFIX] LIKE ? THEN 1
           WHEN [REPRESENT_2] LIKE ? OR [REPRESENT_2_NO_PREFIX] LIKE ? THEN 2
           ELSE NULL
         END`;

      const repNameCase = hasRep3
        ? `CASE
           WHEN [REPRESENT_1] LIKE ? THEN [REPRESENT_1]
           WHEN [REPRESENT_1_NO_PREFIX] LIKE ? THEN [REPRESENT_1_NO_PREFIX]
           WHEN [REPRESENT_2] LIKE ? THEN [REPRESENT_2]
           WHEN [REPRESENT_2_NO_PREFIX] LIKE ? THEN [REPRESENT_2_NO_PREFIX]
           WHEN [REPRESENT_3] LIKE ? THEN [REPRESENT_3]
           WHEN [REPRESENT_3_NO_PREFIX] LIKE ? THEN [REPRESENT_3_NO_PREFIX]
           ELSE NULL
         END`
        : `CASE
           WHEN [REPRESENT_1] LIKE ? THEN [REPRESENT_1]
           WHEN [REPRESENT_1_NO_PREFIX] LIKE ? THEN [REPRESENT_1_NO_PREFIX]
           WHEN [REPRESENT_2] LIKE ? THEN [REPRESENT_2]
           WHEN [REPRESENT_2_NO_PREFIX] LIKE ? THEN [REPRESENT_2_NO_PREFIX]
           ELSE NULL
         END`;

      return `SELECT
         [MEMBER_CODE],
         [COMPANY_NAME],
         [MEMBER_TYPE_CODE],
         ${repOrderCase} AS representative_order,
         ${repNameCase} AS representative_name
       FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       WHERE ${whereSql}
       ORDER BY [COMPANY_NAME]
       OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
    };

    // like params for CASE expressions
    const likeParams = schema === "new"
      ? (hasRep3
          ? [like, like, like, like, like, like, like, like, like, like, like, like]
          : [like, like, like, like, like, like, like, like])
      : (hasRep3
          ? [like, like, like, like, like, like, like, like, like, like, like, like]
          : [like, like, like, like, like, like, like, like]);

    const rows = await mssqlQuery(
      buildItemsQuery({ schema, hasRep3 }),
      [...likeParams, ...whereParams, offset, pageSize],
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
    const errorId = `rep_search_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    console.error("Representative search error:", errorId, error);

    const isProd = process.env.NODE_ENV === "production";
    const detail = error?.message ? String(error.message) : "unknown error";

    return NextResponse.json(
      {
        success: false,
        message: isProd ? "เกิดข้อผิดพลาดในการค้นหา" : `เกิดข้อผิดพลาดในการค้นหา: ${detail}`,
        errorId,
      },
      { status: 500 },
    );
  }
}
