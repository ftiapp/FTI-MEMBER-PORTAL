import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function POST(request) {
  let trx;
  
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
        console.log(key);
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
    const products = JSON.parse(formData.get('products'));
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else if (key !== 'products') {
        data[key] = value;
      }
    }

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

    // Insert address to correct table with all fields
    await executeQuery(
      trx,
      `INSERT INTO MemberRegist_IC_Address (
        main_id, address_number, moo, soi, road,
        sub_district, district, province, postal_code,
        phone, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        icMemberId,
        data.addressNumber,
        data.moo,
        data.soi,
        data.road,
        data.subDistrict,
        data.district,
        data.province,
        data.postalCode,
        data.phone,
        data.email,
        data.website || ''
      ]
    );

    // Insert business types if exists
    if (data.businessTypes) {
      let businessTypes;
      try {
        businessTypes = JSON.parse(data.businessTypes);
        // แปลงเป็น array หากเป็น object
        if (businessTypes && typeof businessTypes === 'object' && !Array.isArray(businessTypes)) {
          businessTypes = Object.values(businessTypes);
        }
        
        if (Array.isArray(businessTypes)) {
          for (const type of businessTypes) {
            if (type) {
              await executeQuery(
                trx,
                'INSERT INTO MemberRegist_IC_BusinessTypes (main_id, business_type) VALUES (?, ?)',
                [icMemberId, type]
              );
            }
          }
        }
      } catch (error) {
        console.error('Error parsing businessTypes:', error);
      }
    }

    // Handle business category other
    if (data.businessTypes) {
      let businessTypes;
      try {
        businessTypes = JSON.parse(data.businessTypes);
        // แปลงเป็น array หากเป็น object
        if (businessTypes && typeof businessTypes === 'object' && !Array.isArray(businessTypes)) {
          businessTypes = Object.values(businessTypes);
        }
        
        if (Array.isArray(businessTypes) && businessTypes.includes('other') && data.businessCategoryOther) {
          await executeQuery(
            trx,
            `INSERT INTO ICmember_Business_Info (main_id, business_category_other) VALUES (?, ?)`,
            [icMemberId, data.businessCategoryOther]
          );
        }
      } catch (error) {
        console.error('Error parsing businessTypes:', error);
      }
    }

    // Insert products
    if (products && products.length > 0) {
      for (const product of products) {
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_IC_Products (main_id, name_th, name_en) VALUES (?, ?, ?)`,
          [
            icMemberId,
            product.name_th || product.nameTh || '',
            product.name_en || product.nameEn || ''
          ]
        );
      }
    }

    // Insert representative
    await executeQuery(
      trx,
      `INSERT INTO MemberRegist_IC_Representatives (
        main_id, first_name_th, last_name_th, first_name_en, last_name_en,
        phone, email, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        icMemberId,
        data.representativeFirstNameTh,
        data.representativeLastNameTh,
        data.representativeFirstNameEn,
        data.representativeLastNameEn,
        data.representativePhone,
        data.representativeEmail,
        data.relationship || ''
      ]
    );

    // Insert province chapters
    if (data.provinceChapters) {
      const provinceChapters = JSON.parse(data.provinceChapters);
      for (const chapter of provinceChapters) {
        await executeQuery(
          trx,
          `INSERT INTO ICmember_Province_Group (main_id, province_group_id) VALUES (?, ?)`,
          [icMemberId, chapter.id || chapter.province_group_id]
        );
      }
    }

    // Insert industry groups
    if (data.industryGroups) {
      const industryGroups = JSON.parse(data.industryGroups);
      for (const group of industryGroups) {
        await executeQuery(
          trx,
          `INSERT INTO ICmember_Industry_Group (main_id, industry_group_id) VALUES (?, ?)`,
          [icMemberId, group.id]
        );
      }
    }

    // Handle document upload
    if (files.idCardFile) {
      try {
        const fileBuffer = await files.idCardFile.arrayBuffer();
        const uploadResult = await uploadToCloudinary(
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
    
    return NextResponse.json({
      success: true,
      message: 'ส่งแบบฟอร์มสมัครสมาชิกเรียบร้อยแล้ว',
      data: {
        memberId: icMemberId,
        document: {
          idCard: uploadResult.url || null
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