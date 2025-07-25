import { NextResponse } from 'next/server';
import { initPool } from '../../../lib/db';

export async function GET() {
  try {
    // Initialize database pool
    const pool = await initPool();
    
    // เปลี่ยนจากตาราง tsic_description เป็น tsic_categories
    // และใช้ DISTINCT เพื่อให้ได้หมวดหมู่ใหญ่ที่ไม่ซ้ำกัน
    const query = `
      SELECT DISTINCT category_code, 
                      MAX(description) as category_name, 
                      MAX(description_EN) as category_name_EN 
      FROM tsic_categories 
      WHERE category_code != '00' 
      GROUP BY category_code 
      ORDER BY category_code ASC
    `;
    
    console.log('Executing main categories query:', query);
    const [rows] = await pool.query(query);
    console.log('Main categories result:', rows);
    
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
