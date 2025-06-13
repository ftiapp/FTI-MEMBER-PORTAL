import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    // Ensure params is awaited before destructuring in Next.js 13+
    const { categoryCode } = await Promise.resolve(params);
    
    if (!categoryCode) {
      return NextResponse.json(
        { success: false, message: 'Category code is required' },
        { status: 400 }
      );
    }
    
    const sql = `
      SELECT id, tsic_code, description, description_EN, positive_list
      FROM tsic_categories
      WHERE category_code = ?
      ORDER BY description ASC
    `;
    
    const rows = await query(sql, [categoryCode]);
    
    if (!rows) {
      return NextResponse.json(
        { success: false, message: 'No subcategories found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Error fetching TSIC subcategories:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch TSIC subcategories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
