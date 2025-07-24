import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  let trx;
  
  try {
    console.log('🚀 [AM API] Starting membership submission...');
    
    // ตรวจสอบ session
    const session = await getSession();
    if (!session || !session.user) {
      console.log('❌ [AM API] Unauthorized access attempt');
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('👤 [AM API] User ID:', userId);
    
    // รับ FormData
    let formData;
    try {
      formData = await request.formData();
      console.log('✅ [AM API] FormData received successfully');
    } catch (formError) {
      console.error('❌ [AM API] Error parsing FormData:', formError);
      return NextResponse.json({ 
        error: 'ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้', 
        details: formError.message 
      }, { status: 400 });
    }
    
    // เริ่ม transaction
    trx = await beginTransaction();
    console.log('🔄 [AM API] Database transaction started');

    // Step 1: แยกข้อมูลและไฟล์จาก FormData
    const data = {};
    const files = {};
    
    console.log('📋 [AM API] Processing FormData entries...');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        // จัดการไฟล์ที่มีชื่อเดียวกันหลายไฟล์ (เช่น productionImages)
        if (files[key]) {
          if (!Array.isArray(files[key])) {
            files[key] = [files[key]];
          }
          files[key].push(value);
        } else {
          files[key] = value;
        }
        console.log(`📎 [AM API] File detected: ${key} - ${value.name} (${value.size} bytes)`);
      } else {
        data[key] = value;
        console.log(`📝 [AM API] Data field: ${key} = ${value}`);
      }
    }

    console.log('📊 [AM API] Files detected:', Object.keys(files));
    console.log('📋 [AM API] Data fields:', Object.keys(data));

    // Helper function to parse and ensure data is an array
    const parseAndEnsureArray = (input) => {
      if (!input) return [];
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return [input];
      }
    };

    // Step 2: ตรวจสอบเลขประจำตัวผู้เสียภาษีซ้ำ
    const { taxId } = data;
    console.log('🔍 [AM API] Checking duplicate Tax ID:', taxId);
    
    const [existingMember] = await executeQuery(trx, 
      'SELECT status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1', 
      [taxId]
    );

    if (existingMember) {
      await rollbackTransaction(trx);
      const message = existingMember.status === 0
        ? `คำขอสมัครสมาชิกของท่านสำหรับเลขประจำตัวผู้เสียภาษี ${taxId} อยู่ระหว่างการพิจารณา`
        : `เลขประจำตัวผู้เสียภาษี ${taxId} นี้ได้เป็นสมาชิกแล้ว`;
      console.log('❌ [AM API] Duplicate Tax ID found:', message);
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Step 3: บันทึกข้อมูลหลัก
    console.log('💾 [AM API] Inserting main data...');
    const mainResult = await executeQuery(trx, 
      `INSERT INTO MemberRegist_AM_Main (
        user_id, company_name_th, company_name_en, tax_id, 
        company_email, company_phone, factory_type, number_of_employees, 
        number_of_member, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        userId,
        data.associationName || '',
        data.associationNameEng || '',
        data.taxId,
        data.associationEmail || '',
        data.associationPhone || '',
        data.factoryType || '',
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
        data.memberCount ? parseInt(data.memberCount, 10) : null,
      ]
    );
    const mainId = mainResult.insertId;
    console.log('✅ [AM API] Main record created with ID:', mainId);

    // Step 4: บันทึกข้อมูลที่อยู่
    console.log('🏠 [AM API] Inserting address data...');
    await executeQuery(trx, 
      `INSERT INTO MemberRegist_AM_Address (main_id, address_number, moo, soi, street, sub_district, district, province, postal_code, phone, email, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [mainId, data.addressNumber, data.moo, data.soi, data.road, data.subDistrict, data.district, data.province, data.postalCode, data.associationPhone, data.associationEmail, data.website]
    );

    // Step 5: บันทึกข้อมูลผู้ติดต่อ
    if (data.contactPerson) {
      console.log('👥 [AM API] Inserting contact person data...');
      const contactPerson = JSON.parse(data.contactPerson);
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_ContactPerson (main_id, first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [mainId, contactPerson.firstNameTh, contactPerson.lastNameTh, contactPerson.firstNameEn, contactPerson.lastNameEn, contactPerson.position, contactPerson.email, contactPerson.phone]
      );
    }

    // Step 6: บันทึกข้อมูลผู้แทน
    if (data.representatives) {
      console.log('👤 [AM API] Inserting representatives data...');
      const representatives = JSON.parse(data.representatives);
      for (let index = 0; index < representatives.length; index++) {
        const rep = representatives[index];
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_Representatives (main_id, first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone, rep_order, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId, 
            rep.firstNameTh, 
            rep.lastNameTh, 
            rep.firstNameEn, 
            rep.lastNameEn, 
            rep.position, 
            rep.email, 
            rep.phone, 
            index + 1,
            rep.isPrimary ? 1 : 0
          ]
        );
      }
    }

    // Step 7: บันทึกประเภทธุรกิจ
    if (data.businessTypes) {
      console.log('🏢 [AM API] Inserting business types data...');
      const businessTypesObject = JSON.parse(data.businessTypes);
      const selectedTypes = Object.keys(businessTypesObject).filter(key => businessTypesObject[key] === true);
      
      for (const type of selectedTypes) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type) VALUES (?, ?);`, 
          [mainId, type]
        );
      }
    }
    
    if (data.otherBusinessTypeDetail) {
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, detail) VALUES (?, ?);`, 
        [mainId, data.otherBusinessTypeDetail]
      );
    }

    // Step 8: บันทึกข้อมูลผลิตภัณฑ์
    console.log('📦 [AM API] Inserting products data...');
    const products = parseAndEnsureArray(data.products);
    if (products.length > 0) {
      for (const product of products) {
        if (product.nameTh || product.nameEn) {
          await executeQuery(trx, 
            `INSERT INTO MemberRegist_AM_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`, 
            [mainId, product.nameTh || '', product.nameEn || '']
          );
        }
      }
    } else {
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`, 
        [mainId, 'ไม่ระบุ', 'Not specified']
      );
    }

    // Step 9: บันทึกกลุ่มอุตสาหกรรม
    console.log('🏭 [AM API] Inserting industry groups data...');
    const industrialGroups = parseAndEnsureArray(data.industrialGroupIds);
    if (industrialGroups.length > 0) {
      for (const groupId of industrialGroups) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id) VALUES (?, ?);`, 
          [mainId, groupId]
        );
      }
    } else {
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id) VALUES (?, ?);`, 
        [mainId, '000']
      );
    }

    // Step 10: บันทึกสภาจังหวัด
    console.log('🌏 [AM API] Inserting province chapters data...');
    const provincialChapters = parseAndEnsureArray(data.provincialChapterIds);
    if (provincialChapters.length > 0) {
      for (const chapterId of provincialChapters) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?);`, 
          [mainId, chapterId]
        );
      }
    } else {
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?);`, 
        [mainId, '000']
      );
    }

    // Step 11: อัปโหลดเอกสารไปยัง Cloudinary และบันทึกลงฐานข้อมูล
    console.log('📤 [AM API] Processing document uploads...');
    const uploadedDocuments = {};
    let uploadCount = 0;

    // ฟังก์ชันสำหรับอัปโหลดไฟล์เดี่ยว
    const uploadSingleFile = async (file, documentType, fileKey) => {
      try {
        console.log(`📤 [AM API] Uploading ${documentType}: ${file.name} (${file.size} bytes)`);
        
        const buffer = await file.arrayBuffer();
        const result = await uploadToCloudinary(
          Buffer.from(buffer), 
          file.name, 
          'FTI_PORTAL_AM_member_DOC'
        );
        
        if (result.success) {
          const docData = {
            document_type: documentType,
            file_name: file.name,
            file_path: result.url,
            file_size: file.size,
            mime_type: file.type,
            cloudinary_id: result.public_id,
            cloudinary_url: result.url
          };
          
          uploadedDocuments[fileKey] = docData;
          console.log(`✅ [AM API] Successfully uploaded ${documentType}: ${result.url}`);
          return docData;
        } else {
          console.error(`❌ [AM API] Failed to upload ${documentType}:`, result.error);
          return null;
        }
      } catch (uploadError) {
        console.error(`❌ [AM API] Error uploading ${documentType}:`, uploadError);
        return null;
      }
    };

    // อัปโหลดไฟล์แต่ละประเภท
    for (const [fieldName, fileValue] of Object.entries(files)) {
      if (Array.isArray(fileValue)) {
        // จัดการไฟล์หลายไฟล์ (เช่น productionImages)
        console.log(`📸 [AM API] Processing ${fileValue.length} files for ${fieldName}...`);
        for (let index = 0; index < fileValue.length; index++) {
          const file = fileValue[index];
          const documentKey = `${fieldName}_${index}`;
          const docData = await uploadSingleFile(file, fieldName, documentKey);
          if (docData) uploadCount++;
        }
      } else if (fileValue instanceof File) {
        // จัดการไฟล์เดี่ยว
        const docData = await uploadSingleFile(fileValue, fieldName, fieldName);
        if (docData) uploadCount++;
      }
    }

    // Step 12: บันทึก metadata ของเอกสารลงฐานข้อมูล
    console.log(`💾 [AM API] Inserting ${Object.keys(uploadedDocuments).length} documents into database`);
    for (const [fieldName, docData] of Object.entries(uploadedDocuments)) {
      try {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_Documents (main_id, document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId,
            docData.document_type,
            docData.file_name,
            docData.file_path,
            docData.file_size,
            docData.mime_type,
            docData.cloudinary_id,
            docData.cloudinary_url
          ]
        );
        console.log(`✅ [AM API] Document metadata saved for ${fieldName}`);
      } catch (dbError) {
        console.error(`❌ [AM API] Error saving document metadata for ${fieldName}:`, dbError);
      }
    }

    // Delete draft if this was a resumed application
    const draftId = formData.get('draftId');
    if (draftId) {
      try {
        await executeQuery(
          'DELETE FROM MemberRegist_AM_Draft WHERE id = ? AND user_id = ?',
          [draftId, userId]
        );
        console.log('🗑️ AM Draft deleted successfully after submission');
      } catch (draftError) {
        console.warn('⚠️ Could not delete AM draft:', draftError.message);
        // Continue with success - draft deletion is not critical
      }
    }

    await commitTransaction(trx);
    console.log('🎉 [AM API] Transaction committed successfully');

    const response = { 
      message: 'การสมัครสมาชิก AM สำเร็จ', 
      registrationId: mainId,
      documentsUploaded: uploadCount,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ [AM API] AM Membership submission completed successfully:', response);
    
    return NextResponse.json(response, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ [AM API] Error in AM membership submission:', error);
    
    if (connection) {
      await rollbackTransaction(connection);
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก AM',
      details: error.message 
    }, { status: 500 });
  }
}