import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to get TSIC categories
 * GET /api/member/get-tsic-codes
 */
export async function GET(request) {
  try {
    // Get search parameters from query params
    const { searchParams } = new URL(request.url);
    const categoryCode = searchParams.get('category_code');
    const searchQuery = searchParams.get('q') || '';
    
    // If category_code is provided, return TSIC codes for that category
    if (categoryCode) {
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
          tsic_code
        LIMIT 50
      `;
      
      const results = await query(sql, params);
      
      return NextResponse.json({ 
        success: true, 
        results 
      });
    } 
    // If no category_code, return all categories
    else {
      const sql = `
        SELECT 
          id,
          category_code,
          category_name,
          item_count
        FROM 
          tsic_description
        ORDER BY 
          category_code
      `;
      
      const results = await query(sql);
      
      return NextResponse.json({ 
        success: true, 
        results 
      });
    }
    
  } catch (error) {
    console.error('Error fetching TSIC data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรหัส TSIC' 
    }, { status: 500 });
  }
}