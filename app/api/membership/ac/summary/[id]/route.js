import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Fetch main AC data
    const [mainResult] = await query(
      'SELECT * FROM MemberRegist_AC_Main WHERE id = ?',
      [id]
    );

    if (!mainResult || mainResult.length === 0) {
      return NextResponse.json({ error: 'AC application not found' }, { status: 404 });
    }

    const acData = mainResult[0];

    // Fetch address
    const [addressRows] = await query(
      'SELECT * FROM MemberRegist_AC_Address WHERE main_id = ?',
      [id]
    );

    // Fetch representatives
    const [representativesRows] = await query(
      'SELECT * FROM MemberRegist_AC_Representatives WHERE main_id = ?',
      [id]
    );

    // Fetch business types
    const [businessTypesRows] = await query(
      'SELECT * FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?',
      [id]
    );

    // Fetch business type other if exists
    let businessTypeOther = null;
    const hasOtherBusinessType = Array.isArray(businessTypesRows) && businessTypesRows.find(bt => bt.business_type_id === 6);
    if (hasOtherBusinessType) {
      const [otherResult] = await query(
        'SELECT * FROM MemberRegist_AC_BusinessTypeOther WHERE main_id = ?',
        [id]
      );
      businessTypeOther = otherResult?.[0] || null;
    }

    // Fetch products/services
    const [productsRows] = await query(
      'SELECT * FROM MemberRegist_AC_Products WHERE main_id = ?',
      [id]
    );

    // Fetch industry groups
    const [industryGroupsRows] = await query(
      'SELECT * FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?',
      [id]
    );

    // Fetch province chapters
    const [provinceChaptersRows] = await query(
      'SELECT * FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?',
      [id]
    );

    // Fetch documents
    const [documentsRows] = await query(
      'SELECT * FROM MemberRegist_AC_Documents WHERE main_id = ?',
      [id]
    );

    // Map business types with names
    const businessTypes = businessTypesRows?.map(bt => ({
      id: bt.business_type_id,
      name: BUSINESS_TYPE_MAP[bt.business_type_id] || bt.business_type_id,
      details: bt.business_type_id === 6 && businessTypeOther ? businessTypeOther.details : null
    })) || [];

    // Fetch industry group names from external API
    let industryGroupsWithNames = [];
    if (industryGroupsRows && industryGroupsRows.length > 0) {
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
    if (provinceChaptersRows && provinceChaptersRows.length > 0) {
      try {
        const provinceChaptersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/member/ac-membership/province-chapters?limit=1000`);
        if (provinceChaptersResponse.ok) {
          const provinceChaptersData = await provinceChaptersResponse.json();
          
          provinceChaptersWithNames = provinceChaptersRows.map(pc => {
            const chapterData = provinceChaptersData.data?.find(c => c.PROVINCE_CODE == pc.province_chapter_id);
            return {
              id: pc.province_chapter_id,
              provinceChapterName: chapterData ? chapterData.PROVINCE_NAME : pc.province_chapter_id
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
      id: acData.id,
      memberCode: acData.member_code,
      companyName: acData.company_name,
      taxId: acData.tax_id,
      status: acData.status,
      createdAt: acData.created_at,
      updatedAt: acData.updated_at,
      
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
      documents: documentsResult || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching AC summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
