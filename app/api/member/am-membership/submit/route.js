import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { executeQuery } from '@/app/lib/db';

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