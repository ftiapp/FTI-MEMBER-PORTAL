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

    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Fetch main AC data
    const mainQuery = await query(
      'SELECT * FROM MemberRegist_AC_Main WHERE id = ?',
      [id]
    );
    
    const acData = mainQuery?.[0];

    // Fetch applicant user account via user_id (for PDF applicant info)
    let applicantUser = null;
    if (acData?.user_id) {
      const userRows = await query(
        'SELECT id, firstname, lastname, email, phone FROM users WHERE id = ? LIMIT 1',
        [acData.user_id]
      );
      applicantUser = userRows?.[0] || null;
    }

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

    // Fetch contact persons (order by type_contact_id = 1 first for main contact)
    const contactPersonsQuery = await query(
      'SELECT * FROM MemberRegist_AC_ContactPerson WHERE main_id = ? ORDER BY (type_contact_id = 1) DESC, id ASC',
      [id]
    );
    const contactPersonsResult = contactPersonsQuery || [];

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

    // Fetch authorized signatory name & position
    const signatureNameRows = await query(
      'SELECT first_name_th, last_name_th, first_name_en, last_name_en, position_th, position_en FROM MemberRegist_AC_Signature_Name WHERE main_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    );
    const signatureName = Array.isArray(signatureNameRows) && signatureNameRows.length > 0 ? signatureNameRows[0] : null;

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
        // Canonicalize to 'street'. Support DB variants: 'STreet', 'street', or legacy 'road'.
        street: addr.STreet || addr.street || addr.road || '',
        road: addr.road || addr.STreet || addr.street || '',
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
    const mainAddress = addressResult.find(addr => addr.address_type === '2') || 
                       addressResult[0] || {};

    // Transform data to match the format expected by the frontend
    const transformedData = {
      id: acData.id,
      userId: acData.user_id || null,
      memberCode: acData.member_code,
      companyName: acData.company_name_th, // แก้ไขให้ตรงกับ column จริง
      companyNameEn: acData.company_name_en,
      taxId: acData.tax_id,
      companyEmail: acData.company_email || mainAddress?.email || '',
      companyPhone: acData.company_phone || mainAddress?.phone || '',
      companyPhoneExtension: acData.company_phone_extension || '',
      companyWebsite: acData.company_website || mainAddress?.website || '',
      // Employee count (preserve 0) with robust fallbacks for legacy/alternate column names
      numberOfEmployees: (
        acData.number_of_employees ??
        acData.employee_count ??
        acData.employeeCount ??
        acData.employees ??
        acData.total_employees ??
        acData.number_of_employee ??
        acData.num_employees ??
        acData.employee_number ??
        null
      ),
      status: acData.status,
      createdAt: acData.created_at,
      updatedAt: acData.updated_at,
      
      // Multi-address data
      addresses: addressesFormatted,
      
      // Legacy single address fields (for backward compatibility)
      addressNumber: mainAddress?.address_number || '',
      moo: mainAddress?.moo || '',
      soi: mainAddress?.soi || '',
      // Expose as 'street' canonically and keep 'road' alias, supporting 'STreet'
      street: (mainAddress?.STreet || mainAddress?.street || mainAddress?.road || ''),
      road: (mainAddress?.road || mainAddress?.STreet || mainAddress?.street || ''),
      subDistrict: mainAddress?.sub_district || '',
      district: mainAddress?.district || '',
      province: mainAddress?.province || '',
      postalCode: mainAddress?.postal_code || '',
      
      // Multiple contact persons
      contactPersons: contactPersonsResult.map((cp, index) => ({
        id: cp.id || index + 1,
        prenameTh: cp.prename_th || '',
        prenameEn: cp.prename_en || '',
        prenameOther: cp.prename_other || '',
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
      contactPersonFirstName: contactPersonsResult[0]?.first_name_th || '',
      contactPersonLastName: contactPersonsResult[0]?.last_name_th || '',
      contactPersonFirstNameEng: contactPersonsResult[0]?.first_name_en || '',
      contactPersonLastNameEng: contactPersonsResult[0]?.last_name_en || '',
      contactPersonPosition: contactPersonsResult[0]?.position || '',
      contactPersonEmail: contactPersonsResult[0]?.email || '',
      contactPersonPhone: contactPersonsResult[0]?.phone || '',
      
      // Contact person (legacy format for backward compatibility)
      contactPerson: contactPersonsResult?.[0] ? {
        firstNameThai: contactPersonsResult[0].first_name_th,
        lastNameThai: contactPersonsResult[0].last_name_th,
        firstNameEng: contactPersonsResult[0].first_name_en,
        lastNameEng: contactPersonsResult[0].last_name_en,
        email: contactPersonsResult[0].email,
        phone: contactPersonsResult[0].phone,
        position: contactPersonsResult[0].position
      } : {},
      
      // Representatives
      representatives: (representativesResult || []).map(rep => ({
        prenameTh: rep.prename_th || '',
        prenameEn: rep.prename_en || '',
        prenameOther: rep.prename_other || '',
        firstNameThai: rep.first_name_th,
        lastNameThai: rep.last_name_th,
        firstNameEng: rep.first_name_en,
        lastNameEng: rep.last_name_en,
        email: rep.email,
        phone: rep.phone,
        phoneExtension: rep.phone_extension || '',
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
      
      // 🔥 เพิ่มข้อมูลทางการเงิน
      registeredCapital: acData.registered_capital || '',
      productionCapacityValue: acData.production_capacity_value || '',
      productionCapacityUnit: acData.production_capacity_unit || '',
      revenueLastYear: acData.revenue_last_year || '',
      revenuePreviousYear: acData.revenue_previous_year || '',
      salesDomestic: acData.sales_domestic || '',
      salesExport: acData.sales_export || '',
      shareholderThaiPercent: acData.shareholder_thai_percent || '',
      shareholderForeignPercent: acData.shareholder_foreign_percent || '',
      
      // Authorized signatory (names & positions)
      authorizedSignatoryFirstNameTh: signatureName?.first_name_th || null,
      authorizedSignatoryLastNameTh: signatureName?.last_name_th || null,
      authorizedSignatoryFirstNameEn: signatureName?.first_name_en || null,
      authorizedSignatoryLastNameEn: signatureName?.last_name_en || null,
      authorizedSignatoryPositionTh: signatureName?.position_th || null,
      authorizedSignatoryPositionEn: signatureName?.position_en || null,
      
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
      } : null,
      
      // Applicant account (nested, for PDF section ข้อมูลบัญชีผู้สมัคร)
      user: applicantUser ? {
        id: applicantUser.id,
        firstname: applicantUser.firstname,
        lastname: applicantUser.lastname,
        email: applicantUser.email,
        phone: applicantUser.phone
      } : null,
      
      // Company stamp document (new required document)
      companyStamp: documentsRows.find(doc => doc.document_type === 'companyStamp') ? {
        name: documentsRows.find(doc => doc.document_type === 'companyStamp')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsRows.find(doc => doc.document_type === 'companyStamp')?.cloudinary_url || documentsRows.find(doc => doc.document_type === 'companyStamp')?.file_path,
        fileType: documentsRows.find(doc => doc.document_type === 'companyStamp')?.mime_type,
        fileSize: documentsRows.find(doc => doc.document_type === 'companyStamp')?.file_size,
        cloudinaryId: documentsRows.find(doc => doc.document_type === 'companyStamp')?.cloudinary_id
      } : null,
      
      // Authorized signature document (new required document)
      authorizedSignature: documentsRows.find(doc => doc.document_type === 'authorizedSignature') ? {
        name: documentsRows.find(doc => doc.document_type === 'authorizedSignature')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsRows.find(doc => doc.document_type === 'authorizedSignature')?.cloudinary_url || documentsRows.find(doc => doc.document_type === 'authorizedSignature')?.file_path,
        fileType: documentsRows.find(doc => doc.document_type === 'authorizedSignature')?.mime_type,
        fileSize: documentsRows.find(doc => doc.document_type === 'authorizedSignature')?.file_size,
        cloudinaryId: documentsRows.find(doc => doc.document_type === 'authorizedSignature')?.cloudinary_id
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