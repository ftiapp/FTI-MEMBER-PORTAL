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

    const { id } = await params;
    
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

    // Fetch address
    const addressResult = await query(
      'SELECT * FROM MemberRegist_AM_Address WHERE main_id = ?',
      [id]
    );

    // Fetch representatives
    const representativesResult = await query(
      'SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?',
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

    // ✅ Process industry groups - ใช้ industry_group_name จากตารางโดยตรง
    const industryGroupsWithNames = (industryGroupsResult || []).map(ig => ({
      id: ig.industry_group_id,
      industryGroupName: ig.industry_group_name || ig.industry_group_id,
      name_th: ig.industry_group_name || ig.industry_group_id
    }));

    // ✅ Process province chapters - ใช้ province_chapter_name จากตารางโดยตรง
    const provinceChaptersWithNames = (provinceChaptersResult || []).map(pc => ({
      id: pc.province_chapter_id,
      provinceChapterName: pc.province_chapter_name || pc.province_chapter_id,
      name_th: pc.province_chapter_name || pc.province_chapter_id
    }));

    // Transform data to match the format expected by the frontend
    const transformedData = {
      id: amData.id,
      memberCode: amData.member_code,
      associationName: amData.association_name_th,
      associationNameEng: amData.association_name_en,
      associationRegistrationNumber: amData.association_registration_number,
      associationEmail: amData.association_email,
      associationPhone: amData.association_phone,
      memberCount: amData.member_count,
      status: amData.status,
      createdAt: amData.created_at,
      updatedAt: amData.updated_at,
      
      // Address data
      addressNumber: addressResult?.[0]?.address_number,
      moo: addressResult?.[0]?.moo,
      soi: addressResult?.[0]?.soi,
      road: addressResult?.[0]?.road,
      subDistrict: addressResult?.[0]?.sub_district,
      district: addressResult?.[0]?.district,
      province: addressResult?.[0]?.province,
      postalCode: addressResult?.[0]?.postal_code,
      
      // Representatives
      representatives: (representativesResult || []).map(rep => ({
        firstNameThai: rep.first_name_th,
        lastNameThai: rep.last_name_th,
        firstNameEng: rep.first_name_en,
        lastNameEng: rep.last_name_en,
        email: rep.email,
        phone: rep.phone,
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
      
      // ✅ Industry Groups - ใช้ข้อมูลจากตารางโดยตรง
      industrialGroups: industryGroupsWithNames.map(ig => ({
        id: ig.id,
        name_th: ig.name_th
      })),
      
      // ✅ Province Chapters - ใช้ข้อมูลจากตารางโดยตรง
      provincialCouncils: provinceChaptersWithNames.map(pc => ({
        id: pc.id,
        name_th: pc.name_th
      })),
      
      // Documents
      associationCertificate: documentsResult?.find(doc => doc.document_type === 'associationCertificate') ? {
        name: documentsResult.find(doc => doc.document_type === 'associationCertificate')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsResult.find(doc => doc.document_type === 'associationCertificate')?.cloudinary_url || documentsResult.find(doc => doc.document_type === 'associationCertificate')?.file_path
      } : null,
      
      memberList: documentsResult?.find(doc => doc.document_type === 'memberList') ? {
        name: documentsResult.find(doc => doc.document_type === 'memberList')?.file_name || 'ไฟล์ถูกอัปโหลดแล้ว',
        fileUrl: documentsResult.find(doc => doc.document_type === 'memberList')?.cloudinary_url || documentsResult.find(doc => doc.document_type === 'memberList')?.file_path
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      data: transformedData 
    });

  } catch (error) {
    console.error('Error fetching AM summary:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}