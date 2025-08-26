import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { query, executeQuery, beginTransaction, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';

// Ensure Node.js runtime (required for Buffer and other Node APIs)
export const runtime = 'nodejs';

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
    const [mainData] = await query(
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
    const addresses = await query(
      `SELECT * FROM MemberRegist_AM_Address WHERE main_id = ? ORDER BY address_type`,
      [id]
    );

    // ดึงข้อมูลผู้ติดต่อ
    const contactPersons = await query(
      `SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ? ORDER BY id`,
      [id]
    );

    // ดึงข้อมูลผู้แทน
    const representatives = await query(
      `SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ? ORDER BY rep_order`,
      [id]
    );

    // ดึงข้อมูลประเภทธุรกิจ
    const businessTypes = await query(
      `SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลประเภทธุรกิจอื่นๆ
    const [otherBusinessType] = await query(
      `SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลผลิตภัณฑ์
    const products = await query(
      `SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลกลุ่มอุตสาหกรรม
    const industryGroups = await query(
      `SELECT * FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลสภาจังหวัด
    const provinceChapters = await query(
      `SELECT * FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูลเอกสาร
    const documents = await query(
      `SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?`,
      [id]
    );

    // ดึงข้อมูล lookup สำหรับ industrial groups
    const allIndustrialGroups = await query(
      'SELECT id, name_th, name_en FROM industrial_groups ORDER BY name_th'
    );

    // ดึงข้อมูล lookup สำหรับ provincial chapters
    const allProvincialChapters = await query(
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
        street: addr.street || addr.road, // prefer street, fallback to road if exists
        road: addr.road || addr.street, // prefer road, fallback to street
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
      responseData.road = firstAddress.road || firstAddress.street;
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

    // อนุญาตให้ผู้ใช้ส่งใบสมัคร AM ได้หลายครั้ง (ไม่บล็อคตาม user_id)
    // หมายเหตุ: ยังกันซ้ำโดยใช้เลขประจำตัวผู้เสียภาษีด้านล่าง

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

    // Small helper to convert undefined to SQL NULL
    const toNull = (v) => (v === undefined ? null : v);

    // Validate required fields
    if (!associationName || !taxId || !memberCount) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
      }, { status: 400 });
    }

    // ตรวจสอบเลขประจำตัวผู้เสียภาษีซ้ำ (เช็คข้ามตาราง AM/AC/OC และไม่ยกเว้น user เดิม)
    // AM (ใช้สถานะเป็นตัวเลข: 0=pending,1=approved)
    const [amDup] = await query(
      `SELECT status FROM MemberRegist_AM_Main 
       WHERE tax_id = ? AND (status = 0 OR status = 1)
       LIMIT 1`,
      [taxId]
    );
    // AC
    const [acDup] = await query(
      `SELECT status FROM MemberRegist_AC_Main 
       WHERE tax_id = ? AND (status = 0 OR status = 1) 
       LIMIT 1`,
      [taxId]
    );
    // OC
    const [ocDup] = await query(
      `SELECT status FROM MemberRegist_OC_Main 
       WHERE tax_id = ? AND (status = 0 OR status = 1) 
       LIMIT 1`,
      [taxId]
    );

    if (amDup || acDup || ocDup) {
      // จัดข้อความตามสถานะ ถ้าพบรายการที่สถานะกำลังพิจารณา ให้แจ้งตามนั้น มิฉะนั้นถือว่าเป็นสมาชิกแล้ว
      let isPending = false;
      if (amDup) {
        isPending = Number(amDup.status) === 0;
      } else if (acDup) {
        isPending = Number(acDup.status) === 0;
      } else if (ocDup) {
        isPending = Number(ocDup.status) === 0;
      }

      const message = isPending
        ? `คำขอสมัครสมาชิกของท่านสำหรับเลขประจำตัวผู้เสียภาษี ${taxId} อยู่ระหว่างการพิจารณา`
        : `เลขประจำตัวผู้เสียภาษี ${taxId} นี้ได้เป็นสมาชิกแล้ว`;

      return NextResponse.json({ success: false, error: message }, { status: 409 });
    }

    // Begin transaction
    trx = await beginTransaction();
    console.log('🔄 [AM Membership Submit] Transaction started');

    // Insert main data (status ใช้ 0 = pending)
    const mainInsertResult = await executeQuery(
      trx,
      `INSERT INTO MemberRegist_AM_Main (
        user_id, company_name_th, company_name_en, tax_id, number_of_member,
        number_of_employees, registered_capital, production_capacity_value, production_capacity_unit,
        sales_domestic, sales_export, shareholder_thai_percent, shareholder_foreign_percent,
        factory_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [
        userId, associationName, associationNameEn, taxId, memberCount,
        numberOfEmployees, registeredCapital, productionCapacityValue, productionCapacityUnit,
        salesDomestic, salesExport, shareholderThaiPercent, shareholderForeignPercent,
        factoryType
      ]
    );

    const mainId = mainInsertResult.insertId;
    console.log('✅ [AM Membership Submit] Main data inserted with ID:', mainId);

    // Insert authorized signatory name fields if all are provided
    if (authorizedSignatoryFirstNameTh && authorizedSignatoryLastNameTh && 
        authorizedSignatoryFirstNameEn && authorizedSignatoryLastNameEn) {
      
      console.log('📝 [AM Membership Submit] Inserting authorized signatory names...');
      
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_AM_Signature_Name (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          mainId,
          authorizedSignatoryFirstNameTh,
          authorizedSignatoryLastNameTh, 
          authorizedSignatoryFirstNameEn,
          authorizedSignatoryLastNameEn
        ]
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
            trx,
            `INSERT INTO MemberRegist_AM_Address (
              main_id, address_type, address_number, building, moo, soi, street,
              sub_district, district, province, postal_code, phone, phone_extension,
              email, website, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              mainId,
              addressType,
              addressInfo.addressNumber,
              toNull(addressInfo.building),
              toNull(addressInfo.moo),
              toNull(addressInfo.soi),
              toNull(addressInfo.road ?? addressInfo.street),
              toNull(addressInfo.subDistrict),
              toNull(addressInfo.district),
              toNull(addressInfo.province),
              toNull(addressInfo.postalCode),
              toNull(addressInfo.phone),
              toNull(addressInfo.phoneExtension),
              toNull(addressInfo.email),
              toNull(addressInfo.website)
            ]
          );
        }
      }
    }

    // Process representatives
    const representativesData = formData.get('representatives');
    if (representativesData) {
      const representatives = JSON.parse(representativesData);
      console.log('👥 [AM Membership Submit] Processing representatives...');
      
      // Normalize keys from frontend (supports both firstNameTh/firstNameThai, etc.)
      for (let i = 0; i < representatives.length; i++) {
        const rep = representatives[i] || {};

        const firstNameTh = rep.firstNameTh ?? rep.firstNameThai ?? null;
        const lastNameTh = rep.lastNameTh ?? rep.lastNameThai ?? null;
        const firstNameEn = rep.firstNameEn ?? rep.firstNameEnglish ?? null;
        const lastNameEn = rep.lastNameEn ?? rep.lastNameEnglish ?? null;
        const position = rep.position ?? null;
        const email = rep.email ?? null;
        const phone = rep.phone ?? null;
        const isPrimary = rep.isPrimary ? 1 : 0;

        // Minimal validation for required fields in DB
        if (!firstNameTh || !lastNameTh) {
          console.warn(`⚠️ [AM Membership Submit] Skipping representative #${i} due to missing Thai name fields`, {
            keys: Object.keys(rep || {}),
          });
          continue;
        }

        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_Representatives (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en,
            position, email, phone, rep_order, is_primary, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            mainId,
            toNull(firstNameTh),
            toNull(lastNameTh),
            toNull(firstNameEn),
            toNull(lastNameEn),
            toNull(position),
            toNull(email),
            toNull(phone),
            i,
            isPrimary
          ]
        );
      }
    }

    // Process contact persons
    const contactPersonsData = formData.get('contactPersons');
    if (contactPersonsData) {
      const contactPersons = JSON.parse(contactPersonsData);
      console.log('📞 [AM Membership Submit] Processing contact persons...');

      for (let i = 0; i < contactPersons.length; i++) {
        const cp = contactPersons[i] || {};

        // Normalize expected keys from frontend
        const firstNameTh = cp.firstNameTh ?? cp.first_name_th ?? null;
        const lastNameTh = cp.lastNameTh ?? cp.last_name_th ?? null;
        const firstNameEn = cp.firstNameEn ?? cp.first_name_en ?? null;
        const lastNameEn = cp.lastNameEn ?? cp.last_name_en ?? null;
        const position = cp.position ?? null;
        const email = cp.email ?? null;
        const phone = cp.phone ?? null;
        const phoneExtension = cp.phoneExtension ?? cp.phone_extension ?? null;
        const typeContactId = cp.typeContactId ?? cp.type_contact_id ?? null;
        let typeContactName = cp.typeContactName ?? cp.type_contact_name ?? null;
        const typeContactOtherDetail = cp.typeContactOtherDetail ?? cp.type_contact_other_detail ?? null;

        // If we have typeContactId but no name, try to resolve from lookup table
        if (typeContactId && !typeContactName) {
          try {
            const rows = await query(
              'SELECT type_name_th FROM MemberRegist_ContactPerson_TYPE WHERE id = ? AND is_active = 1',
              [typeContactId]
            );
            if (rows && rows.length > 0) {
              typeContactName = rows[0].type_name_th || typeContactName;
            }
          } catch (e) {
            console.warn('⚠️ [AM Membership Submit] contact person TYPE lookup failed, proceeding with provided data');
          }
        }

        // Minimal validation for NOT NULL columns in DB (th names, email, phone)
        if (!firstNameTh || !lastNameTh || !email || !phone) {
          console.warn(`⚠️ [AM Membership Submit] Skipping contact person #${i} due to missing required fields`, {
            hasFirstNameTh: !!firstNameTh,
            hasLastNameTh: !!lastNameTh,
            hasEmail: !!email,
            hasPhone: !!phone,
          });
          continue;
        }

        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_ContactPerson (
            main_id, first_name_th, last_name_th, first_name_en, last_name_en,
            position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            mainId,
            firstNameTh,
            lastNameTh,
            toNull(firstNameEn),
            toNull(lastNameEn),
            toNull(position),
            email,
            phone,
            toNull(phoneExtension),
            toNull(typeContactId),
            toNull(typeContactName),
            toNull(typeContactOtherDetail)
          ]
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
            trx,
            `INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type, created_at) 
             VALUES (?, ?, NOW())`,
            [mainId, businessType]
          );
        }
      }
    }

    // Process other business type
    const otherBusinessTypeDetail = formData.get('otherBusinessTypeDetail');
    if (otherBusinessTypeDetail) {
      await executeQuery(
        trx,
        `INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, detail, created_at) 
         VALUES (?, ?, NOW())`,
        [mainId, otherBusinessTypeDetail]
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
            trx,
            `INSERT INTO MemberRegist_AM_Products (main_id, name_th, name_en, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [mainId, product.nameTh, toNull(product.nameEn)]
          );
        }
      }
    }

    // Process industrial groups
    const industrialGroupsData = formData.get('industrialGroups');
    if (industrialGroupsData) {
      const industrialGroups = JSON.parse(industrialGroupsData);
      const industrialGroupNamesData = formData.get('industrialGroupNames');
      const industrialGroupNames = industrialGroupNamesData ? JSON.parse(industrialGroupNamesData) : [];
      console.log('🏭 [AM Membership Submit] Processing industrial groups...');
      // Build lookup map from DB as reliable source for names (fallback-safe)
      let igMap = new Map();
      try {
        const igLookupRows = await query('SELECT id, name_th FROM industrial_groups');
        igMap = new Map(igLookupRows.map(r => [String(r.id), r.name_th]));
      } catch (e) {
        console.warn('⚠️ [AM Membership Submit] industrial_groups table not available, using frontend names only');
      }
      const namesByIndex = new Map(industrialGroups.map((id, idx) => [String(id), industrialGroupNames[idx]]));
      
      for (const groupId of industrialGroups) {
        const idStr = String(groupId);
        const groupName = namesByIndex.get(idStr) || igMap.get(idStr) || null;
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id, industry_group_name, created_at) 
           VALUES (?, ?, ?, NOW())`,
          [mainId, groupId, toNull(groupName)]
        );
      }
    }

    // Process provincial chapters (accept alias: provincialCouncils)
    let provincialChaptersData = formData.get('provincialChapters');
    if (!provincialChaptersData) {
      provincialChaptersData = formData.get('provincialCouncils');
    }
    if (provincialChaptersData) {
      const provincialChapters = JSON.parse(provincialChaptersData);
      let provincialChapterNamesData = formData.get('provincialChapterNames');
      if (!provincialChapterNamesData) {
        provincialChapterNamesData = formData.get('provincialCouncilNames');
      }
      const provincialChapterNames = provincialChapterNamesData ? JSON.parse(provincialChapterNamesData) : [];
      console.log('🏛️ [AM Membership Submit] Processing provincial chapters...');

      // Build lookup map from DB for names (fallback-safe)
      let pcMap = new Map();
      try {
        const pcLookupRows = await query('SELECT id, name_th FROM provincial_chapters');
        pcMap = new Map(pcLookupRows.map(r => [String(r.id), r.name_th]));
      } catch (e) {
        console.warn('⚠️ [AM Membership Submit] provincial_chapters table not available, using frontend names only');
      }
      const pcNamesByIndex = new Map(provincialChapters.map((id, idx) => [String(id), provincialChapterNames[idx]]));
      
      for (const chapterId of provincialChapters) {
        const idStr = String(chapterId);
        const chapterName = pcNamesByIndex.get(idStr) || pcMap.get(idStr) || null;
        await executeQuery(
          trx,
          `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id, province_chapter_name, created_at) 
           VALUES (?, ?, ?, NOW())`,
          [mainId, chapterId, toNull(chapterName)]
        );
      }
    }

    // Process document uploads
    console.log('📄 [AM Membership Submit] Processing document uploads...');
    
    const documentTypes = [
      'associationCertificate', 'memberList', 'companyStamp', 'authorizedSignature',
      'companyRegistration', 'taxCertificate', 'financialStatement',
      'productCatalog', 'factoryLicense', 'otherDocuments'
    ];

    for (const docType of documentTypes) {
      const file = formData.get(docType);
      if (file && typeof file.arrayBuffer === 'function' && Number(file.size) > 0) {
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
              trx,
              `INSERT INTO MemberRegist_AM_Documents (
                main_id, document_type, file_name, file_path, cloudinary_url, created_at
              ) VALUES (?, ?, ?, ?, ?, NOW())`,
              [mainId, docType, file.name, uploadResult.url, uploadResult.url]
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
        if (imageFile && typeof imageFile.arrayBuffer === 'function' && Number(imageFile.size) > 0) {
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
                trx,
                `INSERT INTO MemberRegist_AM_Documents (
                  main_id, document_type, file_name, file_path, cloudinary_url, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())`,
                [mainId, 'productionImage', imageFile.name, uploadResult.url, uploadResult.url]
              );
            }
          } catch (uploadError) {
            console.error(`❌ [AM Membership Submit] Error uploading production image ${i}:`, uploadError);
          }
        }
      }
    }

    // Log user action
    await executeQuery(
      trx,
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
      ]
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