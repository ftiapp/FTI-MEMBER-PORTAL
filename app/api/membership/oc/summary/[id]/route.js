import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkUserSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/db';

const BUSINESS_TYPE_MAP = {
  '1': 'ผู้ผลิต',
  '2': 'ผู้ค้า',
  '3': 'ผู้ให้บริการ',
  '4': 'ผู้ส่งออก',
  '5': 'ผู้นำเข้า',
  '6': 'อื่นๆ'
};

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Fetch main OC data
    const mainQueryResult = await query(
      'SELECT * FROM MemberRegist_OC_Main WHERE id = ?',
      [id]
    );
    const mainResult = Array.isArray(mainQueryResult) ? mainQueryResult : (mainQueryResult?.[0] || []);

    if (!mainResult || mainResult.length === 0) {
      return NextResponse.json({ error: 'OC application not found' }, { status: 404 });
    }

    const ocData = mainResult[0];

    // Fetch address
    const addressResult = await query(
      'SELECT * FROM MemberRegist_OC_Address WHERE main_id = ?',
      [id]
    );
    const addressRows = Array.isArray(addressResult) ? addressResult : (addressResult?.[0] || []);

    // Fetch representatives
    const representativesResult = await query(
      'SELECT * FROM MemberRegist_OC_Representatives WHERE main_id = ?',
      [id]
    );
    const representativesRows = Array.isArray(representativesResult) ? representativesResult : (representativesResult?.[0] || []);

    // Fetch business types
    const businessTypesResult = await query(
      'SELECT * FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?',
      [id]
    );
    const businessTypesRows = Array.isArray(businessTypesResult) ? businessTypesResult : (businessTypesResult?.[0] || []);

    // Fetch business type other if exists
    let businessTypeOther = null;
    const hasOtherBusinessType = Array.isArray(businessTypesRows) && businessTypesRows.find(bt => bt.business_type_id === 6);
    if (hasOtherBusinessType) {
      const otherQueryResult = await query(
        'SELECT * FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?',
        [id]
      );
      const otherResult = Array.isArray(otherQueryResult) ? otherQueryResult : (otherQueryResult?.[0] || []);
      businessTypeOther = otherResult?.[0] || null;
    }

    // Fetch products/services
    const productsResult = await query(
      'SELECT * FROM MemberRegist_OC_Products WHERE main_id = ?',
      [id]
    );
    const productsRows = Array.isArray(productsResult) ? productsResult : (productsResult?.[0] || []);

    // Fetch industry groups
    const industryGroupsResult = await query(
      'SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?',
      [id]
    );
    const industryGroupsRows = Array.isArray(industryGroupsResult) ? industryGroupsResult : (industryGroupsResult?.[0] || []);

    // Fetch province chapters
    const provinceChaptersResult = await query(
      'SELECT * FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?',
      [id]
    );
    const provinceChaptersRows = Array.isArray(provinceChaptersResult) ? provinceChaptersResult : (provinceChaptersResult?.[0] || []);

    // Fetch documents
    const documentsResult = await query(
      'SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ?',
      [id]
    );
    const documentsRows = Array.isArray(documentsResult) ? documentsResult : (documentsResult?.[0] || []);

    // Map business types with names
    const businessTypes = Array.isArray(businessTypesRows) ? businessTypesRows.map(bt => ({
      id: bt.business_type_id,
      name: BUSINESS_TYPE_MAP[bt.business_type_id] || bt.business_type_id,
      details: bt.business_type_id === 6 && businessTypeOther ? businessTypeOther.details : null
    })) : [];

    // Fetch industry group names from external API
    let industryGroupsWithNames = [];
    if (Array.isArray(industryGroupsRows) && industryGroupsRows.length > 0) {
      try {
        const industrialGroupsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/industrial-groups?limit=1000`);
        if (industrialGroupsResponse.ok) {
          const industrialGroupsData = await industrialGroupsResponse.json();
          
          industryGroupsWithNames = industryGroupsRows.map(ig => {
            const groupData = industrialGroupsData.data?.find(g => g.MEMBER_GROUP_CODE == ig.industry_group_id);
            return {
              id: ig.industry_group_id,
              industryGroupName: groupData ? groupData.MEMBER_GROUP_NAME : ig.industry_group_id
            };
          });
        }
      } catch (error) {
        console.error('Error fetching industrial groups:', error);
        industryGroupsWithNames = industryGroupsRows.map(ig => ({
          id: ig.industry_group_id,
          industryGroupName: ig.industry_group_id
        }));
      }
    }

    // Fetch province chapter names from external API
    let provinceChaptersWithNames = [];
    if (Array.isArray(provinceChaptersRows) && provinceChaptersRows.length > 0) {
      try {
        const provinceChaptersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/province-groups?limit=1000`);
        if (provinceChaptersResponse.ok) {
          const provinceChaptersData = await provinceChaptersResponse.json();
          
          provinceChaptersWithNames = provinceChaptersRows.map(pc => {
            const chapterData = provinceChaptersData.data?.find(c => c.MEMBER_GROUP_CODE == pc.province_chapter_id);
            return {
              id: pc.province_chapter_id,
              provinceChapterName: chapterData ? chapterData.MEMBER_GROUP_NAME : pc.province_chapter_id
            };
          });
        }
      } catch (error) {
        console.error('Error fetching province chapters:', error);
        provinceChaptersWithNames = provinceChaptersRows.map(pc => ({
          id: pc.province_chapter_id,
          provinceChapterName: pc.province_chapter_id
        }));
      }
    }

    // Build response
    const response = {
      id: ocData.id,
      memberCode: ocData.member_code,
      companyName: ocData.company_name,
      taxId: ocData.tax_id,
      status: ocData.status,
      createdAt: ocData.created_at,
      updatedAt: ocData.updated_at,
      
      // Address
      address: addressRows?.[0] || null,
      
      // Representatives
      representatives: representativesRows || [],
      
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
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching OC summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
