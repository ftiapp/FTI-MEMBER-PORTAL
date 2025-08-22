import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { mssqlQuery } from '@/app/lib/mssql';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const userId = formData.get('userId');
    const memberNumber = formData.get('memberNumber');
    const compPersonCode = formData.get('compPersonCode');
    const registCode = formData.get('registCode');
    let memberDate = formData.get('memberDate'); // optional: YYYY-MM-DD
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
    
    // Check if MEMBER_CODE is already used by another user (only check pending or approved records)
    const existingMemberOtherUser = await query(
      `SELECT * FROM companies_Member WHERE MEMBER_CODE = ? AND user_id != ? AND (Admin_Submit = 0 OR Admin_Submit = 1)`,
      [memberNumber, userId]
    );
    
    if (existingMemberOtherUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'รหัสสมาชิกนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว ไม่สามารถใช้ยืนยันตัวตนได้' },
        { status: 400 }
      );
    }
    
    // Check if current user has already submitted this MEMBER_CODE (only check pending or approved records)
    const existingMemberSameUser = await query(
      `SELECT * FROM companies_Member WHERE MEMBER_CODE = ? AND user_id = ? AND (Admin_Submit = 0 OR Admin_Submit = 1)`,
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
    
    // Try to fetch MEMBER_DATE from MSSQL if not provided
    if (!memberDate && compPersonCode && registCode) {
      try {
        const sql = `SELECT [MEMBER_DATE] FROM [FTI].[dbo].[MB_MEMBER] WHERE COMP_PERSON_CODE = @param0 AND REGIST_CODE = @param1`;
        const mres = await mssqlQuery(sql, [compPersonCode, registCode]);
        const rec = mres && Array.isArray(mres) ? mres[0] : null;
        if (rec && rec.MEMBER_DATE) {
          // Normalize to YYYY-MM-DD
          const d = new Date(rec.MEMBER_DATE);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            memberDate = `${yyyy}-${mm}-${dd}`;
          }
        }
      } catch (err) {
        console.error('Failed to fetch MEMBER_DATE from MSSQL:', err);
      }
    }

    // Save company information to database
    const companyResult = await query(
      `INSERT INTO companies_Member 
       (user_id, MEMBER_CODE, COMP_PERSON_CODE, REGIST_CODE, MEMBER_DATE, company_name, company_type, tax_id, Admin_Submit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [userId, memberNumber, compPersonCode, registCode, memberDate || null, companyName, memberType, taxId]
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
