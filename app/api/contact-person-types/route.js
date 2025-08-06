import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

export async function GET() {
  try {
    const contactTypes = await query(`
      SELECT 
        id,
        type_code,
        type_name_th,
        type_name_en,
        is_active
      FROM MemberRegist_ContactPerson_TYPE 
      WHERE is_active = 1
      ORDER BY 
        CASE 
          WHEN type_code = 'MAIN' THEN 1
          WHEN type_code = 'OTHER' THEN 999
          ELSE 2
        END,
        type_name_th
    `);

    return NextResponse.json({
      success: true,
      data: contactTypes
    });
  } catch (error) {
    console.error('Error fetching contact person types:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทผู้ติดต่อ' 
      },
      { status: 500 }
    );
  }
}
