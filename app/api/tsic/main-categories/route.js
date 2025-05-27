import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db'; // Using path alias from jsconfig.json

export async function GET() {
  try {
    const query = `
      SELECT category_code, category_name, category_name_EN 
      FROM tsic_description 
      ORDER BY category_name ASC
    `;
    
    const [rows] = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Error fetching TSIC main categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch TSIC main categories' },
      { status: 500 }
    );
  }
}
