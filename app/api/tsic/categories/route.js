import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

/**
 * API endpoint to get TSIC categories
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search") || "";

    // Build query to get main categories from tsic_description
    let sql = `
      SELECT id, category_code, category_name, category_name_EN, item_count
      FROM tsic_description
      WHERE 1=1
    `;

    const queryParams = [];

    // Add search filter if provided
    if (searchTerm) {
      sql += ` AND (category_name LIKE ? OR category_name_EN LIKE ? OR category_code LIKE ?)`;
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Add order by
    sql += " ORDER BY category_code";

    // Execute query
    const categories = await query(sql, queryParams);

    // Return the results
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching TSIC categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ TSIC กรุณาลองใหม่อีกครั้ง",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
