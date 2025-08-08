import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  let trx;
  
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // ✅ ตรวจสอบ Content-Type และ FormData
    let formData;
    try {
      formData = await request.formData();
      console.log('📥 FormData received successfully');
    } catch (formError) {
      console.error('❌ Error parsing FormData:', formError);
      return NextResponse.json({ 
        error: 'ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้', 
        details: formError.message 
      }, { status: 400 });
    }
    
    trx = await beginTransaction();
    console.log('🔄 Database transaction started');

    // Step 1: Extract all data and files from FormData
    const data = {};
    const files = {};
    const productionImages = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key.startsWith('productionImages[')) {
          productionImages.push(value);
        } else {
          files[key] = value;
        }
      } else {
        data[key] = value;
      }
    }

    if (productionImages.length > 0) {
      files['productionImages'] = productionImages;
    }

    console.log('📁 Files detected:', Object.keys(files));
    console.log('📄 Data fields:', Object.keys(data));

    // Step 2: Check for duplicate Tax ID
    const { taxId } = data;
    const [existingMember] = await executeQuery(trx, 
      'SELECT status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1', 
      [taxId]
    );

    if (existingMember) {
      await rollbackTransaction(trx);
      const message = existingMember.status === 0
        ? `คำขอสมัครสมาชิกของท่านสำหรับเลขประจำตัวผู้เสียภาษี ${taxId} อยู่ระหว่างการพิจารณา`
        : `เลขประจำตัวผู้เสียภาษี ${taxId} นี้ได้เป็นสมาชิกแล้ว`;
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // Step 3: Extract company email and phone from document delivery address (type 2)
    let companyEmail = data.companyEmail || '';
    let companyPhone = data.companyPhone || '';
    let companyPhoneExtension = data.companyPhoneExtension || null;
    
    // If using multi-address structure, get email and phone from document delivery address (type 2)
    if (data.addresses) {
      try {
        const addresses = JSON.parse(data.addresses);
        const documentAddress = addresses['2']; // Document delivery address
        if (documentAddress) {
          companyEmail = documentAddress.email || companyEmail;
          companyPhone = documentAddress.phone || companyPhone;
          companyPhoneExtension = documentAddress.phoneExtension || companyPhoneExtension;
        }
      } catch (error) {
        console.error('Error parsing addresses:', error);
      }
    }
    
    // Step 4: Insert Main Data
    const mainResult = await executeQuery(trx, 
      `INSERT INTO MemberRegist_OC_Main (
        user_id, company_name_th, company_name_en, tax_id, company_email, company_phone, company_phone_extension,
        factory_type, number_of_employees, registered_capital, production_capacity_value, 
        production_capacity_unit, sales_domestic, sales_export, shareholder_thai_percent, 
        shareholder_foreign_percent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        userId,
        data.companyName,
        data.companyNameEng,
        data.taxId,
        companyEmail,
        companyPhone,
        companyPhoneExtension,
        data.factoryType,
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
        data.registeredCapital ? parseFloat(data.registeredCapital) : null,
        data.productionCapacityValue ? parseFloat(data.productionCapacityValue) : null,
        data.productionCapacityUnit || null,
        data.salesDomestic ? parseFloat(data.salesDomestic) : null,
        data.salesExport ? parseFloat(data.salesExport) : null,
        data.shareholderThaiPercent ? parseFloat(data.shareholderThaiPercent) : null,
        data.shareholderForeignPercent ? parseFloat(data.shareholderForeignPercent) : null,
      ]
    );
    const mainId = mainResult.insertId;
    console.log('✅ Main record created with ID:', mainId);

    // Step 5: Insert Addresses (3 types)
    if (data.addresses) {
      const addresses = JSON.parse(data.addresses);
      
      // Insert all three address types
      for (const addressType of ['1', '2', '3']) {
        const address = addresses[addressType];
        if (address) {
          await executeQuery(trx, 
            `INSERT INTO MemberRegist_OC_Address (
              main_id, address_number, building, moo, soi, street, 
              sub_district, district, province, postal_code, 
              phone, phone_extension, email, website, address_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              mainId, 
              address.addressNumber || '', 
              address.building || '', 
              address.moo || '', 
              address.soi || '', 
              address.street || '', 
              address.subDistrict || '', 
              address.district || '', 
              address.province || '', 
              address.postalCode || '', 
              address.phone || '', 
              address.phoneExtension || '',
              address.email || '', 
              address.website || '', 
              addressType
            ]
          );
        }
      }
    } else {
      // Fallback for old single address format
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_OC_Address (
          main_id, address_number, building, moo, soi, street, 
          sub_district, district, province, postal_code, 
          phone, phone_extension, email, website, address_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId, 
          data.addressNumber || '', 
          data.building || '', 
          data.moo || '', 
          data.soi || '', 
          data.street || '', 
          data.subDistrict || '', 
          data.district || '', 
          data.province || '', 
          data.postalCode || '', 
          data.companyPhone || '', 
          data.companyPhoneExtension || '',
          data.companyEmail || '', 
          data.companyWebsite || '', 
          '2' // Default to document delivery address
        ]
      );
    }

    // Step 5: Insert Contact Persons (with type support)
    if (data.contactPersons) {
      const contactPersons = JSON.parse(data.contactPersons);
      for (let index = 0; index < contactPersons.length; index++) {
        const contact = contactPersons[index];
        await executeQuery(trx,
          `INSERT INTO MemberRegist_OC_ContactPerson (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId, 
            contact.firstNameTh, 
            contact.lastNameTh, 
            contact.firstNameEn, 
            contact.lastNameEn, 
            contact.position, 
            contact.email, 
            contact.phone,
            contact.phoneExtension || null,
            contact.typeContactId || 'MAIN',
            contact.typeContactName || 'ผู้ประสานงานหลัก',
            contact.typeContactOtherDetail || null
          ]
        );
      }
    } else {
      // Fallback for old single contact person format
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_OC_ContactPerson (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
          position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId, 
          data.contactPersonFirstName, 
          data.contactPersonLastName, 
          data.contactPersonFirstNameEng, 
          data.contactPersonLastNameEng, 
          data.contactPersonPosition, 
          data.contactPersonEmail, 
          data.contactPersonPhone,
          data.contactPersonPhoneExtension || null,
          'MAIN',
          'ผู้ประสานงานหลัก',
          null
        ]
      );
    }

    // Step 6: Insert Representatives
    if (data.representatives) {
      const representatives = JSON.parse(data.representatives);
      for (let index = 0; index < representatives.length; index++) {
        const rep = representatives[index];
        await executeQuery(trx,
          `INSERT INTO MemberRegist_OC_Representatives (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, phone_extension, is_primary, rep_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [mainId, rep.firstNameThai, rep.lastNameThai, rep.firstNameEnglish, rep.lastNameEnglish, rep.position, rep.email, rep.phone, rep.phoneExtension || null, rep.isPrimary, index + 1]
        );
      }
    }

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

    // Step 7: Insert Business Types
    if (data.businessTypes) {
      const businessTypesObject = JSON.parse(data.businessTypes);
      const selectedTypes = Object.keys(businessTypesObject).filter(key => businessTypesObject[key] === true);
      
      for (const type of selectedTypes) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_BusinessTypes (main_id, business_type) VALUES (?, ?);`, 
          [mainId, type]
        );
      }
    }
    if (data.otherBusinessTypeDetail) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_BusinessTypeOther (main_id, detail) VALUES (?, ?);`, 
          [mainId, data.otherBusinessTypeDetail]
        );
    }

    // Step 8: Insert Products
    const products = parseAndEnsureArray(data.products);
    if (products.length > 0) {
      for (const product of products) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`, 
          [mainId, product.nameTh, product.nameEn]
        );
      }
    } else {
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_OC_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`, 
        [mainId, 'ไม่ระบุ', 'Not specified']
      );
    }

    // Step 9: Insert Industry Groups
    console.log('Inserting industry groups...');
    console.log('Raw industrialGroupIds data:', data.industrialGroupIds);
    console.log('Raw industrialGroupNames data:', data.industrialGroupNames);
    
    const industrialGroupIds = parseAndEnsureArray(data.industrialGroupIds);
    const industrialGroupNames = parseAndEnsureArray(data.industrialGroupNames);
    
    if (industrialGroupIds.length > 0) {
        for (let i = 0; i < industrialGroupIds.length; i++) {
            const groupId = industrialGroupIds[i];
            const groupName = industrialGroupNames[i] || 'ไม่ระบุ';
            console.log(`Inserting industrial group ID: ${groupId}, Name: ${groupName}`);
            await executeQuery(trx, 
              `INSERT INTO MemberRegist_OC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`, 
              [mainId, groupId, groupName]
            );
        }
        console.log(`Inserted ${industrialGroupIds.length} industry groups with names`);
    } else {
        console.log('No industrial groups selected, inserting default');
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`, 
          [mainId, '000', 'ไม่ระบุ']
        );
    }

    // Step 10: Insert Province Chapters
    console.log('Inserting provincial chapters...');
    console.log('Raw provincialChapterIds data:', data.provincialChapterIds);
    console.log('Raw provincialChapterNames data:', data.provincialChapterNames);
    
    const provincialChapterIds = parseAndEnsureArray(data.provincialChapterIds);
    const provincialChapterNames = parseAndEnsureArray(data.provincialChapterNames);
    
    if (provincialChapterIds.length > 0) {
        for (let i = 0; i < provincialChapterIds.length; i++) {
            const chapterId = provincialChapterIds[i];
            const chapterName = provincialChapterNames[i] || 'ไม่ระบุ';
            console.log(`Inserting provincial chapter ID: ${chapterId}, Name: ${chapterName}`);
            await executeQuery(trx, 
              `INSERT INTO MemberRegist_OC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`, 
              [mainId, chapterId, chapterName]
            );
        }
        console.log(`Inserted ${provincialChapterIds.length} provincial chapters with names`);
    } else {
        console.log('No provincial chapters selected, inserting default');
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`, 
          [mainId, '000', 'ไม่ระบุ']
        );
    }

    // Step 11: Handle Document Uploads
    console.log('Processing document uploads...');
    const uploadedDocuments = {};

    // Part 1: Upload files to Cloudinary
    for (const fieldName of Object.keys(files)) {
      const fileValue = files[fieldName];
      
      // ✅ จัดการ productionImages (multiple files)
      if (fieldName === 'productionImages' && Array.isArray(fileValue)) {
        console.log(`📷 Processing ${fileValue.length} production images`);
        
        for (let index = 0; index < fileValue.length; index++) {
          const file = fileValue[index];
          try {
            console.log(`📤 Uploading production image ${index + 1}: ${file.name}`);
            const buffer = await file.arrayBuffer();
            const result = await uploadToCloudinary(Buffer.from(buffer), file.name, 'FTI_PORTAL_OC_member_DOC');
            
            // ✅ ตรวจสอบผลลัพธ์การอัปโหลด
            if (result.success) {
              const documentKey = `productionImages_${index}`;
              uploadedDocuments[documentKey] = {
                document_type: 'productionImages',
                file_name: file.name,
                file_path: result.url,
                file_size: file.size,
                mime_type: file.type,
                cloudinary_id: result.public_id,
                cloudinary_url: result.url
              };
              console.log(`✅ Successfully uploaded production image ${index + 1}: ${result.url}`);
            } else {
              console.error(`❌ Failed to upload production image ${index + 1}:`, result.error);
            }

          } catch (uploadError) {
            console.error(`❌ Error uploading production image ${index + 1}:`, uploadError);
          }
        }
      } 
      // ✅ จัดการไฟล์เดี่ยว
      else if (fileValue instanceof File) {
        try {
          console.log(`📤 Uploading ${fieldName}: ${fileValue.name}`);
          const buffer = await fileValue.arrayBuffer();
          const result = await uploadToCloudinary(Buffer.from(buffer), fileValue.name, 'FTI_PORTAL_OC_member_DOC');
          
          // ✅ ตรวจสอบผลลัพธ์การอัปโหลด
          if (result.success) {
            uploadedDocuments[fieldName] = {
              document_type: fieldName,
              file_name: fileValue.name,
              file_path: result.url,
              file_size: fileValue.size,
              mime_type: fileValue.type,
              cloudinary_id: result.public_id,
              cloudinary_url: result.url
            };
            console.log(`✅ Successfully uploaded ${fieldName}: ${result.url}`);
          } else {
            console.error(`❌ Failed to upload ${fieldName}:`, result.error);
          }

        } catch (uploadError) {
          console.error(`❌ Error uploading file for ${fieldName}:`, uploadError);
        }
      }
    }

    // ✅ Part 2: Insert uploaded document info into the database
    console.log(`💾 Inserting ${Object.keys(uploadedDocuments).length} documents into database`);
    
    for (const documentKey in uploadedDocuments) {
      const doc = uploadedDocuments[documentKey];
      try {
        const insertResult = await executeQuery(trx,
          `INSERT INTO MemberRegist_OC_Documents 
            (main_id, document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId,
            doc.document_type,
            doc.file_name,
            doc.file_path,
            doc.file_size,
            doc.mime_type,
            doc.cloudinary_id,
            doc.cloudinary_url
          ]
        );
        
        console.log(`✅ Document inserted: ${doc.document_type} - ID: ${insertResult.insertId}`);
        
      } catch (dbError) {
        console.error(`❌ Error inserting document ${documentKey} into database:`, dbError);
        // Continue with other documents instead of failing completely
      }
    }

    // Step 12: Add status log
    await executeQuery(trx,
      `INSERT INTO MemberRegist_OC_StatusLogs (main_id, status, note, created_by) VALUES (?, ?, ?, ?);`,
      [
        mainId,
        0, // Pending approval
        'สมัครสมาชิกใหม่',
        userId
      ]
    );

    await commitTransaction(trx);
    console.log('🎉 [OC API] Transaction committed successfully');

    // บันทึก user log สำหรับการสมัครสมาชิก OC
    try {
      const logDetails = `TAX_ID: ${data.taxId} - ${data.companyName}`;
      await executeQuery(trx, 
        'INSERT INTO Member_portal_User_log (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [userId, 'OC_membership_submit', logDetails, request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
      );
      console.log('✅ [OC API] User log recorded successfully');
    } catch (logError) {
      console.error('❌ [OC API] Error recording user log:', logError.message);
    }

    // ลบ draft หลังจากสมัครสำเร็จ
    const taxIdFromData = data.taxId;
    
    console.log('🗑️ [OC API] Attempting to delete draft...');
    console.log('🗑️ [OC API] taxId from data:', taxIdFromData);
    
    try {
      let deletedRows = 0;
      
      if (taxIdFromData) {
        const deleteResult = await executeQuery(trx, 
          'DELETE FROM MemberRegist_OC_Draft WHERE tax_id = ? AND user_id = ?',
          [taxIdFromData, userId]
        );
        deletedRows = deleteResult.affectedRows || 0;
        console.log(`✅ [OC API] Draft deleted by tax_id: ${taxIdFromData}, affected rows: ${deletedRows}`);
      } else {
        console.warn('⚠️ [OC API] No taxId provided, cannot delete draft');
      }
    } catch (draftError) {
      console.error('❌ [OC API] Error deleting draft:', draftError.message);
    }

    console.log('🎉 OC Membership submission completed successfully');
    return NextResponse.json({ 
      message: 'การสมัครสมาชิก OC สำเร็จ', 
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
    console.error('❌ OC Membership Submission Error:', error);
    
    // ✅ Rollback transaction if it exists
    if (trx) {
      try {
        await rollbackTransaction(trx);
        console.log('🔄 Transaction rolled back successfully');
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError);
      }
    }
    
    // ✅ ส่ง JSON response ที่ถูกต้องเสมอ
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}