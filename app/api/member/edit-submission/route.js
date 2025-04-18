import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST handler for editing a member verification submission
 * 
 * This endpoint allows users to edit and resubmit their rejected member verification submissions.
 * It also logs the edit action in the Member_portal_User_log table.
 */
export async function POST(request) {
  try {
    // Get user from cookies
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie.value);
    
    // Get form data
    const formData = await request.formData();
    const userId = formData.get('userId');
    const submissionId = formData.get('submissionId');
    const memberNumber = formData.get('memberNumber');
    const memberType = formData.get('memberType');
    const companyName = formData.get('companyName');
    const taxId = formData.get('taxId');
    const documentFile = formData.get('documentFile');
    
    // Verify that the submission belongs to the user
    if (user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้' },
        { status: 403 }
      );
    }
    
    // Check if the submission exists and is rejected
    const submissionCheck = await query(
      `SELECT * FROM companies_Member WHERE id = ? AND user_id = ? AND Admin_Submit = 2`,
      [submissionId, userId]
    );
    
    if (submissionCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลการยืนยันสมาชิกที่ถูกปฏิเสธ' },
        { status: 404 }
      );
    }
    
    // Process document file
    let filePath = '';
    if (documentFile) {
      const fileBuffer = await documentFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      const fileName = `${uuidv4()}_${documentFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'members');
      filePath = `/uploads/members/${fileName}`;
      
      await writeFile(path.join(uploadDir, fileName), buffer);
    }
    
    // Update the submission status back to pending
    await query(
      `UPDATE companies_Member 
       SET MEMBER_CODE = ?, 
           MEMBER_TYPE = ?, 
           company_name = ?, 
           TAX_ID = ?, 
           Admin_Submit = 0, 
           reject_reason = NULL,
           updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [memberNumber, memberType, companyName, taxId, submissionId, userId]
    );
    
    // Add new document
    if (filePath) {
      await query(
        `INSERT INTO documents_Member (user_id, MEMBER_CODE, file_name, file_path, status, uploaded_at) 
         VALUES (?, ?, ?, ?, 'pending', NOW())`,
        [userId, memberNumber, documentFile.name, filePath]
      );
    }
    
    // Log the edit action
    const userIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await query(
      `INSERT INTO Member_portal_User_log (user_id, action, details, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId, 
        'Edit_member_verification', 
        JSON.stringify({
          submissionId,
          memberNumber,
          timestamp: new Date().toISOString()
        }),
        userIp,
        userAgent
      ]
    );
    
    // Get the updated submission
    const updatedSubmission = {
      id: submissionId,
      userId,
      memberNumber,
      memberType,
      companyName,
      taxId,
      status: 'pending'
    };
    
    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลการยืนยันสมาชิกเรียบร้อยแล้ว',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Error editing member submission:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' },
      { status: 500 }
    );
  }
}
