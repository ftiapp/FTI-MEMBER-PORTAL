import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  let trx;
  let uploadResult = null;
  
  try {
    console.log('--- Received IC Membership Submission ---');
    
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const userId = session.user.id;
    
    let formData;
    try {
      formData = await request.formData();
      
      // Debug: Log all form data keys
      console.log('FormData Keys:');
      for (const [key] of formData.entries()) {
        console.log(`${key}: ${formData.get(key)}`);
      }
      
    } catch (formError) {
      console.error('FormData Error:', formError);
      return NextResponse.json({ 
        error: 'ไม่สามารถประมวลผลข้อมูลที่ส่งมาได้', 
        details: formError.message 
      }, { status: 400 });
    }
    
    trx = await beginTransaction();

    // Extract data from FormData
    const data = {};
    const files = {};
    const products = JSON.parse(formData.get('products') || '[]');
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else if (key !== 'products') {
        data[key] = value;
      }
    }

    console.log('Extracted data:', data);
    console.log('Products:', products);

    // Insert main IC member data (without address fields)
    const result = await executeQuery(
      trx,
      `INSERT INTO MemberRegist_IC_Main (
        user_id, id_card_number, first_name_th, last_name_th, 
        first_name_en, last_name_en, phone, email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        data.idCardNumber,
        data.firstNameTh,
        data.lastNameTh,
        data.firstNameEn,
        data.lastNameEn,
        data.phone,
        data.email
      ]
    );
    
    const icMemberId = result.insertId;
    console.log('Created IC Member ID:', icMemberId);

    // Insert address to correct table with all fields (including street/road)
    await executeQuery(
      trx,
      `INSERT INTO MemberRegist_IC_Address (
        main_id, address_number, moo, soi, road,
        sub_district, district, province, postal_code,
        phone, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        icMemberId,
        data.addressNumber || '',
        data.moo || '',
        data.soi || '',
        data.road || '', // This should now receive the street data
        data.subDistrict || '',
        data.district || '',
        data.province || '',
        data.postalCode || '',
        data.phone || '',
        data.email || '',
        data.website || ''
      ]
    );

    console.log('Address saved with road:', data.road);

    // Handle business types with correct mapping
    if (data.businessTypes) {
      try {
        const businessTypes = JSON.parse(data.businessTypes) || [];
        console.log('Business types received:', businessTypes);
        
        // Map from frontend IDs to database values
        const businessTypeMap = {
          'manufacturer': 'manufacturer',
          'distributor': 'distributor', 
          'importer': 'importer',
          'exporter': 'exporter',
          'service': 'service_provider',
          'other': 'other'
        };
        
        for (const type of businessTypes) {
          if (type && businessTypeMap[type]) {
            const businessType = businessTypeMap[type];
            await executeQuery(
              trx,
              `INSERT INTO MemberRegist_IC_BusinessTypes (main_id, business_type) VALUES (?, ?)`,
              [icMemberId, businessType]
            );
            console.log('Saved business type:', businessType);
          }
        }
      } catch (error) {
        console.error('Error processing business types:', error);
      }
    }
    
    // Handle business category other - use correct table
    if (data.businessCategoryOther) {
      try {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_IC_BusinessTypeOther (main_id, other_type) VALUES (?, ?)`,
          [icMemberId, data.businessCategoryOther]
        );
        console.log('Saved other business category:', data.businessCategoryOther);
      } catch (error) {
        console.error('Error processing business category other:', error);
      }
    }

    // Insert products with correct field mapping
    if (products && products.length > 0) {
      console.log('Inserting products:', products);
      for (const product of products) {
        // Handle both possible field name formats
        const nameTh = product.nameTh || product.name_th || '';
        const nameEn = product.nameEn || product.name_en || '';
        
        if (nameTh.trim()) { // Only insert if Thai name is provided
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_Products (main_id, name_th, name_en) VALUES (?, ?, ?)`,
            [icMemberId, nameTh, nameEn]
          );
          console.log('Saved product:', { nameTh, nameEn });
        }
      }
    }

    // Insert representative
    if (data.representativeFirstNameTh) {
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_IC_Representatives (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en,
          phone, email, position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          icMemberId,
          data.representativeFirstNameTh || '',
          data.representativeLastNameTh || '',
          data.representativeFirstNameEn || '',
          data.representativeLastNameEn || '',
          data.representativePhone || '',
          data.representativeEmail || '',
          data.relationship || ''
        ]
      );
    }

    // Insert province chapters - use correct table and column names
    if (data.provinceChapters) {
      try {
        const provinceChapters = JSON.parse(data.provinceChapters) || [];
        console.log('Province chapters to save:', provinceChapters);
        
        if (provinceChapters.length === 0) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?)`,
            [icMemberId, '000']
          );
        } else {
          for (const chapterId of provinceChapters) {
            if (chapterId) {
              await executeQuery(
                trx,
                `INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?)`,
                [icMemberId, chapterId.toString()]
              );
              console.log('Saved province chapter:', chapterId);
            }
          }
        }
      } catch (error) {
        console.error('Error processing province chapters:', error);
      }
    }

    // Insert industry groups - use correct table and column names
    if (data.industryGroups) {
      try {
        const industryGroups = JSON.parse(data.industryGroups) || [];
        console.log('Industry groups to save:', industryGroups);
        
        if (industryGroups.length === 0) {
          await executeQuery(
            trx,
            `INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id) VALUES (?, ?)`,
            [icMemberId, '000']
          );
        } else {
          for (const groupId of industryGroups) {
            if (groupId) {
              await executeQuery(
                trx,
                `INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id) VALUES (?, ?)`,
                [icMemberId, groupId.toString()]
              );
              console.log('Saved industry group:', groupId);
            }
          }
        }
      } catch (error) {
        console.error('Error processing industry groups:', error);
      }
    }

    // Handle document upload
    if (files.idCardFile) {
      try {
        const fileBuffer = await files.idCardFile.arrayBuffer();
        uploadResult = await uploadToCloudinary(
          Buffer.from(fileBuffer),
          'id_card',
          `ic_member_${icMemberId}`
        );
        
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_IC_Documents (
            main_id, document_type, file_name, file_path, file_size, mime_type, cloudinary_id, cloudinary_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            icMemberId,
            'id_card',
            files.idCardFile.name,
            uploadResult.url,
            files.idCardFile.size,
            files.idCardFile.type,
            uploadResult.public_id,
            uploadResult.url
          ]
        );
        
        console.log('Document uploaded successfully:', uploadResult.url);
      } catch (error) {
        console.error('Document upload failed:', error);
        await rollbackTransaction(trx);
        return NextResponse.json(
          { error: 'Failed to upload document' },
          { status: 500 }
        );
      }
    }

    await commitTransaction(trx);
    
    console.log('IC Membership submission completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'ส่งแบบฟอร์มสมัครสมาชิกเรียบร้อยแล้ว',
      data: {
        memberId: icMemberId,
        document: {
          idCard: uploadResult ? uploadResult.url : null
        }
      }
    });

  } catch (error) {
    if (trx) await rollbackTransaction(trx);
    console.error('Error submitting IC membership:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      details: error.message
    }, { status: 500 });
  }
}