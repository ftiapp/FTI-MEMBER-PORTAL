import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term')?.trim() || '';
    
    if (!term || term.length < 1) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Search for provinces that match the term using the MB_PROVINCE table
    // Ensure no duplicates by using DISTINCT
    const provinces = await query(
      `SELECT DISTINCT 
         PROVINCE_CODE as id, 
         PROVINCE_NAME_TH as name_th, 
         PROVINCE_NAME_EN as name_en 
       FROM MB_PROVINCE 
       WHERE INACTIVE = 0 AND (PROVINCE_NAME_TH LIKE ? OR PROVINCE_NAME_EN LIKE ?) 
       ORDER BY 
         CASE 
           WHEN PROVINCE_NAME_TH LIKE ? THEN 1
           WHEN PROVINCE_NAME_EN LIKE ? THEN 2
           ELSE 3
         END,
         PROVINCE_NAME_TH
       LIMIT 10`,
      [`%${term}%`, `%${term}%`, `${term}%`, `${term}%`]
    );
    
    return NextResponse.json({
      success: true,
      data: provinces
    });
  } catch (error) {
    console.error('Error searching provinces:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการค้นหาจังหวัด' },
      { status: 500 }
    );
  }
}
