import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const userId = formData.get('userId');
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
    if (!userId || !companyName || !registrationNumber || !documentFile) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
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
       (user_id, company_name, company_type, registration_number, tax_id, address, province, postal_code, phone, website, Admin_Submit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [userId, companyName, companyType, registrationNumber, registrationNumber, address, province, postalCode, phone, website]
    );
    
    // Save document information to database
    await query(
      `INSERT INTO documents_Member 
       (user_id, document_type, file_name, file_path, status, Admin_Submit) 
       VALUES (?, ?, ?, ?, 'pending', 0)`,
      [userId, documentType || 'other', fileName, uploadResult.url]
    );
    
    // Log the activity
    await query(
      `INSERT INTO incentive_activity_logs 
       (agent_id, action, module, description, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'MEMBER_INFO_SUBMITTED',
        'member_verification',
        JSON.stringify({
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
