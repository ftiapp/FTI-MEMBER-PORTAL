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
    console.log('💾 [AC] Inserting main data...');
    const mainResult = await executeQuery(trx, 
      `INSERT INTO MemberRegist_AC_Main (
        user_id, company_name_th, company_name_en, tax_id, 
        company_email, company_phone, company_phone_extension, company_website, number_of_employees,
        registered_capital, production_capacity_value, production_capacity_unit,
        sales_domestic, sales_export, shareholder_thai_percent, shareholder_foreign_percent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        userId,
        data.companyName || '',
        data.companyNameEn || '',
        data.taxId,
        companyEmail,
        companyPhone,
        companyPhoneExtension,
        data.companyWebsite || '',
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
    console.log('✅ [AC] Main record created with ID:', mainId);

    // Step 5: Insert Addresses (Multi-address support)
    console.log('🏠 [AC] Inserting address data...');
    if (data.addresses) {
      const addresses = JSON.parse(data.addresses);
      for (const [addressType, addressData] of Object.entries(addresses)) {
        if (addressData && Object.keys(addressData).length > 0) {
          await executeQuery(trx, 
            `INSERT INTO MemberRegist_AC_Address (
              main_id, address_number, building, moo, soi, road, sub_district, 
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
              addressData.phone || data.companyPhone || '',
              addressData.email || data.companyEmail || '',
              addressData.website || data.companyWebsite || '',
              addressType
            ]
          );
        }
      }
    } else {
      // Fallback for old single address format
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AC_Address (
          main_id, address_number, moo, soi, road, sub_district, 
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
          data.companyPhone || '',
          data.companyEmail || '',
          data.companyWebsite || '',
          '2' // Default to document delivery address
        ]
      );
    }

    // Step 5: Insert Contact Persons (with type support)
    console.log('👤 [AC] Inserting contact persons...');
    if (data.contactPersons) {
      const contactPersons = JSON.parse(data.contactPersons);
      for (let index = 0; index < contactPersons.length; index++) {
        const contact = contactPersons[index];
        await executeQuery(trx,
          `INSERT INTO MemberRegist_AC_ContactPerson (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en, 
            position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            mainId, 
            contact.firstNameTh || '', 
            contact.lastNameTh || '', 
            contact.firstNameEn || '', 
            contact.lastNameEn || '', 
            contact.position || '', 
            contact.email || '', 
            contact.phone || '',
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
        `INSERT INTO MemberRegist_AC_ContactPerson (
          main_id, first_name_th, last_name_th, first_name_en, 
          last_name_en, position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId, 
          data.contactPersonFirstName || '',
          data.contactPersonLastName || '',
          data.contactPersonFirstNameEng || '',
          data.contactPersonLastNameEng || '',
          data.contactPersonPosition || '',
          data.contactPersonEmail || '',
          data.contactPersonPhone || '',
          data.contactPersonPhoneExtension || null,
          'MAIN',
          'ผู้ประสานงานหลัก',
          null
        ]
      );
    }

// Step 6: Insert Representatives
console.log('👥 [AC] Inserting representatives...');
if (data.representatives) {
  try {
    const representatives = JSON.parse(data.representatives);
    for (let index = 0; index < representatives.length; index++) {
      const rep = representatives[index];
      
      // ✅ เพิ่ม rep_order โดยใช้ index + 1 (เริ่มจาก 1)
      await executeQuery(trx,
        `INSERT INTO MemberRegist_AC_Representatives (
          main_id, first_name_th, last_name_th, first_name_en, 
          last_name_en, position, email, phone, phone_extension, rep_order, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mainId, 
          rep.firstNameTh || rep.firstNameThai || '', 
          rep.lastNameTh || rep.lastNameThai || '', 
          rep.firstNameEn || rep.firstNameEng || '',   
          rep.lastNameEn || rep.lastNameEng || '',    
          rep.position || '', 
          rep.email || '', 
          rep.phone || '', 
          rep.phoneExtension || null,
          index + 1, // ✅ rep_order เริ่มจาก 1, 2, 3...
          rep.isPrimary || false
        ]
      );
    }
    console.log(`✅ [AC] Inserted ${representatives.length} representatives with proper order`);
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
    console.log('🔍 [AC] Raw industrialGroupNames data:', data.industrialGroupNames);
    
    const industrialGroups = parseAndEnsureArray(data.industrialGroups, 'industrialGroups');
    const industrialGroupNames = parseAndEnsureArray(data.industrialGroupNames, 'industrialGroupNames');

    if (industrialGroups.length > 0) {
      for (let i = 0; i < industrialGroups.length; i++) {
        const groupId = industrialGroups[i];
        const groupName = industrialGroupNames[i] || 'ไม่ระบุ';
        console.log(`💾 [AC] Inserting industrial group ID: ${groupId}, Name: ${groupName}`);
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`, 
          [mainId, groupId, groupName]
        );
      }
      console.log(`✅ [AC] Inserted ${industrialGroups.length} industry groups with names`);
    } else {
      console.log('⚠️ [AC] No industrial groups selected, inserting default');
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?);`, 
        [mainId, '000', 'ไม่ระบุ']
      );
    }

    // Step 10: Insert Province Chapters
    console.log('🌍 [AC] Inserting provincial chapters...');
    
    // ✅ รองรับทั้ง provincialCouncils และ provincialChapters
    let provincialData = data.provincialChapters || data.provincialCouncils;
    let provincialNamesData = data.provincialChapterNames || data.provincialCouncilNames;
    
    console.log('🔍 [AC] Raw provincial data (provincialChapters):', data.provincialChapters);
    console.log('🔍 [AC] Raw provincial data (provincialCouncils):', data.provincialCouncils);
    console.log('🔍 [AC] Raw provincial names data:', provincialNamesData);
    console.log('🔍 [AC] Final provincial data used:', provincialData);
    
    const provincialChapters = parseAndEnsureArray(provincialData, 'provincialChapters');
    const provincialChapterNames = parseAndEnsureArray(provincialNamesData, 'provincialChapterNames');
    
    if (provincialChapters.length > 0) {
      for (let i = 0; i < provincialChapters.length; i++) {
        const chapterId = provincialChapters[i];
        const chapterName = provincialChapterNames[i] || 'ไม่ระบุ';
        console.log(`💾 [AC] Inserting provincial chapter ID: ${chapterId}, Name: ${chapterName}`);
        await executeQuery(trx, 
          `INSERT INTO MemberRegist_AC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`, 
          [mainId, chapterId, chapterName]
        );
      }
      console.log(`✅ [AC] Inserted ${provincialChapters.length} provincial chapters with names`);
    } else {
      console.log('⚠️ [AC] No provincial chapters selected, inserting default');
      await executeQuery(trx, 
        `INSERT INTO MemberRegist_AC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?);`, 
        [mainId, '000', 'ไม่ระบุ']
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
        'สมัครสมาชิก AC',
        userId
      ]
    );

    await commitTransaction(trx);
    console.log('🎉 [AC] Transaction committed successfully');

    // บันทึก user log สำหรับการสมัครสมาชิก AC
    try {
      const logDetails = `TAX_ID: ${data.taxId} - ${data.companyName}`;
      await executeQuery(trx, 
        'INSERT INTO Member_portal_User_log (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [userId, 'AC_membership_submit', logDetails, request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
      );
      console.log('✅ [AC API] User log recorded successfully');
    } catch (logError) {
      console.error('❌ [AC API] Error recording user log:', logError.message);
    }

    // ลบ draft หลังจากสมัครสำเร็จ
    const taxIdFromData = data.taxId;
    
    console.log('🗑️ [AC API] Attempting to delete draft...');
    console.log('🗑️ [AC API] taxId from data:', taxIdFromData);
    
    try {
      let deletedRows = 0;
      
      if (taxIdFromData) {
        const deleteResult = await executeQuery(trx, 
          'DELETE FROM MemberRegist_AC_Draft WHERE tax_id = ? AND user_id = ?',
          [taxIdFromData, userId]
        );
        deletedRows = deleteResult.affectedRows || 0;
        console.log(`✅ [AC API] Draft deleted by tax_id: ${taxIdFromData}, affected rows: ${deletedRows}`);
      } else {
        console.warn('⚠️ [AC API] No taxId provided, cannot delete draft');
      }
    } catch (draftError) {
      console.error('❌ [AC API] Error deleting draft:', draftError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'สมัครสมาชิก AC สำเร็จ',
      memberId: mainId
    });
  } catch (error) {
    console.error('❌ [AC] Error in AC membership submission:', error);
    
    if (trx) {
      await rollbackTransaction(trx);
      console.log('🔄 [AC] Transaction rolled back due to error');
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก AC',
      details: error.message 
    }, { status: 500 });
  }
}
