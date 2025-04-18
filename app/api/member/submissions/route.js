import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ไม่ได้ระบุ userId' },
        { status: 400 }
      );
    }
    
    // Get all submissions for this user with document information
    const submissions = await query(
      `SELECT 
         c.id,
         c.user_id,
         c.MEMBER_CODE,
         c.company_name,
         c.company_type,
         c.tax_id,
         c.Admin_Submit,
         c.reject_reason,
         c.admin_comment,
         c.created_at,
         c.updated_at,
         d.id AS document_id,
         d.file_name,
         d.file_path,
         d.status AS document_status,
         d.Admin_Submit AS document_admin_submit,
         d.reject_reason AS document_reject_reason
       FROM companies_Member c
       LEFT JOIN documents_Member d ON c.user_id = d.user_id AND c.MEMBER_CODE = d.MEMBER_CODE
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Error fetching member submissions:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการยืนยันสมาชิก' },
      { status: 500 }
    );
  }
}
