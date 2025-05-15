import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to get TSIC categories
 * GET /api/tsic-categories?q=search_term
 */
export async function GET(request) {
  try {
    // Get search parameters from query params
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    
    let sql = `
      SELECT 
        id,
        category_code,
        category_name,
        item_count
      FROM 
        tsic_description
    `;
    
    const params = [];
    
    // Add search condition if query is provided
    if (searchQuery && searchQuery.length >= 2) {
      sql += ` WHERE category_name LIKE ? OR category_code LIKE ?`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }
    
    // Add order
    sql += `
      ORDER BY 
        category_code
    `;
    
    const results = await query(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      results 
    });
    
  } catch (error) {
    console.error('Error fetching TSIC categories:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ TSIC' 
    }, { status: 500 });
  }
}