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

    // Step 2: ตรวจสอบเลขประจำตัวผู้เสียภาษีซ้ำ (ใช้ SELECT ... FOR UPDATE เพื่อลด lock time)
    const { taxId } = data;
    console.log('🔍 [AM API] Checking duplicate Tax ID:', taxId);
    
    const [existingMember] = await executeQuery(trx, 
      'SELECT status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1 FOR UPDATE', 
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

    // Step 3: Extract association email and phone from document delivery address (type 2)
    let associationEmail = data.associationEmail || '';
    let associationPhone = data.associationPhone || '';
    
    // If using multi-address structure, get email and phone from document delivery address (type 2)
    if (data.addresses) {
      try {
        const addresses = JSON.parse(data.addresses);
        const documentAddress = addresses['2']; // Document delivery address
        if (documentAddress) {
          associationEmail = documentAddress.email || associationEmail;
          associationPhone = documentAddress.phone || associationPhone;
        }
      } catch (error) {
        console.error('Error parsing addresses:', error);
      }
    }
    
    // Step 4: บันทึกข้อมูลหลัก
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
        associationEmail,
        associationPhone,
        data.factoryType || '',
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
        data.memberCount ? parseInt(data.memberCount, 10) : null,
      ]
    );
    const mainId = mainResult.insertId;
    console.log('✅ [AM API] Main record created with ID:', mainId);

    // Step 5: บันทึกข้อมูลที่อยู่ (Multi-address support)
    console.log('🏠 [AM API] Inserting address data...');
    if (data.addresses) {
      const addresses = JSON.parse(data.addresses);
      for (const [addressType, addressData] of Object.entries(addresses)) {
        if (addressData && Object.keys(addressData).length > 0) {
          await executeQuery(trx, 
            `INSERT INTO MemberRegist_AM_Address (
              main_id, address_number, building, moo, soi, street, sub_district, 
              district, province, postal_code, phone, email, website, address_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              mainId, 
              addressData.addressNumber || '',
              addressData.building || '',
              addressData.moo || '',
              addressData.soi || '',
              addressData.road || '',
              addressData.subDistrict || '',
              addressData.district || '',
              addressData.province || '',
              addressData.postalCode || '',
              addressData.phone || data.associationPhone || '',
              addressData.email || data.associationEmail || '',
              addressData.website || data.website || '',
              addressType
            ]
          );
        }
      }
    } else {
      // Fallback for old single address format
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_Address (
          main_id, address_number, moo, soi, street, sub_district, 
          district, province, postal_code, phone, email, website, address_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId, 
          data.addressNumber || '',
          data.moo || '',
          data.soi || '',
          data.road || '',
          data.subDistrict || '',
          data.district || '',
          data.province || '',
          data.postalCode || '',
          data.associationPhone || '',
          data.associationEmail || '',
          data.website || '',
          '2' // Default to document delivery address
        ]
      );
    }

    // Step 5: Insert Contact Persons (with type support)
    console.log('👥 [AM API] Inserting contact persons data...');
    if (data.contactPersons) {
      const contactPersons = JSON.parse(data.contactPersons);
      for (let index = 0; index < contactPersons.length; index++) {
        const contact = contactPersons[index];
        await executeQuery(trx,
          `INSERT INTO MemberRegist_AM_ContactPerson (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, type_contact_id, type_contact_name, type_contact_other_detail
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId, 
            contact.firstNameTh || '', 
            contact.lastNameTh || '', 
            contact.firstNameEn || '', 
            contact.lastNameEn || '', 
            contact.position || '', 
            contact.email || '', 
            contact.phone || '',
            contact.typeContactId || 'MAIN',
            contact.typeContactName || 'ผู้ประสานงานหลัก',
            contact.typeContactOtherDetail || null
          ]
        );
      }
    } else if (data.contactPerson) {
      // Fallback for old single contact person format
      const contactPerson = JSON.parse(data.contactPerson);
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_ContactPerson (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
          position, email, phone, type_contact_id, type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId, 
          contactPerson.firstNameTh || '', 
          contactPerson.lastNameTh || '', 
          contactPerson.firstNameEn || '', 
          contactPerson.lastNameEn || '', 
          contactPerson.position || '', 
          contactPerson.email || '', 
          contactPerson.phone || '',
          'MAIN',
          'ผู้ประสานงานหลัก',
          null
        ]
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
            rep.firstNameTh || '', 
            rep.lastNameTh || '', 
            rep.firstNameEn || '', 
            rep.lastNameEn || '', 
            rep.position || '', 
            rep.email || '', 
            rep.phone || '', 
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
    console.log('🔍 [AM API] Raw industrialGroupIds data:', data.industrialGroupIds);
    console.log('🔍 [AM API] Raw industrialGroupNames data:', data.industrialGroupNames);
    
    const industrialGroups = parseAndEnsureArray(data.industrialGroupIds);
    const industrialGroupNames = parseAndEnsureArray(data.industrialGroupNames);
    
    if (industrialGroups.length > 0) {
      for (let i = 0; i < industrialGroups.length; i++) {
        const groupId = industrialGroups[i];
        const groupName = industrialGroupNames[i] || 'ไม่ระบุ';
        console.log(`💾 [AM API] Inserting industrial group ID: ${groupId}, Name: ${groupName}`);
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`, 
          [mainId, groupId, groupName]
        );
      }
      console.log(`✅ [AM API] Inserted ${industrialGroups.length} industry groups with names`);
    } else {
      console.log('⚠️ [AM API] No industrial groups selected, inserting default');
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`, 
        [mainId, '000', 'ไม่ระบุ']
      );
    }

    // Step 10: บันทึกสภาจังหวัด
    console.log('🌏 [AM API] Inserting province chapters data...');
    console.log('🔍 [AM API] Raw provincialChapterIds data:', data.provincialChapterIds);
    console.log('🔍 [AM API] Raw provincialChapterNames data:', data.provincialChapterNames);
    
    const provincialChapters = parseAndEnsureArray(data.provincialChapterIds);
    const provincialChapterNames = parseAndEnsureArray(data.provincialChapterNames);
    
    if (provincialChapters.length > 0) {
      for (let i = 0; i < provincialChapters.length; i++) {
        const chapterId = provincialChapters[i];
        const chapterName = provincialChapterNames[i] || 'ไม่ระบุ';
        console.log(`💾 [AM API] Inserting provincial chapter ID: ${chapterId}, Name: ${chapterName}`);
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`, 
          [mainId, chapterId, chapterName]
        );
      }
      console.log(`✅ [AM API] Inserted ${provincialChapters.length} provincial chapters with names`);
    } else {
      console.log('⚠️ [AM API] No provincial chapters selected, inserting default');
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`, 
        [mainId, '000', 'ไม่ระบุ']
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
      } catch (error) {
        console.error(`❌ [AM API] Error saving document metadata for ${fieldName}:`, error);
      }
    }

    await commitTransaction(trx);
    console.log('🎉 [AM API] Transaction committed successfully');

    // บันทึก user log สำหรับการสมัครสมาชิก AM
    try {
      const logDetails = `TAX_ID: ${data.taxId} - ${data.companyName}`;
      await executeQuery(trx, 
        'INSERT INTO Member_portal_User_log (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [userId, 'AM_membership_submit', logDetails, request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
      );
      console.log('✅ [AM API] User log recorded successfully');
    } catch (logError) {
      console.error('❌ [AM API] Error recording user log:', logError.message);
    }

    // ลบ draft หลังจากสมัครสำเร็จ - ใช้ tax_id ที่บันทึกไว้ในตาราง
    const taxIdFromData = data.taxId;
    
    console.log('🗑️ [AM API] Attempting to delete draft...');
    console.log('🗑️ [AM API] taxId from data:', taxIdFromData);
    
    try {
      let deletedRows = 0;
      
      if (taxIdFromData) {
        // ลบ draft โดยใช้ tax_id ที่บันทึกไว้ในตาราง
        const deleteResult = await executeQuery(trx, 
          'DELETE FROM MemberRegist_AM_Draft WHERE tax_id = ? AND user_id = ?',
          [taxIdFromData, userId]
        );
        deletedRows = deleteResult.affectedRows || 0;
        console.log(`✅ [AM API] Draft deleted by tax_id: ${taxIdFromData}, affected rows: ${deletedRows}`);
      } else {
        console.warn(' [AM API] No taxId provided, cannot delete draft');
      }
    } catch (draftError) {
      console.error(' [AM API] Error deleting draft:', draftError.message);
      // ไม่ throw error เพราะการลบ draft ไม่ควรบล็อกการสมัครสำเร็จ
    }

    console.log(' [AM API] AM Membership submission completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'การสมัครสมาชิก AM สำเร็จ', 
      registrationId: mainId,
      documentsUploaded: Object.keys(uploadedDocuments).length,
      timestamp: new Date().toISOString()
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ [AM API] Error in AM membership submission:', error);
    
    if (trx) {
      await rollbackTransaction(trx);
    }
    
    // จัดการ lock wait timeout ด้วยข้อความที่ชัดเจน
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      return NextResponse.json({ 
        error: 'ระบบกำลังประมวลผลคำขออื่นอยู่ กรุณาลองใหม่อีกครั้งในอีกไม่กี่วินาที',
        retryAfter: 3
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก AM',
      details: error.message 
    }, { status: 500 });
  }
}