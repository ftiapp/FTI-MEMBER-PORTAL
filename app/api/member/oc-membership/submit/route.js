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

    // Step 3: Insert Main Data
    const mainResult = await executeQuery(trx, 
      `INSERT INTO MemberRegist_OC_Main (user_id, company_name_th, company_name_en, tax_id, company_email, company_phone, factory_type, number_of_employees, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        userId,
        data.companyName,
        data.companyNameEng,
        data.taxId,
        data.companyEmail,
        data.companyPhone,
        data.factoryType,
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
      ]
    );
    const mainId = mainResult.insertId;
    console.log('✅ Main record created with ID:', mainId);

    // Step 4: Insert Address
    await executeQuery(trx, 
      `INSERT INTO MemberRegist_OC_Address (main_id, address_number, moo, soi, street, sub_district, district, province, postal_code, phone, email, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [mainId, data.addressNumber, data.moo, data.soi, data.street, data.subDistrict, data.district, data.province, data.postalCode, data.companyPhone, data.companyEmail, data.companyWebsite]
    );

    // Step 5: Insert Contact Person
    await executeQuery(trx, 
      `INSERT INTO MemberRegist_OC_ContactPerson (main_id, first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [mainId, data.contactPersonFirstName, data.contactPersonLastName, data.contactPersonFirstNameEng, data.contactPersonLastNameEng, data.contactPersonPosition, data.contactPersonEmail, data.contactPersonPhone]
    );

    // Step 6: Insert Representatives
    if (data.representatives) {
      const representatives = JSON.parse(data.representatives);
      for (let index = 0; index < representatives.length; index++) {
        const rep = representatives[index];
        await executeQuery(trx,
          `INSERT INTO MemberRegist_OC_Representatives (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, is_primary, rep_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [mainId, rep.firstNameThai, rep.lastNameThai, rep.firstNameEnglish, rep.lastNameEnglish, rep.position, rep.email, rep.phone, rep.isPrimary, index + 1]
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
    const industrialGroupIds = parseAndEnsureArray(data.industrialGroupIds);
    if (industrialGroupIds.length > 0) {
        for (const group of industrialGroupIds) {
            await executeQuery(trx, 
              `INSERT INTO MemberRegist_OC_IndustryGroups (main_id, industry_group_id) VALUES (?, ?);`, 
              [mainId, group]
            );
        }
    } else {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_IndustryGroups (main_id, industry_group_id) VALUES (?, ?);`, 
          [mainId, '000']
        );
    }

    // Step 10: Insert Province Chapters
    const provincialChapterIds = parseAndEnsureArray(data.provincialChapterIds);
    if (provincialChapterIds.length > 0) {
        for (const chapter of provincialChapterIds) {
            await executeQuery(trx, 
              `INSERT INTO MemberRegist_OC_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?);`, 
              [mainId, chapter]
            );
        }
    } else {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_OC_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?);`, 
          [mainId, '000']
        );
    }

    // ✅ Step 11: Handle Document Uploads
    console.log('📤 Processing document uploads...');
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