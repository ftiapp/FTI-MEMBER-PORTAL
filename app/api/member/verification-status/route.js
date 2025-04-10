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
    
    // Get verification status from companies_Member table with full member data
    const companyResults = await query(
      `SELECT 
         id,
         user_id,
         MEMBER_CODE,
         company_name,
         company_type,
         registration_number,
         tax_id,
         address,
         province,
         postal_code,
         phone,
         website,
         Admin_Submit,
         reject_reason,
         admin_comment,
         created_at,
         updated_at
       FROM companies_Member 
       WHERE user_id = ? 
       ORDER BY id DESC 
       LIMIT 1`,
      [userId]
    );
    
    // Get verification status from documents_Member table
    const documentResults = await query(
      `SELECT 
         id,
         status,
         Admin_Submit,
         reject_reason
       FROM documents_Member 
       WHERE user_id = ? 
       ORDER BY id DESC 
       LIMIT 1`,
      [userId]
    );
    
    // Check if user has submitted verification
    const hasCompanySubmission = companyResults.length > 0;
    const hasDocumentSubmission = documentResults.length > 0;
    const submitted = hasCompanySubmission && hasDocumentSubmission;
    
    if (!submitted) {
      return NextResponse.json({
        submitted: false,
        approved: false,
        rejected: false,
        rejectReason: null
      });
    }
    
    // Check approval status
    const companyApproved = hasCompanySubmission && companyResults[0].Admin_Submit === 1;
    const documentApproved = hasDocumentSubmission && documentResults[0].Admin_Submit === 1;
    const approved = companyApproved && documentApproved;
    
    // Check rejection status
    const companyRejected = hasCompanySubmission && companyResults[0].Admin_Submit === 2;
    const documentRejected = hasDocumentSubmission && documentResults[0].Admin_Submit === 2;
    const rejected = companyRejected || documentRejected;
    
    // Get rejection reason (if any)
    let rejectReason = null;
    if (companyRejected && companyResults[0].reject_reason) {
      rejectReason = companyResults[0].reject_reason;
    } else if (documentRejected && documentResults[0].reject_reason) {
      rejectReason = documentResults[0].reject_reason;
    }
    
    // Get admin comment (if any)
    let adminComment = null;
    if (hasCompanySubmission && companyResults[0].admin_comment) {
      adminComment = companyResults[0].admin_comment;
    }
    
    // Include member data if approved
    let memberData = null;
    if (approved && companyResults.length > 0) {
      memberData = {
        ...companyResults[0],
        documents: documentResults
      };
    }
    
    return NextResponse.json({
      submitted,
      approved,
      rejected,
      rejectReason,
      adminComment,
      memberData
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะการยืนยันตัวตน' },
      { status: 500 }
    );
  }
}
