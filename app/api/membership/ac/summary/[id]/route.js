import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkUserSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/db';

const BUSINESS_TYPE_MAP = {
  'manufacturer': 'ผู้ผลิต',
  'distributor': 'ผู้ค้า',
  'service': 'ผู้ให้บริการ',
  'exporter': 'ผู้ส่งออก',
  'importer': 'ผู้นำเข้า',
  'other': 'อื่นๆ'
};

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Fetch main AC data
    const mainQuery = await query(
      'SELECT * FROM MemberRegist_AC_Main WHERE id = ?',
      [id]
    );
    
    const acData = mainQuery?.[0];

    if (!acData || !acData.id) {
      return NextResponse.json({ 
        success: false,
        error: 'AC application not found',
        debug: {
          id: id,
          queryResult: mainQuery,
          queryLength: mainQuery?.length
        }
      }, { status: 404 });
    }

    // Fetch all addresses (multi-address support)
    const addressQuery = await query(
      'SELECT * FROM MemberRegist_AC_Address WHERE main_id = ? ORDER BY address_type',
      [id]
    );
    const addressResult = addressQuery || [];

    // Fetch representatives
    const representativesQuery = await query(
      'SELECT * FROM MemberRegist_AC_Representatives WHERE main_id = ?',
      [id]
    );
    const representativesResult = representativesQuery || [];

    // Fetch business types
    const businessTypesQuery = await query(
      'SELECT * FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?',
      [id]
    );
    const businessTypesRows = businessTypesQuery || [];

    // Fetch business type other if exists
    let businessTypeOther = null;
    const hasOtherBusinessType = Array.isArray(businessTypesRows) && businessTypesRows.find(bt => bt.business_type === 'other');
    if (hasOtherBusinessType) {
      const otherQuery = await query(
        'SELECT * FROM MemberRegist_AC_BusinessTypeOther WHERE main_id = ?',
        [id]
      );
      const otherResult = otherQuery || [];
      businessTypeOther = otherResult?.[0] || null;
    }

    // Fetch products/services
    const productsQuery = await query(
      'SELECT * FROM MemberRegist_AC_Products WHERE main_id = ?',
      [id]
    );
    const productsRows = productsQuery || [];

    // Fetch industry groups - ใช้ข้อมูลจากตารางโดยตรง
    const industryGroupsQuery = await query(
      'SELECT * FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?',
      [id]
    );
    const industryGroupsRows = industryGroupsQuery || [];

    // Fetch province chapters - ใช้ข้อมูลจากตารางโดยตรง
    const provinceChaptersQuery = await query(
      'SELECT * FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?',
      [id]
    );
    const provinceChaptersRows = provinceChaptersQuery || [];

    // Fetch documents
    const documentsQuery = await query(
      'SELECT * FROM MemberRegist_AC_Documents WHERE main_id = ?',
      [id]
    );
    const documentsRows = documentsQuery || [];

    // Map business types with names
    const businessTypes = Array.isArray(businessTypesRows) ? businessTypesRows.map(bt => ({
      id: bt.business_type,
      name: BUSINESS_TYPE_MAP[bt.business_type] || bt.business_type,
      details: bt.business_type === 'other' && businessTypeOther ? businessTypeOther.detail : null
    })) : [];

    // Process industry groups - ใช้ industry_group_name จากตารางโดยตรง
    const industryGroupsWithNames = industryGroupsRows.map(ig => ({
      id: ig.industry_group_id,
      industryGroupName: ig.industry_group_name || ig.industry_group_id
    }));

    // Process province chapters - ใช้ province_chapter_name จากตารางโดยตรง (หากมี)
    const provinceChaptersWithNames = provinceChaptersRows.map(pc => ({
      id: pc.province_chapter_id,
      provinceChapterName: pc.province_chapter_name || pc.province_chapter_id
    }));

    // Process addresses into multi-address format
    const addressesFormatted = {};
    addressResult.forEach(addr => {
      const addressType = addr.address_type || '2'; // Default to type 2 if not specified
      addressesFormatted[addressType] = {
        addressType: addressType,
        addressNumber: addr.address_number || '',
        building: addr.building || '',
        moo: addr.moo || '',
        soi: addr.soi || '',
        road: addr.road || '',
        subDistrict: addr.sub_district || '',
        district: addr.district || '',
        province: addr.province || '',
        postalCode: addr.postal_code || '',
        phone: addr.phone || '',
        email: addr.email || '',
        website: addr.website || ''
      };
    });
    
    // Get main address data (fallback to legacy single address or type 2)
    const mainAddress = addressResult.find(addr => addr.address_type === '2') || 
                       addressResult[0] || {};

    // Transform data to match the format expected by the frontend
    const transformedData = {
      id: acData.id,
      memberCode: acData.member_code,
      companyName: acData.company_name_th, // แก้ไขให้ตรงกับ column จริง
      companyNameEn: acData.company_name_en,
      taxId: acData.tax_id,
      companyEmail: acData.company_email || mainAddress?.email || '',
      companyPhone: acData.company_phone || mainAddress?.phone || '',
      companyWebsite: acData.company_website || mainAddress?.website || '',
      status: acData.status,
      createdAt: acData.created_at,
      updatedAt: acData.updated_at,
      
      // Multi-address data
      addresses: addressesFormatted,
      
      // Legacy single address fields (for backward compatibility)
      addressNumber: mainAddress?.address_number || '',
      moo: mainAddress?.moo || '',
      soi: mainAddress?.soi || '',
      road: mainAddress?.road || '',
      subDistrict: mainAddress?.sub_district || '',
      district: mainAddress?.district || '',
      province: mainAddress?.province || '',
      postalCode: mainAddress?.postal_code || '',
      
      // Contact person (assuming it's the first representative or stored elsewhere)
      contactPerson: representativesResult?.[0] ? {
        firstNameThai: representativesResult[0].first_name_th,
        lastNameThai: representativesResult[0].last_name_th,
        firstNameEng: representativesResult[0].first_name_en,
        lastNameEng: representativesResult[0].last_name_en,
        email: representativesResult[0].email,
        phone: representativesResult[0].phone,
        position: representativesResult[0].position
      } : {},
      
      // Representatives
      representatives: (representativesResult || []).map(rep => ({
        firstNameThai: rep.first_name_th,
        lastNameThai: rep.last_name_th,
        firstNameEng: rep.first_name_en,
        lastNameEng: rep.last_name_en,
        email: rep.email,
        phone: rep.phone,
        position: rep.position,
        isPrimary: rep.is_primary === 1 || rep.is_primary === true
      })),
      
      // Business Types - transform to match frontend format
      businessTypes: Array.isArray(businessTypesRows) ? businessTypesRows.reduce((acc, bt) => {
        acc[bt.business_type] = true;
        return acc;
      }, {}) : {},
      
      // Other business type detail
      otherBusinessTypeDetail: businessTypeOther?.detail,
      
      // Products/Services
      products: (productsRows || []).map(product => ({
        nameTh: product.name_th,
        nameEn: product.name_en
      })),
      
      // Industry Groups - ใช้ข้อมูลจากตารางโดยตรง
      industrialGroups: industryGroupsRows.map(ig => ({
        id: ig.industry_group_id,
        name_th: ig.industry_group_name,
        name: ig.industry_group_name
      })),
      
      // Province Chapters - ใช้ข้อมูลจากตารางโดยตรง
      provinceChapters: provinceChaptersWithNames.map(pc => ({
        id: pc.id,
        name_th: pc.provinceChapterName,
        name: pc.provinceChapterName
      })),
      
      // Documents - use cloudinary_url for file preview
      companyRegistration: documentsRows.find(doc => doc.document_type === 'companyRegistration') ? {
        name: documentsRows.find(doc => doc.document_type === 'companyRegistration')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsRows.find(doc => doc.document_type === 'companyRegistration')?.cloudinary_url || documentsRows.find(doc => doc.document_type === 'companyRegistration')?.file_path,
        fileType: documentsRows.find(doc => doc.document_type === 'companyRegistration')?.mime_type,
        fileSize: documentsRows.find(doc => doc.document_type === 'companyRegistration')?.file_size,
        cloudinaryId: documentsRows.find(doc => doc.document_type === 'companyRegistration')?.cloudinary_id
      } : null
    };

    // Build response
    const response = {
      success: true,
      data: transformedData,
      // Keep original structure for compatibility
      originalData: {
        id: acData.id,
        memberCode: acData.member_code,
        companyName: acData.company_name,
        taxId: acData.tax_id,
        status: acData.status,
        createdAt: acData.created_at,
        updatedAt: acData.updated_at,
        
        // Address
        address: addressResult?.[0] || null,
        
        // Representatives
        representatives: representativesResult || [],
        
        // Business Types
        businessTypes: businessTypes,
        businessTypeOther: businessTypeOther,
        
        // Products/Services
        products: productsRows || [],
        
        // Industry Groups
        industryGroups: industryGroupsWithNames,
        
        // Province Chapters
        provinceChapters: provinceChaptersWithNames,
        
        // Documents
        documents: documentsRows || []
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching AC summary:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}