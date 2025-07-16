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
    
    let formData;
    try {
      formData = await request.formData();
      console.log('📥 [AC] FormData received successfully');
    } catch (formError) {
      console.error('❌ [AC] Error parsing FormData:', formError);
      return NextResponse.json({ 
        error: 'ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้', 
        details: formError.message 
      }, { status: 400 });
    }
    
    trx = await beginTransaction();
    console.log('🔄 [AC] Database transaction started');

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

    console.log('📁 [AC] Files detected:', Object.keys(files));
    console.log('📄 [AC] Data fields:', Object.keys(data));
    console.log('🔍 [AC] Raw data dump:', data);

    // Step 2: Check for duplicate Tax ID
    const { taxId } = data;
    if (!taxId) {
      await rollbackTransaction(trx);
      return NextResponse.json({ error: 'กรุณาระบุเลขประจำตัวผู้เสียภาษี' }, { status: 400 });
    }

    const [existingMember] = await executeQuery(trx, 
      'SELECT status FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1', 
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
    console.log('💾 [AC] Inserting main data...');
    const mainResult = await executeQuery(trx, 
      `INSERT INTO MemberRegist_AC_Main (
        user_id, company_name_th, company_name_en, tax_id, 
        company_email, company_phone, company_website, number_of_employees, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        userId,
        data.companyName || '',
        data.companyNameEn || '',
        data.taxId,
        data.companyEmail || '',
        data.companyPhone || '',
        data.companyWebsite || '',
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
      ]
    );
    const mainId = mainResult.insertId;
    console.log('✅ [AC] Main record created with ID:', mainId);

    // Step 4: Insert Address
    console.log('🏠 [AC] Inserting address data...');
    await executeQuery(trx, 
      `INSERT INTO MemberRegist_AC_Address (
        main_id, address_number, moo, soi, road, sub_district, 
        district, province, postal_code, phone, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        mainId, 
        data.addressNumber || '',
        data.moo || '',
        data.soi || '',
        data.road || '',  // ใช้ road ตาม column จริง
        data.subDistrict || '',
        data.district || '',
        data.province || '',
        data.postalCode || '',
        data.companyPhone || '',
        data.companyEmail || '',
        data.companyWebsite || ''
      ]
    );

    // Step 5: Insert Contact Person
    console.log('👤 [AC] Inserting contact person...');
    await executeQuery(trx, 
      `INSERT INTO MemberRegist_AC_ContactPerson (
        main_id, first_name_th, last_name_th, first_name_en, 
        last_name_en, position, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        mainId, 
        data.contactPersonFirstName || '',
        data.contactPersonLastName || '',
        data.contactPersonFirstNameEng || '',
        data.contactPersonLastNameEng || '',
        data.contactPersonPosition || '',
        data.contactPersonEmail || '',
        data.contactPersonPhone || ''
      ]
    );

    // Step 6: Insert Representatives
    console.log('👥 [AC] Inserting representatives...');
    if (data.representatives) {
      try {
        const representatives = JSON.parse(data.representatives);
        for (const rep of representatives) {
          // ✅ แก้ไข field mapping ให้ตรงกับ Frontend
          await executeQuery(trx,
            `INSERT INTO MemberRegist_AC_Representatives (
              main_id, first_name_th, last_name_th, first_name_en, 
              last_name_en, position, email, phone, is_primary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              mainId, 
              rep.firstNameThai || '', 
              rep.lastNameThai || '', 
              rep.firstNameEng || '',   // ✅ ใช้ firstNameEng แทน firstNameEnglish
              rep.lastNameEng || '',    // ✅ ใช้ lastNameEng แทน lastNameEnglish
              rep.position || '', 
              rep.email || '', 
              rep.phone || '', 
              rep.isPrimary || false
            ]
          );
        }
      } catch (repError) {
        console.error('❌ [AC] Error parsing representatives:', repError);
      }
    }

    // Helper functions for parsing data
    const parseProducts = (input) => {
      if (!input) return [];
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('❌ [AC] Error parsing products JSON:', e);
        return [];
      }
    };

    const parseAndEnsureArray = (input, fieldName = 'unknown') => {
      console.log(`🔍 [AC] parseAndEnsureArray for ${fieldName}:`, input, 'type:', typeof input);
      
      if (!input) {
        console.log(`⚠️ [AC] No input for ${fieldName}, returning empty array`);
        return [];
      }
      
      try {
        let parsed = input;
        
        // ถ้าเป็น string ให้ parse เป็น JSON
        if (typeof input === 'string') {
          parsed = JSON.parse(input);
        }
        
        // ถ้าไม่ใช่ array ให้แปลงเป็น array
        if (!Array.isArray(parsed)) {
          parsed = [parsed];
        }
        
        // แปลง array ของ objects เป็น array ของ IDs
        const ids = parsed.map(item => {
          if (typeof item === 'object' && item !== null) {
            // ถ้าเป็น object ให้ดึง id ออกมา
            return item.id || item.value || item;
          }
          return item;
        }).filter(id => id !== null && id !== undefined && id !== '');
        
        console.log(`✅ [AC] parseAndEnsureArray result for ${fieldName}:`, ids);
        return ids;
        
      } catch (e) {
        console.error(`❌ [AC] Error parsing array for ${fieldName}:`, e, 'input was:', input);
        // ถ้า parse ไม่ได้ให้คืนค่า input แบบ array
        return Array.isArray(input) ? input : [input].filter(item => item !== null && item !== undefined);
      }
    };

    // Step 7: Insert Business Types
    console.log('🏢 [AC] Inserting business types...');
    if (data.businessTypes) {
      try {
        const businessTypesObject = JSON.parse(data.businessTypes);
        const selectedTypes = Object.keys(businessTypesObject).filter(key => businessTypesObject[key] === true);
        
        for (const type of selectedTypes) {
          await executeQuery(trx, 
            `INSERT INTO MemberRegist_AC_BusinessTypes (main_id, business_type) VALUES (?, ?);`, 
            [mainId, type]
          );
        }
        console.log(`✅ [AC] Inserted ${selectedTypes.length} business types:`, selectedTypes);
      } catch (btError) {
        console.error('❌ [AC] Error parsing business types:', btError);
      }
    }

    if (data.otherBusinessTypeDetail) {
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AC_BusinessTypeOther (main_id, detail) VALUES (?, ?);`, 
        [mainId, data.otherBusinessTypeDetail]
      );
      console.log('✅ [AC] Inserted other business type detail:', data.otherBusinessTypeDetail);
    }

    // Step 8: Insert Products
    console.log('📦 [AC] Inserting products...');
    const products = parseProducts(data.products);
    if (products.length > 0) {
      for (const product of products) {
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AC_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`, 
          [mainId, product.nameTh || '', product.nameEn || '']
        );
      }
      console.log(`✅ [AC] Inserted ${products.length} products`);
    } else {
      // Default product if none provided
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AC_Products (main_id, name_th, name_en) VALUES (?, ?, ?);`, 
        [mainId, 'ไม่ระบุ', 'Not specified']
      );
      console.log('✅ [AC] Inserted default product');
    }

    // Step 9: Insert Industry Groups
    console.log('🏭 [AC] Inserting industry groups...');
console.log('🔍 [AC] Raw industrialGroups data:', data.industrialGroups);
const industrialGroups = parseAndEnsureArray(data.industrialGroups, 'industrialGroups');

if (industrialGroups.length > 0) {
  for (const groupId of industrialGroups) {
    console.log(`💾 [AC] Inserting industrial group ID: ${groupId}`);
    await executeQuery(trx, 
      `INSERT INTO MemberRegist_AC_IndustryGroups (main_id, industry_group_id) VALUES (?, ?);`, 
      [mainId, groupId]
    );
  }
  console.log(`✅ [AC] Inserted ${industrialGroups.length} industry groups:`, industrialGroups);
} else {
  console.log('⚠️ [AC] No industrial groups selected, inserting default');
  await executeQuery(trx, 
    `INSERT INTO MemberRegist_AC_IndustryGroups (main_id, industry_group_id) VALUES (?, ?);`, 
    [mainId, '000']
  );
}

    // Step 10: Insert Province Chapters
    console.log('🌍 [AC] Inserting provincial chapters...');
    console.log('🔍 [AC] Raw provincialChapters data:', data.provincialChapters);
    const provincialChapters = parseAndEnsureArray(data.provincialChapters, 'provincialChapters');
    
    if (provincialChapters.length > 0) {
      for (const chapterId of provincialChapters) {
        console.log(`💾 [AC] Inserting provincial chapter ID: ${chapterId}`);
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AC_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?);`, 
          [mainId, chapterId]
        );
      }
      console.log(`✅ [AC] Inserted ${provincialChapters.length} provincial chapters:`, provincialChapters);
    } else {
      console.log('⚠️ [AC] No provincial chapters selected, inserting default');
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AC_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?);`, 
        [mainId, '000']
      );
    }
    // Step 11: Handle Document Uploads
    console.log('📤 [AC] Processing document uploads...');
    const uploadedDocuments = {};

    for (const fieldName of Object.keys(files)) {
      const fileValue = files[fieldName];
      
      if (fieldName === 'productionImages' && Array.isArray(fileValue)) {
        console.log(`📸 [AC] Processing ${fileValue.length} production images...`);
        for (let index = 0; index < fileValue.length; index++) {
          const file = fileValue[index];
          try {
            const buffer = await file.arrayBuffer();
            const result = await uploadToCloudinary(Buffer.from(buffer), file.name, 'FTI_PORTAL_AC_member_DOC');
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
              console.log(`✅ [AC] Uploaded production image ${index + 1}: ${file.name}`);
            }
          } catch (uploadError) {
            console.error(`❌ [AC] Error uploading production image ${index + 1}:`, uploadError);
          }
        }
      } 
      else if (fileValue instanceof File) {
        console.log(`📄 [AC] Processing file: ${fieldName} -> ${fileValue.name}`);
        try {
          const buffer = await fileValue.arrayBuffer();
          const result = await uploadToCloudinary(Buffer.from(buffer), fileValue.name, 'FTI_PORTAL_AC_member_DOC');
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
            console.log(`✅ [AC] Uploaded file: ${fieldName} -> ${fileValue.name}`);
          }
        } catch (uploadError) {
          console.error(`❌ [AC] Error uploading file for ${fieldName}:`, uploadError);
        }
      }
    }

    console.log(`💾 [AC] Inserting ${Object.keys(uploadedDocuments).length} documents into database`);
    for (const documentKey in uploadedDocuments) {
      const doc = uploadedDocuments[documentKey];
      try {
        await executeQuery(trx,
          `INSERT INTO MemberRegist_AC_Documents (
            main_id, document_type, file_name, file_path, file_size, 
            mime_type, cloudinary_id, cloudinary_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [mainId, doc.document_type, doc.file_name, doc.file_path, doc.file_size, doc.mime_type, doc.cloudinary_id, doc.cloudinary_url]
        );
        console.log(`✅ [AC] Inserted document record: ${documentKey}`);
      } catch (dbError) {
        console.error(`❌ [AC] Error inserting document ${documentKey} into database:`, dbError);
      }
    }

    // Step 12: Add status log
    console.log('📝 [AC] Adding status log...');
    await executeQuery(trx,
      `INSERT INTO MemberRegist_AC_StatusLogs (main_id, status, note, created_by) VALUES (?, ?, ?, ?);`,
      [
        mainId,
        0, // Pending approval
        'สมัครสมาชิกใหม่',
        userId
      ]
    );

    await commitTransaction(trx);

    console.log('🎉 [AC] Membership submission completed successfully');
    console.log('📊 [AC] Final summary:', {
      mainId,
      industrialGroupsCount: industrialGroups.length,
      provincialChaptersCount: provincialChapters.length,
      documentsCount: Object.keys(uploadedDocuments).length,
      productsCount: products.length
    });

    return NextResponse.json({ 
      message: 'การสมัครสมาชิก AC สำเร็จ',
      registrationId: mainId,
      industrialGroupsInserted: industrialGroups.length,
      provincialChaptersInserted: provincialChapters.length,
      documentsUploaded: Object.keys(uploadedDocuments).length,
      timestamp: new Date().toISOString()
    }, { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [AC] Membership Submission Error:', error);
    console.error('❌ [AC] Error stack:', error.stack);
    if (trx) {
      await rollbackTransaction(trx);
      console.log('🔄 [AC] Transaction rolled back due to error');
    }
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}