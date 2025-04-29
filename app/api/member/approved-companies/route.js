import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { jwtVerify } from 'jose';

export async function GET(request) {
  try {
    // Get the current user ID from the request query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ไม่ได้ระบุ userId' },
        { status: 400 }
      );
    }
    
    // Get all approved companies for this user
    const approvedCompanies = await query(
      `SELECT 
         id,
         user_id,
         MEMBER_CODE,
         company_name,
         company_type,
         tax_id,
         updated_at,
         Admin_Submit,
         admin_comment
       FROM companies_Member 
       WHERE user_id = ? AND Admin_Submit = 1
       ORDER BY updated_at DESC`,
      [userId]
    );
    
    return NextResponse.json({
      companies: approvedCompanies
    });
  } catch (error) {
    console.error('Error fetching approved companies:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัทที่ได้รับการอนุมัติ' },
      { status: 500 }
    );
  }
}
