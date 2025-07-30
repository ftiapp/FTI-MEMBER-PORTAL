import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { query } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาเข้าสู่ระบบ' 
      }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // ดึงข้อมูลหลักจาก MemberRegist_IC_Main
    const mainQuery = `
      SELECT 
        m.*
      FROM MemberRegist_IC_Main m
      WHERE m.id = ? AND m.user_id = ?
    `;
    
    const mainResult = await query(mainQuery, [id, userId]);
    
    if (!mainResult || mainResult.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลใบสมัคร'
      }, { status: 404 });
    }

    const mainData = mainResult[0];

    // ดึงข้อมูลที่อยู่
    const addressQuery = `
      SELECT * FROM MemberRegist_IC_Address 
      WHERE main_id = ?
    `;
    const addressResult = await query(addressQuery, [id]);

    // ดึงข้อมูลผู้แทน
    const representativeQuery = `
      SELECT * FROM MemberRegist_IC_Representatives 
      WHERE main_id = ?
    `;
    const representativeResult = await query(representativeQuery, [id]);

    // ดึงข้อมูล Business Types (ใช้ข้อมูล hardcode เหมือน BusinessInfoSection)
    const BUSINESS_TYPES_MAP = {
      'manufacturer': 'ผู้ผลิต',
      'distributor': 'ผู้จัดจำหน่าย', 
      'importer': 'ผู้นำเข้า',
      'exporter': 'ผู้ส่งออก',
      'service': 'ผู้ให้บริการ',
      'other': 'อื่นๆ'
    };
    
    const businessTypesQuery = `
      SELECT * FROM MemberRegist_IC_BusinessTypes 
      WHERE main_id = ?
    `;
    const businessTypesRaw = await query(businessTypesQuery, [id]);
    
    // แปลง business types ให้มี businessTypeName
    const businessTypes = businessTypesRaw.map(bt => ({
      ...bt,
      businessTypeName: BUSINESS_TYPES_MAP[bt.business_type_id] || bt.business_type_id
    }));

    // ดึงข้อมูลประเภทธุรกิจอื่นๆ
    const businessTypeOtherQuery = `
      SELECT * FROM MemberRegist_IC_BusinessTypeOther 
      WHERE main_id = ?
    `;
    const businessTypeOtherResult = await query(businessTypeOtherQuery, [id]);

    // ดึงข้อมูลผลิตภัณฑ์
    const productsQuery = `
      SELECT * FROM MemberRegist_IC_Products 
      WHERE main_id = ?
    `;
    const productsResult = await query(productsQuery, [id]);

    // ดึงข้อมูล Industry Groups (ไม่ใช้ JOIN เพราะตาราง IndustryGroups ไม่มี)
    const industryGroupsQuery = `
      SELECT * FROM MemberRegist_IC_IndustryGroups 
      WHERE main_id = ?
    `;
    const industryGroupsResult = await query(industryGroupsQuery, [id]);

    // ดึงข้อมูลสภาอุตสาหกรรมจังหวัด (ไม่ใช้ JOIN เพราะตาราง ProvinceChapters อาจไม่มี)
    const provinceChaptersQuery = `
      SELECT * FROM MemberRegist_IC_ProvinceChapters 
      WHERE main_id = ?
    `;
    const provinceChaptersResult = await query(provinceChaptersQuery, [id]);

    // ดึงข้อมูลเอกสาร
    const documentsQuery = `
      SELECT * FROM MemberRegist_IC_Documents 
      WHERE main_id = ?
    `;
    const documentsResult = await query(documentsQuery, [id]);

    // รวมข้อมูลทั้งหมด
    const applicationData = {
      // ข้อมูลหลัก
      id: mainData.id,
      idCardNumber: mainData.id_card_number,
      firstNameTh: mainData.first_name_th,
      lastNameTh: mainData.last_name_th,
      firstNameEn: mainData.first_name_en,
      lastNameEn: mainData.last_name_en,
      phone: mainData.phone,
      email: mainData.email,
      status: mainData.status,
      createdAt: mainData.created_at,
      updatedAt: mainData.updated_at,

      // ข้อมูลที่อยู่
      address: addressResult.length > 0 ? {
        addressNumber: addressResult[0].address_number,
        moo: addressResult[0].moo,
        soi: addressResult[0].soi,
        road: addressResult[0].road,
        subDistrict: addressResult[0].sub_district,
        district: addressResult[0].district,
        province: addressResult[0].province,
        postalCode: addressResult[0].postal_code,
        phone: addressResult[0].phone,
        email: addressResult[0].email,
        website: addressResult[0].website
      } : null,

      // ข้อมูลผู้แทน (IC มีได้แค่คนเดียว)
      representative: representativeResult.length > 0 ? {
        firstNameTh: representativeResult[0].first_name_th,
        lastNameTh: representativeResult[0].last_name_th,
        firstNameEn: representativeResult[0].first_name_en,
        lastNameEn: representativeResult[0].last_name_en,
        position: representativeResult[0].position,
        email: representativeResult[0].email,
        phone: representativeResult[0].phone
      } : null,

      // ข้อมูลประเภทธุรกิจ
      businessTypes: businessTypes.map(bt => ({
        id: bt.business_type_id,
        businessTypeName: bt.businessTypeName || bt.business_type_id
      })),

      // ข้อมูลประเภทธุรกิจอื่นๆ
      businessTypeOther: businessTypeOtherResult.map(bto => ({
        otherType: bto.other_type
      })),

      // ข้อมูลผลิตภัณฑ์
      products: productsResult.map(p => ({
        nameTh: p.name_th,
        nameEn: p.name_en
      })),

      // ข้อมูลกลุ่มอุตสาหกรรม (ใช้ข้อมูลจากตาราง MemberRegist_IC_IndustryGroups โดยตรง)
      industryGroups: industryGroupsResult.map(ig => ({
        id: ig.industry_group_id,
        industryGroupName: ig.industry_group_id // ใช้ ID เป็นชื่อเพราะไม่มีตาราง IndustryGroups
      })),

      // ข้อมูลสภาอุตสาหกรรมจังหวัด (ใช้ข้อมูลจากตาราง MemberRegist_IC_ProvinceChapters โดยตรง)
      provinceChapters: provinceChaptersResult.map(pc => ({
        id: pc.province_chapter_id,
        provinceChapterName: pc.province_chapter_id // ใช้ ID เป็นชื่อเพราะไม่มีตาราง ProvinceChapters
      })),

      // ข้อมูลเอกสาร
      documents: documentsResult.map(d => ({
        fileName: d.file_name,
        fileUrl: d.file_url,
        fileType: d.file_type,
        createdAt: d.created_at
      }))
    };

    return NextResponse.json({
      success: true,
      data: applicationData
    });

  } catch (error) {
    console.error('Error fetching IC application data:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    }, { status: 500 });
  }
}
