import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to get category codes for a list of TSIC codes
 */
export async function POST(request) {
  try {
    const { tsicCodes } = await request.json();
    
    if (!Array.isArray(tsicCodes) || tsicCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุรหัส TSIC อย่างน้อย 1 รหัส' },
        { status: 400 }
      );
    }
    
    // Create placeholders for the SQL query
    const placeholders = tsicCodes.map(() => '?').join(',');
    
    // Query to get category codes for each TSIC code
    const sql = `
      SELECT tsic_code, category_code 
      FROM tsic_categories 
      WHERE tsic_code IN (${placeholders})
    `;
    
    const results = await query(sql, tsicCodes);
    
    // Create a mapping of TSIC code to category code
    const categoryMap = {};
    
    for (const result of results) {
      categoryMap[result.tsic_code] = result.category_code;
    }
    
    // For any TSIC code that wasn't found, use the first two digits as the category code
    for (const tsicCode of tsicCodes) {
      if (!categoryMap[tsicCode]) {
        categoryMap[tsicCode] = tsicCode.substring(0, 2);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: categoryMap
    });
    
  } catch (error) {
    console.error('Error getting categories for TSIC codes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ของรหัส TSIC',
        error: error.message
      },
      { status: 500 }
    );
  }
}
