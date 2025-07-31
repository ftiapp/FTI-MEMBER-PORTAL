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

        // Fetch industry groups
        const industryGroupsResult = await query(
          'SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?',
          [id]
        );
        const industryGroupsRows = normalizeDbResult(industryGroupsResult);

        // Fetch province chapters
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

    // Fetch industry group names with timeout and fallback
    let industryGroupsWithNames = [];
    if (relatedData.industryGroupsRows.length > 0) {
      try {
        console.log('Fetching industry groups...');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const industrialGroupsResponse = await fetch(
          `${baseUrl}/api/industrial-groups?limit=1000`,
          { 
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (industrialGroupsResponse.ok) {
          const industrialGroupsData = await industrialGroupsResponse.json();
          
          industryGroupsWithNames = relatedData.industryGroupsRows.map(ig => {
            const groupData = industrialGroupsData.data?.find(g => 
              g.MEMBER_GROUP_CODE == ig.industry_group_id
            );
            return {
              id: ig.industry_group_id,
              industryGroupName: groupData ? groupData.MEMBER_GROUP_NAME : `กลุ่มอุตสาหกรรม ${ig.industry_group_id}`,
              name_th: groupData ? groupData.MEMBER_GROUP_NAME : `กลุ่มอุตสาหกรรม ${ig.industry_group_id}`
            };
          });
        } else {
          throw new Error(`API responded with status: ${industrialGroupsResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching industrial groups:', error.message);
        industryGroupsWithNames = relatedData.industryGroupsRows.map(ig => ({
          id: ig.industry_group_id,
          industryGroupName: `กลุ่มอุตสาหกรรม ${ig.industry_group_id}`,
          name_th: `กลุ่มอุตสาหกรรม ${ig.industry_group_id}`
        }));
      }
    }

    // Fetch province chapter names with timeout and fallback
    let provinceChaptersWithNames = [];
    if (relatedData.provinceChaptersRows.length > 0) {
      try {
        console.log('Fetching province chapters...');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const provinceChaptersResponse = await fetch(
          `${baseUrl}/api/province-groups?limit=1000`,
          { 
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (provinceChaptersResponse.ok) {
          const provinceChaptersData = await provinceChaptersResponse.json();
          
          provinceChaptersWithNames = relatedData.provinceChaptersRows.map(pc => {
            const chapterData = provinceChaptersData.data?.find(c => 
              c.MEMBER_GROUP_CODE == pc.province_chapter_id
            );
            return {
              id: pc.province_chapter_id,
              provinceChapterName: chapterData ? chapterData.MEMBER_GROUP_NAME : `สาขาจังหวัด ${pc.province_chapter_id}`,
              name_th: chapterData ? chapterData.MEMBER_GROUP_NAME : `สาขาจังหวัด ${pc.province_chapter_id}`
            };
          });
        } else {
          throw new Error(`API responded with status: ${provinceChaptersResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching province chapters:', error.message);
        provinceChaptersWithNames = relatedData.provinceChaptersRows.map(pc => ({
          id: pc.province_chapter_id,
          provinceChapterName: `สาขาจังหวัด ${pc.province_chapter_id}`,
          name_th: `สาขาจังหวัด ${pc.province_chapter_id}`
        }));
      }
    }

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
          otherBusinessTypeDetail = relatedData.businessTypeOther.detail || ''; // ใช้ detail แทน details
        }
      }
    });

    // Convert products to the format SummarySection expects - แก้ชื่อฟิลด์
    const productsFormatted = relatedData.products.map((product, index) => ({
      id: index + 1,
      nameTh: product.name_th || '', // ใช้ name_th แทน product_name_th
      nameEn: product.name_en || ''   // ใช้ name_en แทน product_name_en
    }));

    // Convert representatives to the format SummarySection expects - แก้ชื่อฟิลด์
    const representativesFormatted = relatedData.representatives.map((rep, index) => ({
      id: `rep_${rep.id || index}`,
      firstNameThai: rep.first_name_th || '',   // ใช้ first_name_th แทน first_name_thai
      lastNameThai: rep.last_name_th || '',     // ใช้ last_name_th แทน last_name_thai
      firstNameEnglish: rep.first_name_en || '', // ใช้ first_name_en แทน first_name_english
      lastNameEnglish: rep.last_name_en || '',   // ใช้ last_name_en แทน last_name_english
      position: rep.position || '',
      email: rep.email || '',
      phone: rep.phone || '',
      isPrimary: rep.is_primary === 1 || index === 0
    }));

    // Build response in the format that SummarySection expects
    const response = {
      // Company basic info (same field names as form) - แก้ไขชื่อฟิลด์ให้ถูกต้อง
      companyName: ocData.company_name_th || '',
      companyNameEng: ocData.company_name_en || '',
      taxId: ocData.tax_id || '',
      companyEmail: ocData.company_email || relatedData.address?.email || '',
      companyPhone: ocData.company_phone || relatedData.address?.phone || '',
      companyWebsite: relatedData.address?.website || '',
      
      // Address in the format SummarySection expects - แก้ไขชื่อฟิลด์
      addressNumber: relatedData.address?.address_number || '',
      moo: relatedData.address?.moo || '',
      soi: relatedData.address?.soi || '',
      street: relatedData.address?.street || '', // ใช้ street แทน road
      subDistrict: relatedData.address?.sub_district || '',
      district: relatedData.address?.district || '',
      province: relatedData.address?.province || '',
      postalCode: relatedData.address?.postal_code || '',
      
      // Contact person - ใช้ข้อมูลจาก ContactPerson table
      contactPersonFirstName: relatedData.contactPerson?.first_name_th || '',
      contactPersonLastName: relatedData.contactPerson?.last_name_th || '',
      contactPersonFirstNameEng: relatedData.contactPerson?.first_name_en || '',
      contactPersonLastNameEng: relatedData.contactPerson?.last_name_en || '',
      contactPersonPosition: relatedData.contactPerson?.position || '',
      contactPersonEmail: relatedData.contactPerson?.email || '',
      contactPersonPhone: relatedData.contactPerson?.phone || '',
      
      // Representatives
      representatives: representativesFormatted,
      
      // Business types in checkbox format
      businessTypes: businessTypesObject,
      otherBusinessTypeDetail: otherBusinessTypeDetail,
      
      // Products
      products: productsFormatted,
      numberOfEmployees: ocData.number_of_employees || '',
      
      // Industry groups - both old and new format for compatibility
      industryGroups: industryGroupsWithNames,
      industrialGroupIds: relatedData.industryGroupsRows.map(ig => ig.industry_group_id),
      industrialGroupNames: industryGroupsWithNames.map(ig => ig.name_th),
      
      // Province chapters - both old and new format for compatibility  
      provinceChapters: provinceChaptersWithNames,
      provincialChapterIds: relatedData.provinceChaptersRows.map(pc => pc.province_chapter_id),
      provincialChapterNames: provinceChaptersWithNames.map(pc => pc.name_th),
      
      // Factory type and documents (if applicable)
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