import { NextResponse } from "next/server";
import { mssqlQuery } from "@/app/lib/mssql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT 
        MEMBER_MAIN_GROUP_CODE,
        MEMBER_GROUP_CODE,
        MEMBER_GROUP_NAME
      FROM 
        [FTI].[dbo].[MB_MEMBER_GROUP]
      WHERE 
        MEMBER_MAIN_GROUP_CODE = 200
    `;

    // Add search filter if provided
    if (search) {
      query += ` AND MEMBER_GROUP_NAME LIKE '%${search}%'`;
    }

    // Add ORDER BY and pagination
    query += `
      ORDER BY MEMBER_GROUP_NAME
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    // Execute query
    const results = await mssqlQuery(query);

    // Count total for pagination
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM [FTI].[dbo].[MB_MEMBER_GROUP]
      WHERE MEMBER_MAIN_GROUP_CODE = 200
    `;

    if (search) {
      countQuery += ` AND MEMBER_GROUP_NAME LIKE '%${search}%'`;
    }

    const countResults = await mssqlQuery(countQuery);
    const total = countResults[0].total;

    // Format the results
    const formattedResults = results.map((item) => ({
      id: item.MEMBER_GROUP_CODE,
      name: item.MEMBER_GROUP_NAME,
    }));

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: formattedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching province chapters:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสภาอุตสาหกรรมจังหวัด" },
      { status: 500 },
    );
  }
}
