import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

/**
 * GET handler for retrieving detailed member information
 * 
 * This endpoint returns comprehensive information about a specific member
 * including their company details and associated documents.
 */
export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }
    
    // Get member ID from query parameters
    const url = new URL(request.url);
    const memberId = url.searchParams.get('id');
    
    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุรหัสสมาชิก' },
        { status: 400 }
      );
    }
    
    // Get member details
    const memberResult = await query(
      `SELECT cm.*, u.email, u.name, u.firstname, u.lastname
       FROM companies_Member cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.id = ?`,
      [memberId]
    );
    
    if (memberResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลสมาชิก' },
        { status: 404 }
      );
    }
    
    const member = memberResult[0];
    
    // Get documents for the member
    const documents = await query(
      `SELECT id, file_name, file_path, status, Admin_Submit, reject_reason, uploaded_at, updated_at
       FROM documents_Member
       WHERE user_id = ?`,
      [member.user_id]
    );
    
    // Return member details with documents
    return NextResponse.json({
      success: true,
      data: {
        ...member,
        documents
      }
    });
  } catch (error) {
    console.error('Error fetching member details:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก' },
      { status: 500 }
    );
  }
}
