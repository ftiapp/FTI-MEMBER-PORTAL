import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkUserSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/db';

const BUSINESS_TYPE_MAP = {
  '1': 'ผู้ผลิต',
  '2': 'ผู้จัดจำหน่าย', 
  '3': 'ผู้นำเข้า',
  '4': 'ผู้ส่งออก',
  '5': 'ผู้ให้บริการ',
  '6': 'อื่นๆ'
};

// Helper function to normalize database results
function normalizeDbResult(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result[0])) return result[0];
  return [result];
}

// Helper function to get single record
function getSingleRecord(result) {
  const normalized = normalizeDbResult(result);
  return normalized.length > 0 ? normalized[0] : null;
}

export async function GET(request, { params }) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { id } = await params;
    console.log('Fetching OC data for ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter', success: false }, { status: 400 });
    }

    // Fetch main OC data
    console.log('Querying main OC data...');
    const mainQueryResult = await query(
      'SELECT * FROM MemberRegist_OC_Main WHERE id = ?',
      [id]
    );
    
    const ocData = getSingleRecord(mainQueryResult);
    console.log('Main OC data result:', ocData ? 'Found' : 'Not found');

    if (!ocData) {
      return NextResponse.json({ 
        error: 'OC application not found', 
        success: false 
      }, { status: 404 });
    }

    // Fetch related data
    const fetchRelatedData = async () => {
      try {
        console.log('Fetching related data...');
        
        // Fetch address
        const addressResult = await query(
          'SELECT * FROM MemberRegist_OC_Address WHERE main_id = ?',
          [id]
        );
        const address = getSingleRecord(addressResult);

        // Fetch contact person
        const contactPersonResult = await query(
          'SELECT * FROM MemberRegist_OC_ContactPerson WHERE main_id = ?',
          [id]
        );
        const contactPerson = getSingleRecord(contactPersonResult);

        // Fetch representatives
        const representativesResult = await query(
          'SELECT * FROM MemberRegist_OC_Representatives WHERE main_id = ?',
          [id]
        );
        const representatives = normalizeDbResult(representativesResult);

        // Fetch business types
        const businessTypesResult = await query(
          'SELECT * FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?',
          [id]
        );
        const businessTypesRows = normalizeDbResult(businessTypesResult);

        // Fetch business type other if exists
        let businessTypeOther = null;
        const hasOtherBusinessType = businessTypesRows.find(bt => bt.business_type_id === 6 || bt.business_type_id === '6');
        if (hasOtherBusinessType) {
          const otherQueryResult = await query(
            'SELECT * FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?',
            [id]
          );
          businessTypeOther = getSingleRecord(otherQueryResult);
        }

        // Fetch products/services
        const productsResult = await query(
          'SELECT * FROM MemberRegist_OC_Products WHERE main_id = ?',
          [id]
        );
        const products = normalizeDbResult(productsResult);

        // ✅ Fetch industry groups - ใช้ข้อมูลจากตารางโดยตรง
        const industryGroupsResult = await query(
          'SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?',
          [id]
        );
        const industryGroupsRows = normalizeDbResult(industryGroupsResult);

        // ✅ Fetch province chapters - ใช้ข้อมูลจากตารางโดยตรง
        const provinceChaptersResult = await query(
          'SELECT * FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?',
          [id]
        );
        const provinceChaptersRows = normalizeDbResult(provinceChaptersResult);

        // Fetch documents
        const documentsResult = await query(
          'SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ?',
          [id]
        );
        const documents = normalizeDbResult(documentsResult);

        return {
          address,
          contactPerson,
          representatives,
          businessTypesRows,
          businessTypeOther,
          products,
          industryGroupsRows,
          provinceChaptersRows,
          documents
        };
      } catch (error) {
        console.error('Error fetching related data:', error);
        throw error;
      }
    };

    const relatedData = await fetchRelatedData();

    // ✅ Process industry groups - ใช้ industry_group_name จากตารางโดยตรง
    const industryGroupsWithNames = relatedData.industryGroupsRows.map(ig => ({
      id: ig.industry_group_id,
      industryGroupName: ig.industry_group_name || ig.industry_group_id,
      name_th: ig.industry_group_name || ig.industry_group_id
    }));

    // ✅ Process province chapters - ใช้ province_chapter_name จากตารางโดยตรง
    const provinceChaptersWithNames = relatedData.provinceChaptersRows.map(pc => ({
      id: pc.province_chapter_id,
      provinceChapterName: pc.province_chapter_name || pc.province_chapter_id,
      name_th: pc.province_chapter_name || pc.province_chapter_id
    }));

    // ===== สร้างข้อมูลในรูปแบบที่ SummarySection คาดหวัง =====
    
    // Convert business types to checkbox format that SummarySection expects
    const businessTypesObject = {};
    let otherBusinessTypeDetail = '';
    
    relatedData.businessTypesRows.forEach(bt => {
      const typeId = bt.business_type; // ใช้ business_type แทน business_type_id
      if (typeId === 'manufacturer') businessTypesObject.manufacturer = true;
      else if (typeId === 'distributor') businessTypesObject.distributor = true;
      else if (typeId === 'importer') businessTypesObject.importer = true;
      else if (typeId === 'exporter') businessTypesObject.exporter = true;
      else if (typeId === 'service') businessTypesObject.service = true;
      else if (typeId === 'other') {
        businessTypesObject.other = true;
        if (relatedData.businessTypeOther) {
          otherBusinessTypeDetail = relatedData.businessTypeOther.detail || '';
        }
      }
    });

    // Convert products to the format SummarySection expects
    const productsFormatted = relatedData.products.map((product, index) => ({
      id: index + 1,
      nameTh: product.name_th || '',
      nameEn: product.name_en || ''
    }));

    // Convert representatives to the format SummarySection expects
    const representativesFormatted = relatedData.representatives.map((rep, index) => ({
      id: `rep_${rep.id || index}`,
      firstNameThai: rep.first_name_th || '',
      lastNameThai: rep.last_name_th || '',
      firstNameEnglish: rep.first_name_en || '',
      lastNameEnglish: rep.last_name_en || '',
      position: rep.position || '',
      email: rep.email || '',
      phone: rep.phone || '',
      isPrimary: rep.is_primary === 1 || index === 0
    }));

    // Build response in the format that SummarySection expects
    const response = {
      // Company basic info
      companyName: ocData.company_name_th || '',
      companyNameEng: ocData.company_name_en || '',
      taxId: ocData.tax_id || '',
      companyEmail: ocData.company_email || relatedData.address?.email || '',
      companyPhone: ocData.company_phone || relatedData.address?.phone || '',
      companyWebsite: relatedData.address?.website || '',
      
      // Address
      addressNumber: relatedData.address?.address_number || '',
      moo: relatedData.address?.moo || '',
      soi: relatedData.address?.soi || '',
      street: relatedData.address?.street || '',
      subDistrict: relatedData.address?.sub_district || '',
      district: relatedData.address?.district || '',
      province: relatedData.address?.province || '',
      postalCode: relatedData.address?.postal_code || '',
      
      // Contact person
      contactPersonFirstName: relatedData.contactPerson?.first_name_th || '',
      contactPersonLastName: relatedData.contactPerson?.last_name_th || '',
      contactPersonFirstNameEng: relatedData.contactPerson?.first_name_en || '',
      contactPersonLastNameEng: relatedData.contactPerson?.last_name_en || '',
      contactPersonPosition: relatedData.contactPerson?.position || '',
      contactPersonEmail: relatedData.contactPerson?.email || '',
      contactPersonPhone: relatedData.contactPerson?.phone || '',
      
      // Representatives
      representatives: representativesFormatted,
      
      // Business types
      businessTypes: businessTypesObject,
      otherBusinessTypeDetail: otherBusinessTypeDetail,
      
      // Products
      products: productsFormatted,
      numberOfEmployees: ocData.number_of_employees || '',
      
      // ✅ Industry groups - ใช้ข้อมูลจากตารางโดยตรง
      industryGroups: industryGroupsWithNames,
      industrialGroupIds: relatedData.industryGroupsRows.map(ig => ig.industry_group_id),
      industrialGroupNames: industryGroupsWithNames.map(ig => ig.name_th),
      
      // ✅ Province chapters - ใช้ข้อมูลจากตารางโดยตรง  
      provinceChapters: provinceChaptersWithNames,
      provincialChapterIds: relatedData.provinceChaptersRows.map(pc => pc.province_chapter_id),
      provincialChapterNames: provinceChaptersWithNames.map(pc => pc.name_th),
      
      // Factory type and documents
      factoryType: ocData.factory_type || '',
      factoryLicense: relatedData.documents.find(doc => doc.document_type === 'factory_license') ? {
        name: relatedData.documents.find(doc => doc.document_type === 'factory_license').file_name,
        file: null
      } : null,
      industrialEstateLicense: relatedData.documents.find(doc => doc.document_type === 'industrial_estate_license') ? {
        name: relatedData.documents.find(doc => doc.document_type === 'industrial_estate_license').file_name,
        file: null
      } : null,
      productionImages: relatedData.documents.filter(doc => doc.document_type === 'production_image').map(doc => ({
        name: doc.file_name,
        file: null
      })),
      
      // Meta data
      id: ocData.id,
      memberCode: ocData.member_code,
      status: ocData.status,
      createdAt: ocData.created_at,
      updatedAt: ocData.updated_at
    };

    return NextResponse.json({ success: true, data: response });

  } catch (error) {
    console.error('Error in OC summary API:', {
      message: error.message,
      stack: error.stack,
      id: params?.id
    });
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({ 
      success: false,
      error: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    }, { status: 500 });
  }
}