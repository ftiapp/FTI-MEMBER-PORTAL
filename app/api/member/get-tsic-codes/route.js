import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to get TSIC categories and pending requests
 * GET /api/member/get-tsic-codes?member_code=xxx
 */
export async function GET(request) {
  try {
    // Get search parameters from query params
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get('member_code');
    
    if (!memberCode) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาระบุรหัสสมาชิก' 
      }, { status: 400 });
    }

    // Get approved TSIC codes for the member from the view
    let approvedCodes = [];
    try {
      const [approvedResults] = await query(
        `SELECT 
          tsic_code,
          category_order,
          tsic_description,
          positive_list,
          category_name,
          created_at,
          updated_at
        FROM member_approved_tsic 
        WHERE member_code = ?`,
        [memberCode]
      );
      approvedCodes = approvedResults || [];
    } catch (error) {
      console.error('Error fetching approved TSIC codes:', error);
      // Continue with empty array if there's an error
    }

    // Get pending TSIC update requests for the member
    let pendingRequests = [];
    try {
      const [pendingResults] = await query(
        `SELECT 
          id,
          category_code,
          category_name,
          tsic_code,
          tsic_description,
          category_order,
          request_date,
          created_at
        FROM pending_tsic_updates 
        WHERE member_code = ? 
        AND status = 'pending' 
        ORDER BY request_date DESC`,
        [memberCode]
      );
      pendingRequests = pendingResults || [];
    } catch (error) {
      console.error('Error fetching pending TSIC requests:', error);
      // Continue with empty array if there's an error
    }

    return NextResponse.json({
      success: true,
      approvedCodes,
      pendingRequests
    });
    
  } catch (error) {
    console.error('Error in get-tsic-codes:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรหัส TSIC',
      error: error.message 
    }, { status: 500 });
  }
}