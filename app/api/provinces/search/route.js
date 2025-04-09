import { NextResponse } from 'next/server';
import { mssqlQuery } from '@/app/lib/mssql';

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
    
    // Query จากฐานข้อมูล MSSQL แบบเรียบง่าย ไม่ซ้ำกัน
    const provinces = await mssqlQuery(
      `SELECT DISTINCT TOP 10
         PROVINCE_CODE as id, 
         PROVINCE_NAME_TH as name_th, 
         PROVINCE_NAME_TH as name_en 
       FROM [FTI].[dbo].[MB_PROVINCE] 
       WHERE PROVINCE_NAME_TH LIKE ? AND PROVINCE_CODE NOT LIKE '%-%' 
       ORDER BY PROVINCE_NAME_TH`,
      [`%${term}%`]
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
