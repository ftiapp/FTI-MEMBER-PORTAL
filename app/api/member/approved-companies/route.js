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
    
    // Get all approved companies for this user with their document information
    const approvedCompanies = await query(
      `SELECT 
         c.id,
         c.user_id,
         c.MEMBER_CODE,
         c.company_name,
         c.company_type,
         c.tax_id,
         c.updated_at,
         c.Admin_Submit,
         c.admin_comment,
         d.file_path,
         d.file_name
       FROM companies_Member c
       LEFT JOIN documents_Member d ON c.MEMBER_CODE = d.MEMBER_CODE AND d.Admin_Submit = 1
       WHERE c.user_id = ? AND c.Admin_Submit = 1
       ORDER BY c.updated_at DESC`,
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
