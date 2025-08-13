import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkUserSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/db';

const BUSINESS_TYPE_MAP = {
  'manufacturer': 'ผู้ผลิต',
  'distributor': 'ผู้จัดจำหน่าย',
  'importer': 'ผู้นำเข้า',
  'exporter': 'ผู้ส่งออก',
  'service': 'ผู้ให้บริการ',
  'other': 'อื่นๆ'
};

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Fetch main AM data
    const mainResult = await query(
      'SELECT * FROM MemberRegist_AM_Main WHERE id = ?',
      [id]
    );

    if (!mainResult || mainResult.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'AM application not found' 
      }, { status: 404 });
    }

    const amData = mainResult[0];

    // Fetch all addresses (multi-address support)
    const addressResult = await query(
      'SELECT * FROM MemberRegist_AM_Address WHERE main_id = ? ORDER BY address_type',
      [id]
    );

    // Fetch representatives
    const representativesResult = await query(
      'SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?',
      [id]
    );

    // Fetch contact persons (order by type_contact_id = 1 first for main contact)
    const contactPersonsResult = await query(
      'SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ? ORDER BY (type_contact_id = 1) DESC, id ASC',
      [id]
    );

    // Fetch business types
    const businessTypesResult = await query(
      'SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?',
      [id]
    );

    // Fetch business type other if exists
    let businessTypeOther = null;
    const hasOtherBusinessType = businessTypesResult?.find(bt => bt.business_type === 'other');
    if (hasOtherBusinessType) {
      const otherResult = await query(
        'SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?',
        [id]
      );
      businessTypeOther = otherResult?.[0] || null;
    }

    // Fetch products/services
    const productsResult = await query(
      'SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?',
      [id]
    );

    // ✅ Fetch industry groups - ใช้ข้อมูลจากตารางโดยตรง
    const industryGroupsResult = await query(
      'SELECT * FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?',
      [id]
    );

    // ✅ Fetch province chapters - ใช้ข้อมูลจากตารางโดยตรง
    const provinceChaptersResult = await query(
      'SELECT * FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?',
      [id]
    );

    // Fetch documents
    const documentsResult = await query(
      'SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?',
      [id]
    );

    // ✅ Process industry groups - เตรียมข้อมูลสำหรับ lookup
    const industryGroupsWithNames = (industryGroupsResult || []).map(ig => ({
      id: ig.industry_group_id,
      name_th: ig.industry_group_name || ig.industry_group_id
    }));

    // Process province chapters
    const provinceChaptersWithNames = (provinceChaptersResult || []).map(pc => ({
      id: pc.province_chapter_id,
      name_th: pc.province_chapter_name || pc.province_chapter_id
    }));

    // Process addresses into multi-address format
    const addressesFormatted = {};
    (addressResult || []).forEach(addr => {
      const addressType = addr.address_type || '2'; // Default to type 2 if not specified
      addressesFormatted[addressType] = {
        addressType: addressType,
        addressNumber: addr.address_number || '',
        building: addr.building || '',
        moo: addr.moo || '',
        soi: addr.soi || '',
        // Keep both keys to match OC and ensure compatibility
        street: addr.street || '',
        road: addr.street || '',
        subDistrict: addr.sub_district || '',
        district: addr.district || '',
        province: addr.province || '',
        postalCode: addr.postal_code || '',
        phone: addr.phone || '',
        phoneExtension: addr.phone_extension || '',
        email: addr.email || '',
        website: addr.website || ''
      };
    });
    
    // Get main address data (fallback to legacy single address or type 2)
    const mainAddress = (addressResult || []).find(addr => addr.address_type === '2') || 
                       (addressResult || [])[0] || {};

    // Transform data to match the format expected by the frontend
    const transformedData = {
      id: amData.id,
      memberCode: amData.member_code,
      associationName: amData.company_name_th,
      associationNameEng: amData.company_name_en,
      associationRegistrationNumber: amData.association_registration_number,
      associationEmail: amData.company_email || mainAddress?.email || '',
      associationPhone: amData.company_phone || mainAddress?.phone || '',
      associationPhoneExtension: amData.company_phone_extension || '',
      associationWebsite: mainAddress?.website || '',
      memberCount: amData.member_count,
      status: amData.status,
      createdAt: amData.created_at,
      updatedAt: amData.updated_at,
      
      // Multi-address data
      addresses: addressesFormatted,
      
      // Legacy single address fields (for backward compatibility)
      addressNumber: mainAddress?.address_number || '',
      moo: mainAddress?.moo || '',
      soi: mainAddress?.soi || '',
      // Provide both street and road for compatibility with OC components
      street: mainAddress?.street || '',
      road: mainAddress?.street || '',
      subDistrict: mainAddress?.sub_district || '',
      district: mainAddress?.district || '',
      province: mainAddress?.province || '',
      postalCode: mainAddress?.postal_code || '',
      
      // Multiple contact persons
      contactPersons: (contactPersonsResult || []).map((cp, index) => ({
        id: cp.id || index + 1,
        firstNameTh: cp.first_name_th || '',
        lastNameTh: cp.last_name_th || '',
        firstNameEn: cp.first_name_en || '',
        lastNameEn: cp.last_name_en || '',
        position: cp.position || '',
        email: cp.email || '',
        phone: cp.phone || '',
        phoneExtension: cp.phone_extension || '',
        typeContactId: cp.type_contact_id || null,
        typeContactName: cp.type_contact_name || '',
        typeContactOtherDetail: cp.type_contact_other_detail || '',
        isMain: cp.type_contact_id === 1 || index === 0
      })),
      
      // Legacy single contact person fields (for backward compatibility)
      contactPersonFirstName: contactPersonsResult?.[0]?.first_name_th || '',
      contactPersonLastName: contactPersonsResult?.[0]?.last_name_th || '',
      contactPersonFirstNameEng: contactPersonsResult?.[0]?.first_name_en || '',
      contactPersonLastNameEng: contactPersonsResult?.[0]?.last_name_en || '',
      contactPersonPosition: contactPersonsResult?.[0]?.position || '',
      contactPersonEmail: contactPersonsResult?.[0]?.email || '',
      contactPersonPhone: contactPersonsResult?.[0]?.phone || '',
      
      // Representatives
      representatives: (representativesResult || []).map(rep => ({
        firstNameThai: rep.first_name_th,
        lastNameThai: rep.last_name_th,
        firstNameEng: rep.first_name_en,
        lastNameEng: rep.last_name_en,
        email: rep.email,
        phone: rep.phone,
        phoneExtension: rep.phone_extension || '',
        position: rep.position
      })),
      
      // Business Types - transform to match frontend format
      businessTypes: (businessTypesResult || []).reduce((acc, bt) => {
        acc[bt.business_type] = true;
        return acc;
      }, {}),
      
      // Other business type detail
      otherBusinessTypeDetail: businessTypeOther?.detail,
      
      // Products/Services
      products: (productsResult || []).map(product => ({
        nameTh: product.name_th,
        nameEn: product.name_en
      })),
      
      // 🔥 เพิ่มข้อมูลทางการเงิน
      registeredCapital: amData.registered_capital || '',
      productionCapacityValue: amData.production_capacity_value || '',
      productionCapacityUnit: amData.production_capacity_unit || '',
      salesDomestic: amData.sales_domestic || '',
      salesExport: amData.sales_export || '',
      shareholderThaiPercent: amData.shareholder_thai_percent || '',
      shareholderForeignPercent: amData.shareholder_foreign_percent || '',
      
      // ✅ FIXED: Industry Groups - ส่งเป็น array ของ ID สำหรับ SummarySection ที่จะค้นหาชื่อจาก industrialGroups
      industrialGroups: (industryGroupsResult || []).map(ig => ig.industry_group_id),
      
      // ✅ FIXED: Province Chapters - ส่งเป็น array ของ ID สำหรับ SummarySection ที่จะค้นหาชื่อจาก provincialChapters
      provincialCouncils: (provinceChaptersResult || []).map(pc => pc.province_chapter_id),
      
      // Documents
      associationCertificate: documentsResult?.find(doc => doc.document_type === 'associationCertificate') ? {
        name: documentsResult.find(doc => doc.document_type === 'associationCertificate')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsResult.find(doc => doc.document_type === 'associationCertificate')?.cloudinary_url || documentsResult.find(doc => doc.document_type === 'associationCertificate')?.file_path
      } : null,
      
      memberList: documentsResult?.find(doc => doc.document_type === 'memberList') ? {
        name: documentsResult.find(doc => doc.document_type === 'memberList')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsResult.find(doc => doc.document_type === 'memberList')?.cloudinary_url || documentsResult.find(doc => doc.document_type === 'memberList')?.file_path
      } : null,
      
      // Company stamp document (new required document)
      companyStamp: documentsResult?.find(doc => doc.document_type === 'companyStamp') ? {
        name: documentsResult.find(doc => doc.document_type === 'companyStamp')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsResult.find(doc => doc.document_type === 'companyStamp')?.cloudinary_url || documentsResult.find(doc => doc.document_type === 'companyStamp')?.file_path,
        fileType: documentsResult.find(doc => doc.document_type === 'companyStamp')?.mime_type,
        fileSize: documentsResult.find(doc => doc.document_type === 'companyStamp')?.file_size,
        cloudinaryId: documentsResult.find(doc => doc.document_type === 'companyStamp')?.cloudinary_id
      } : null,
      
      // Authorized signature document (new required document)
      authorizedSignature: documentsResult?.find(doc => doc.document_type === 'authorizedSignature') ? {
        name: documentsResult.find(doc => doc.document_type === 'authorizedSignature')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsResult.find(doc => doc.document_type === 'authorizedSignature')?.cloudinary_url || documentsResult.find(doc => doc.document_type === 'authorizedSignature')?.file_path,
        fileType: documentsResult.find(doc => doc.document_type === 'authorizedSignature')?.mime_type,
        fileSize: documentsResult.find(doc => doc.document_type === 'authorizedSignature')?.file_size,
        cloudinaryId: documentsResult.find(doc => doc.document_type === 'authorizedSignature')?.cloudinary_id
      } : null
    };

    // ✅ FIXED: ส่งข้อมูลรวมทั้ง lookup data
    const responseData = {
      success: true, 
      data: transformedData,
      // ส่งข้อมูล lookup สำหรับ SummarySection ใช้ค้นหาชื่อ
      industrialGroups: industryGroupsWithNames,
      provincialChapters: provinceChaptersWithNames
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching AM summary:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}