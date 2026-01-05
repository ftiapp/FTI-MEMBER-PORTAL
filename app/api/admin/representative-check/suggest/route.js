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

    const queryNewSchemaWithRep3 = `SELECT TOP (10) name
       FROM (
         SELECT [REPRESENT_1_FULLNAME_TH] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         UNION ALL
         SELECT [REPRESENT_2_FULLNAME_TH] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         UNION ALL
         SELECT [REPRESENT_3_FULLNAME_TH] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       ) x
       WHERE x.name IS NOT NULL
         AND LTRIM(RTRIM(x.name)) <> ''
         AND x.name LIKE ?
       GROUP BY x.name
       ORDER BY x.name`;

    const queryNewSchemaWithoutRep3 = `SELECT TOP (10) name
       FROM (
         SELECT [REPRESENT_1_FULLNAME_TH] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         UNION ALL
         SELECT [REPRESENT_2_FULLNAME_TH] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       ) x
       WHERE x.name IS NOT NULL
         AND LTRIM(RTRIM(x.name)) <> ''
         AND x.name LIKE ?
       GROUP BY x.name
       ORDER BY x.name`;

    const queryLegacyWithRep3 = `SELECT TOP (10) name
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
       ORDER BY x.name`;

    const queryLegacyWithoutRep3 = `SELECT TOP (10) name
       FROM (
         SELECT [REPRESENT_1] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
         UNION ALL
         SELECT [REPRESENT_2] AS name FROM [FTI].[dbo].[Q_MEMBER_ELECTION_RIGHT]
       ) x
       WHERE x.name IS NOT NULL
         AND LTRIM(RTRIM(x.name)) <> ''
         AND x.name LIKE ?
       GROUP BY x.name
       ORDER BY x.name`;

    let rows;
    try {
      rows = await mssqlQuery(queryNewSchemaWithRep3, [like]);
    } catch (error) {
      const msg = error?.message ? String(error.message) : "";
      if (msg.includes("Invalid column name 'REPRESENT_3_FULLNAME_TH'")) {
        rows = await mssqlQuery(queryNewSchemaWithoutRep3, [like]);
      } else if (msg.includes("Invalid column name 'REPRESENT_1_FULLNAME_TH'")) {
        // Fallback to legacy schema
        try {
          rows = await mssqlQuery(queryLegacyWithRep3, [like]);
        } catch (legacyError) {
          const legacyMsg = legacyError?.message ? String(legacyError.message) : "";
          if (legacyMsg.includes("Invalid column name 'REPRESENT_3'")) {
            rows = await mssqlQuery(queryLegacyWithoutRep3, [like]);
          } else {
            throw legacyError;
          }
        }
      } else {
        throw error;
      }
    }

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
