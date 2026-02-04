import { NextResponse } from "next/server";

// Database configuration
const config = {
  user: process.env.MSSQL_USER || "itadmin",
  password: process.env.MSSQL_PASSWORD || "It#11044",
  server: process.env.MSSQL_SERVER || "203.151.40.31",
  database: process.env.MSSQL_DATABASE || "FTI",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function GET(req) {
  let pool;
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("term")?.trim() || "";

    console.log("Search term:", searchTerm);

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          companies: [],
        },
      });
    }

    // Dynamic import mssql
    const sql = (await import("mssql")).default;

    pool = await sql.connect(config);

    const searchPattern = `%${searchTerm}%`;
    const startWithPattern = `${searchTerm}%`;

    console.log("Search patterns:", { searchPattern, startWithPattern });

    const result = await pool
      .request()
      .input("searchPattern", sql.NVarChar, searchPattern)
      .input("startWithPattern", sql.NVarChar, startWithPattern).query(`
        SELECT TOP 10 
          [REGIST_CODE],
          [MEMBER_CODE],
          [MEMBER_TYPE_CODE],
          [COMP_PERSON_CODE],
          [TAX_ID],
          [COMPANY_NAME],
          [COMPANY_NAME_TH],
          [COMP_PERSON_NAME_EN]
        FROM [FTI].[dbo].[BI_MEMBER]
        WHERE [MEMBER_STATUS_CODE] = 'A'
          AND [MEMBER_MAIN_GROUP_CODE] = '000'
          AND (
            [MEMBER_CODE] LIKE @searchPattern OR
            [COMPANY_NAME_TH] LIKE @searchPattern OR
            [COMPANY_NAME] LIKE @searchPattern
          )
        ORDER BY
          CASE
            WHEN [COMPANY_NAME_TH] LIKE @startWithPattern THEN 1
            WHEN [COMPANY_NAME] LIKE @startWithPattern THEN 2
            WHEN [MEMBER_CODE] LIKE @startWithPattern THEN 3
            ELSE 4
          END,
          CHARINDEX(@searchPattern, [COMPANY_NAME_TH]),
          [COMPANY_NAME_TH]
      `);

    console.log("Query executed successfully");
    console.log("Records found:", result.recordset.length);

    // Map member type codes to their display values
    const mappedResults = result.recordset.map((record) => {
      let memberType = "";
      switch (record.MEMBER_TYPE_CODE) {
        case "11":
          memberType = "สน";
          break;
        case "12":
          memberType = "สส";
          break;
        case "21":
          memberType = "ทน";
          break;
        case "22":
          memberType = "ทบ";
          break;
        default:
          memberType = record.MEMBER_TYPE_CODE;
      }

      return {
        ...record,
        MEMBER_TYPE: memberType,
        MEMBER_TYPE_CODE: record.MEMBER_TYPE_CODE,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          companies: mappedResults,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch member data",
        error: error.message,
      },
      { status: 500 },
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}