import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

/**
 * API endpoint to search for TSIC codes by category
 * GET /api/tsic-codes?category_code=XXX&q=YYY
 */
export async function GET(request) {
  try {
    // Get search parameters from query params
    const { searchParams } = new URL(request.url);
    const categoryCode = searchParams.get("category_code");
    const searchQuery = searchParams.get("q") || "";

    if (!categoryCode) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัสหมวดหมู่",
        },
        { status: 400 },
      );
    }

    let sql = `
      SELECT 
        id,
        category_order,
        tsic_code,
        description,
        positive_list
      FROM 
        tsic_categories
      WHERE 
        category_order = ?
    `;

    const params = [categoryCode];

    // Add search condition if query is provided
    if (searchQuery && searchQuery.length >= 2) {
      sql += ` AND (tsic_code LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    // Add order and limit
    sql += `
      ORDER BY 
        category_order, tsic_code
      LIMIT 50
    `;

    const results = await query(sql, params);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error searching TSIC codes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการค้นหารหัส TSIC",
      },
      { status: 500 },
    );
  }
}
