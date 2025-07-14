import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const sql = `
      SELECT id, business_type_name as name_th, business_type_name as name_en 
      FROM Regist_Membership_business_types
      ORDER BY business_type_name ASC
    `;
    
    const result = await query(sql);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching business types:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทธุรกิจ' },
      { status: 500 }
    );
  }
}
