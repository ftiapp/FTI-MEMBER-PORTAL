import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const userId = formData.get('userId');
    const memberNumber = formData.get('memberNumber');
    const memberType = formData.get('memberType');
    const companyName = formData.get('companyName');
    const companyType = formData.get('companyType');
    const registrationNumber = formData.get('registrationNumber');
    const taxId = formData.get('taxId');
    const address = formData.get('address');
    const province = formData.get('province');
    const postalCode = formData.get('postalCode');
    const phone = formData.get('phone');
    const website = formData.get('website');
    const documentType = formData.get('documentType');
    const documentFile = formData.get('documentFile');
    
    // Validate required fields
    if (!userId || !memberNumber || !memberType || !companyName || !taxId || !documentFile) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Check if MEMBER_CODE is already used by another user
    const existingMemberOtherUser = await query(
      `SELECT * FROM companies_Member WHERE MEMBER_CODE = ? AND user_id != ?`,
      [memberNumber, userId]
    );
    
    if (existingMemberOtherUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'รหัสสมาชิกนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว ไม่สามารถใช้ยืนยันตัวตนได้' },
        { status: 400 }
      );
    }
    
    // Check if current user has already submitted this MEMBER_CODE
    const existingMemberSameUser = await query(
      `SELECT * FROM companies_Member WHERE MEMBER_CODE = ? AND user_id = ?`,
      [memberNumber, userId]
    );
    
    if (existingMemberSameUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'คุณได้ยืนยันตัวตนด้วยรหัสสมาชิกนี้ไปแล้ว กรุณาใช้รหัสสมาชิกอื่น' },
        { status: 400 }
      );
    }
    
    // Upload document to Cloudinary
    const fileBuffer = await documentFile.arrayBuffer();
    const fileName = documentFile.name;
    
    const uploadResult = await uploadToCloudinary(
      Buffer.from(fileBuffer),
      fileName
    );
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถอัปโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }
    
    // Save company information to database
    const companyResult = await query(
      `INSERT INTO companies_Member 
       (user_id, MEMBER_CODE, company_name, company_type, tax_id, Admin_Submit) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, memberNumber, companyName, memberType, taxId]
    );
    
    // Save document information to database
    await query(
      `INSERT INTO documents_Member 
       (user_id, MEMBER_CODE, document_type, file_name, file_path, status, Admin_Submit) 
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      [userId, memberNumber, documentType || 'other', fileName, uploadResult.url]
    );
    
    // Log the activity
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        'member_verification',
        JSON.stringify({
          action: 'MEMBER_INFO_SUBMITTED',
          companyName,
          documentType: documentType || 'other',
          timestamp: new Date().toISOString()
        }),
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลสำเร็จ',
      companyId: companyResult.insertId
    });
  } catch (error) {
    console.error('Error submitting member info:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  }
}
