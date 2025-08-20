import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

export async function GET(request, { params }) {
  try {
    console.log('🚀 [AM Summary API] Starting data fetch...');
    
    // ตรวจสอบ session
    const session = await getSession();
    if (!session || !session.user) {
      console.log('❌ [AM Summary API] Unauthorized access attempt');
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { id } = params;
    console.log('📋 [AM Summary API] Fetching data for ID:', id);

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบรหัสเอกสารสมัครสมาชิก' 
      }, { status: 400 });
    }

    // ดึงข้อมูลหลัก
    const [mainData] = await executeQuery(
      `SELECT 
        m.*,
        DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') as formatted_created_at
      FROM MemberRegist_AM_Main m 
      WHERE m.id = ? AND m.user_id = ?`,
      [id, session.user.id]
    );

    if (!mainData) {
      console.log('❌ [AM Summary API] No data found for ID:', id);
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลเอกสารสมัครสมาชิก' 
      }, { status: 404 });
    }

    console.log('✅ [AM Summary API] Main data found for:', mainData.company_name_th);

    // ดึงข้อมูลที่อยู่
    const addresses = await executeQuery(
      `SELECT * FROM MemberRegist_AM_Address WHERE main_id = ? ORDER BY address_type`,
      [id]
    );

    // ดึงข้อมูลผู้ติดต่อ
    const contactPersons = await executeQuery(
      `SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ? ORDER BY id`,
      [id]
    );

    // ดึงข้อมูลผู้แทน
    const representatives = await executeQuery(
      `SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ? ORDER BY rep_order`,
      [id]
    );

    // ดึงข้อมูลประเภทธุรกิจ
    const businessTypes = await executeQuery(
      `SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลประเภทธุรกิจอื่นๆ
    const [otherBusinessType] = await executeQuery(
      `SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลผลิตภัณฑ์
    const products = await executeQuery(
      `SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลกลุ่มอุตสาหกรรม
    const industryGroups = await executeQuery(
      `SELECT * FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลสภาจังหวัด
    const provinceChapters = await executeQuery(
      `SELECT * FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลเอกสาร
    const documents = await executeQuery(
      `SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูล lookup สำหรับ industrial groups
    const allIndustrialGroups = await executeQuery(
      'SELECT id, name_th, name_en FROM industrial_groups ORDER BY name_th'
    );

    // ดึงข้อมูล lookup สำหรับ provincial chapters
    const allProvincialChapters = await executeQuery(
      'SELECT id, name_th, name_en FROM provincial_chapters ORDER BY name_th'
    );

    console.log('📊 [AM Summary API] Data collection completed');
    console.log('📊 [AM Summary API] Addresses:', addresses.length);
    console.log('📊 [AM Summary API] Contact persons:', contactPersons.length);
    console.log('📊 [AM Summary API] Representatives:', representatives.length);
    console.log('📊 [AM Summary API] Documents:', documents.length);

    // จัดรูปแบบข้อมูลที่อยู่
    const formattedAddresses = {};
    addresses.forEach(addr => {
      formattedAddresses[addr.address_type] = {
        addressNumber: addr.address_number,
        building: addr.building,
        moo: addr.moo,
        soi: addr.soi,
        street: addr.street,
        road: addr.street, // เพื่อความเข้ากันได้
        subDistrict: addr.sub_district,
        district: addr.district,
        province: addr.province,
        postalCode: addr.postal_code,
        phone: addr.phone,
        phoneExtension: addr.phone_extension,
        email: addr.email,
        website: addr.website
      };
    });

    // จัดรูปแบบประเภทธุรกิจ
    const formattedBusinessTypes = {};
    businessTypes.forEach(bt => {
      formattedBusinessTypes[bt.business_type] = true;
    });

    // จัดรูปแบบเอกสาร
    const formattedDocuments = {};
    documents.forEach(doc => {
      formattedDocuments[doc.document_type] = {
        name: doc.file_name,
        file_name: doc.file_name,
        file_path: doc.file_path,
        cloudinary_url: doc.cloudinary_url,
        fileUrl: doc.cloudinary_url || doc.file_path
      };
    });

    // รวมข้อมูลทั้งหมด
    const responseData = {
      // ข้อมูลหลักจากตาราง MemberRegist_AM_Main
      ...mainData,
      
      // Mapping field names สำหรับความเข้ากันได้
      associationName: mainData.company_name_th,
      associationNameEn: mainData.company_name_en,
      associationNameEng: mainData.company_name_en,
      taxId: mainData.tax_id,
      memberCount: mainData.number_of_member,
      numberOfEmployees: mainData.number_of_employees,
      registeredCapital: mainData.registered_capital,
      productionCapacityValue: mainData.production_capacity_value,
      productionCapacityUnit: mainData.production_capacity_unit,
      salesDomestic: mainData.sales_domestic,
      salesExport: mainData.sales_export,
      shareholderThaiPercent: mainData.shareholder_thai_percent,
      shareholderForeignPercent: mainData.shareholder_foreign_percent,
      factoryType: mainData.factory_type,
      
      // ข้อมูลที่อยู่
      addresses: formattedAddresses,
      
      // ข้อมูลผู้ติดต่อ
      contactPersons: contactPersons,
      
      // ข้อมูลผู้แทน
      representatives: representatives,
      
      // ข้อมูลประเภทธุรกิจ
      businessTypes: formattedBusinessTypes,
      otherBusinessTypeDetail: otherBusinessType?.detail,
      
      // ข้อมูลผลิตภัณฑ์
      products: products,
      
      // ข้อมูลกลุ่มอุตสาหกรรม (IDs สำหรับ lookup)
      industrialGroups: industryGroups.map(ig => ig.industry_group_id),
      industrialGroupIds: industryGroups.map(ig => ig.industry_group_id),
      
      // ข้อมูลสภาจังหวัด (IDs สำหรับ lookup)
      provincialChapters: provinceChapters.map(pc => pc.province_chapter_id),
      provincialChapterIds: provinceChapters.map(pc => pc.province_chapter_id),
      
      // เอกสารแนบ
      ...formattedDocuments,
      
      // วันที่สร้าง
      createdAt: mainData.formatted_created_at || mainData.created_at
    };

    // หากไม่มีที่อยู่แบบ multi-address ให้ใช้ข้อมูลจากที่อยู่แรก (fallback)
    if (addresses.length > 0 && Object.keys(formattedAddresses).length > 0) {
      const firstAddress = addresses[0];
      responseData.addressNumber = firstAddress.address_number;
      responseData.moo = firstAddress.moo;
      responseData.soi = firstAddress.soi;
      responseData.street = firstAddress.street;
      responseData.road = firstAddress.street;
      responseData.subDistrict = firstAddress.sub_district;
      responseData.district = firstAddress.district;
      responseData.province = firstAddress.province;
      responseData.postalCode = firstAddress.postal_code;
      responseData.associationEmail = firstAddress.email || mainData.company_email;
      responseData.associationPhone = firstAddress.phone || mainData.company_phone;
      responseData.associationPhoneExtension = firstAddress.phone_extension || mainData.company_phone_extension;
      responseData.website = firstAddress.website;
    }

    console.log('🎉 [AM Summary API] Data processing completed successfully');

    return NextResponse.json({
      success: true,
      data: responseData,
      industrialGroups: allIndustrialGroups,
      provincialChapters: allProvincialChapters
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ [AM Summary API] Error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  let trx;
  
  try {
    console.log('🚀 [AM Membership Submit] Starting submission process...');
    
    // ตรวจสอบ session
    const session = await getSession();
    if (!session || !session.user) {
      console.log('❌ [AM Membership Submit] Unauthorized access attempt');
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่ได้รับอนุญาต' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('👤 [AM Membership Submit] User ID:', userId);

    // ตรวจสอบสถานะการยื่นใบสมัครที่รอดำเนินการ
    const existingSubmissions = await executeQuery(
      `SELECT id, status FROM MemberRegist_AM_Main 
       WHERE user_id = ? AND status IN ('pending_review', 'approved')`,
      [userId]
    );

    if (existingSubmissions.length > 0) {
      console.log('⚠️ [AM Membership Submit] User has existing pending/approved submission');
      return NextResponse.json({
        success: false,
        error: 'คุณมีใบสมัครที่รอดำเนินการหรือได้รับการอนุมัติแล้ว'
      }, { status: 400 });
    }

    // Parse form data
    const formData = await request.formData();
    console.log('📋 [AM Membership Submit] Form data received');

    // Extract basic data
    const associationName = formData.get('associationName');
    const associationNameEn = formData.get('associationNameEn') || formData.get('associationNameEng');
    const taxId = formData.get('taxId');
    const memberCount = formData.get('memberCount');
    const numberOfEmployees = formData.get('numberOfEmployees');
    const registeredCapital = formData.get('registeredCapital');
    const productionCapacityValue = formData.get('productionCapacityValue');
    const productionCapacityUnit = formData.get('productionCapacityUnit');
    const salesDomestic = formData.get('salesDomestic');
    const salesExport = formData.get('salesExport');
    const shareholderThaiPercent = formData.get('shareholderThaiPercent');
    const shareholderForeignPercent = formData.get('shareholderForeignPercent');
    const factoryType = formData.get('factoryType');

    // Extract authorized signatory name fields
    const authorizedSignatoryFirstNameTh = formData.get('authorizedSignatoryFirstNameTh');
    const authorizedSignatoryLastNameTh = formData.get('authorizedSignatoryLastNameTh');
    const authorizedSignatoryFirstNameEn = formData.get('authorizedSignatoryFirstNameEn');
    const authorizedSignatoryLastNameEn = formData.get('authorizedSignatoryLastNameEn');

    // Validate required fields
    if (!associationName || !taxId || !memberCount) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
      }, { status: 400 });
    }

    // ตรวจสอบเลขประจำตัวผู้เสียภาษีซ้ำ
    const existingTaxId = await executeQuery(
      `SELECT id FROM MemberRegist_AM_Main 
       WHERE tax_id = ? AND user_id != ? AND status IN ('pending_review', 'approved')`,
      [taxId, userId]
    );

    if (existingTaxId.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'เลขประจำตัวผู้เสียภาษีนี้ถูกใช้งานแล้ว'
      }, { status: 400 });
    }

    // Begin transaction
    trx = await beginTransaction();
    console.log('🔄 [AM Membership Submit] Transaction started');

    // Insert main data
    const mainInsertResult = await executeQuery(
      `INSERT INTO MemberRegist_AM_Main (
        user_id, company_name_th, company_name_en, tax_id, number_of_member,
        number_of_employees, registered_capital, production_capacity_value, production_capacity_unit,
        sales_domestic, sales_export, shareholder_thai_percent, shareholder_foreign_percent,
        factory_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', NOW())`,
      [
        userId, associationName, associationNameEn, taxId, memberCount,
        numberOfEmployees, registeredCapital, productionCapacityValue, productionCapacityUnit,
        salesDomestic, salesExport, shareholderThaiPercent, shareholderForeignPercent,
        factoryType
      ],
      trx
    );

    const mainId = mainInsertResult.insertId;
    console.log('✅ [AM Membership Submit] Main data inserted with ID:', mainId);

    // Insert authorized signatory name fields if all are provided
    if (authorizedSignatoryFirstNameTh && authorizedSignatoryLastNameTh && 
        authorizedSignatoryFirstNameEn && authorizedSignatoryLastNameEn) {
      
      console.log('📝 [AM Membership Submit] Inserting authorized signatory names...');
      
      await executeQuery(
        `INSERT INTO MemberRegist_AM_Signature_Name (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          mainId,
          authorizedSignatoryFirstNameTh,
          authorizedSignatoryLastNameTh, 
          authorizedSignatoryFirstNameEn,
          authorizedSignatoryLastNameEn
        ],
        trx
      );
      
      console.log('✅ [AM Membership Submit] Authorized signatory names inserted');
    }

    // Process addresses
    const addressesData = formData.get('addresses');
    if (addressesData) {
      const addresses = JSON.parse(addressesData);
      console.log('🏠 [AM Membership Submit] Processing addresses...');
      
      for (const [addressType, addressInfo] of Object.entries(addresses)) {
        if (addressInfo && addressInfo.addressNumber) {
          await executeQuery(
            `INSERT INTO MemberRegist_AM_Address (
              main_id, address_type, address_number, building, moo, soi, street,
              sub_district, district, province, postal_code, phone, phone_extension,
              email, website, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              mainId, addressType, addressInfo.addressNumber, addressInfo.building,
              addressInfo.moo, addressInfo.soi, addressInfo.street,
              addressInfo.subDistrict, addressInfo.district, addressInfo.province,
              addressInfo.postalCode, addressInfo.phone, addressInfo.phoneExtension,
              addressInfo.email, addressInfo.website
            ],
            trx
          );
        }
      }
    }

    // Process representatives
    const representativesData = formData.get('representatives');
    if (representativesData) {
      const representatives = JSON.parse(representativesData);
      console.log('👥 [AM Membership Submit] Processing representatives...');
      
      for (let i = 0; i < representatives.length; i++) {
        const rep = representatives[i];
        await executeQuery(
          `INSERT INTO MemberRegist_AM_Representatives (
            main_id, id_card, first_name_th, last_name_th, first_name_en, last_name_en,
            position, email, phone, rep_order, is_primary, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            mainId, rep.idCardNumber, rep.firstNameThai, rep.lastNameThai,
            rep.firstNameEnglish, rep.lastNameEnglish, rep.position,
            rep.email, rep.phone, i, rep.isPrimary || false
          ],
          trx
        );
      }
    }

    // Process business types
    const businessTypesData = formData.get('businessTypes');
    if (businessTypesData) {
      const businessTypes = JSON.parse(businessTypesData);
      console.log('🏢 [AM Membership Submit] Processing business types...');
      
      for (const [businessType, isSelected] of Object.entries(businessTypes)) {
        if (isSelected) {
          await executeQuery(
            `INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type, created_at) 
             VALUES (?, ?, NOW())`,
            [mainId, businessType],
            trx
          );
        }
      }
    }

    // Process other business type
    const otherBusinessTypeDetail = formData.get('otherBusinessTypeDetail');
    if (otherBusinessTypeDetail) {
      await executeQuery(
        `INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, detail, created_at) 
         VALUES (?, ?, NOW())`,
        [mainId, otherBusinessTypeDetail],
        trx
      );
    }

    // Process products
    const productsData = formData.get('products');
    if (productsData) {
      const products = JSON.parse(productsData);
      console.log('📦 [AM Membership Submit] Processing products...');
      
      for (const product of products) {
        if (product.nameTh) {
          await executeQuery(
            `INSERT INTO MemberRegist_AM_Products (main_id, product_name_th, product_name_en, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [mainId, product.nameTh, product.nameEn],
            trx
          );
        }
      }
    }

    // Process industrial groups
    const industrialGroupsData = formData.get('industrialGroups');
    if (industrialGroupsData) {
      const industrialGroups = JSON.parse(industrialGroupsData);
      console.log('🏭 [AM Membership Submit] Processing industrial groups...');
      
      for (const groupId of industrialGroups) {
        await executeQuery(
          `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id, created_at) 
           VALUES (?, ?, NOW())`,
          [mainId, groupId],
          trx
        );
      }
    }

    // Process provincial chapters
    const provincialChaptersData = formData.get('provincialChapters');
    if (provincialChaptersData) {
      const provincialChapters = JSON.parse(provincialChaptersData);
      console.log('🏛️ [AM Membership Submit] Processing provincial chapters...');
      
      for (const chapterId of provincialChapters) {
        await executeQuery(
          `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id, created_at) 
           VALUES (?, ?, NOW())`,
          [mainId, chapterId],
          trx
        );
      }
    }

    // Process document uploads
    console.log('📄 [AM Membership Submit] Processing document uploads...');
    
    const documentTypes = [
      'associationCertificate', 'memberList', 'authorizedSignature',
      'companyRegistration', 'taxCertificate', 'financialStatement',
      'productCatalog', 'factoryLicense', 'otherDocuments'
    ];

    for (const docType of documentTypes) {
      const file = formData.get(docType);
      if (file && file instanceof File && file.size > 0) {
        console.log(`📎 [AM Membership Submit] Uploading ${docType}:`, file.name);
        
        try {
          const fileBuffer = await file.arrayBuffer();
          const uploadResult = await uploadToCloudinary(
            Buffer.from(fileBuffer),
            file.name,
            {
              folder: `am-membership/${mainId}`,
              resource_type: 'auto'
            }
          );

          if (uploadResult.success) {
            await executeQuery(
              `INSERT INTO MemberRegist_AM_Documents (
                main_id, document_type, file_name, file_path, cloudinary_url, created_at
              ) VALUES (?, ?, ?, ?, ?, NOW())`,
              [mainId, docType, file.name, uploadResult.url, uploadResult.url],
              trx
            );
            console.log(`✅ [AM Membership Submit] ${docType} uploaded successfully`);
          } else {
            console.error(`❌ [AM Membership Submit] Failed to upload ${docType}:`, uploadResult.error);
          }
        } catch (uploadError) {
          console.error(`❌ [AM Membership Submit] Error uploading ${docType}:`, uploadError);
        }
      }
    }

    // Process production images
    const productionImagesCount = parseInt(formData.get('productionImagesCount') || '0');
    if (productionImagesCount > 0) {
      console.log(`🖼️ [AM Membership Submit] Processing ${productionImagesCount} production images...`);
      
      for (let i = 0; i < productionImagesCount; i++) {
        const imageFile = formData.get(`productionImages[${i}]`);
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
          try {
            const fileBuffer = await imageFile.arrayBuffer();
            const uploadResult = await uploadToCloudinary(
              Buffer.from(fileBuffer),
              imageFile.name,
              {
                folder: `am-membership/${mainId}/production-images`,
                resource_type: 'image'
              }
            );

            if (uploadResult.success) {
              await executeQuery(
                `INSERT INTO MemberRegist_AM_Documents (
                  main_id, document_type, file_name, file_path, cloudinary_url, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())`,
                [mainId, 'productionImage', imageFile.name, uploadResult.url, uploadResult.url],
                trx
              );
            }
          } catch (uploadError) {
            console.error(`❌ [AM Membership Submit] Error uploading production image ${i}:`, uploadError);
          }
        }
      }
    }

    // Log submission
    await executeQuery(
      `INSERT INTO MemberRegist_AM_StatusLog (
        main_id, status, changed_by_user_id, notes, created_at
      ) VALUES (?, 'pending_review', ?, 'ใบสมัครถูกส่งเพื่อรอการพิจารณา', NOW())`,
      [mainId, userId],
      trx
    );

    // Log user action
    await executeQuery(
      `INSERT INTO Member_portal_User_log (
        user_id, action, details, created_at
      ) VALUES (?, 'submit_membership', ?, NOW())`,
      [
        userId,
        JSON.stringify({
          membershipType: 'am',
          membershipId: mainId,
          associationName: associationName,
          taxId: taxId
        })
      ],
      trx
    );

    // Commit transaction
    await commitTransaction(trx);
    console.log('🎉 [AM Membership Submit] Transaction committed successfully');

    return NextResponse.json({
      success: true,
      message: 'ส่งใบสมัครสมาชิก AM สำเร็จ',
      memberId: mainId,
      data: {
        id: mainId,
        associationName: associationName,
        taxId: taxId,
        status: 'pending_review'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [AM Membership Submit] Error:', error);
    
    if (trx) {
      try {
        await rollbackTransaction(trx);
        console.log('🔄 [AM Membership Submit] Transaction rolled back');
      } catch (rollbackError) {
        console.error('❌ [AM Membership Submit] Rollback error:', rollbackError);
      }
    }

    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง',
      details: error.message
    }, { status: 500 });
  }
}