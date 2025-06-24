import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();
    
    // Combine first name and last name for database compatibility
    const nameThai = `${data.firstNameThai || ''} ${data.lastNameThai || ''}`.trim();
    const nameEnglish = `${data.firstNameEnglish || ''} ${data.lastNameEnglish || ''}`.trim();
    const representativeNameThai = `${data.representativeFirstNameThai || ''} ${data.representativeLastNameThai || ''}`.trim();
    const representativeNameEnglish = `${data.representativeFirstNameEnglish || ''} ${data.representativeLastNameEnglish || ''}`.trim();
    
    // Validate required fields
    if (!data.idCardNumber || !data.firstNameThai || !data.lastNameThai) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (!data.representativeFirstNameThai || !data.representativeLastNameThai || !data.representativeEmail) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลผู้แทนให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Check if industry groups and province chapters are selected
    const selectedGroups = data.selectedIndustryGroups || [];
    const selectedChapters = data.selectedProvinceChapters || [];
    
    if (selectedGroups.length === 0 || selectedChapters.length === 0) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเลือกกลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด' },
        { status: 400 }
      );
    }

    // Check if user already has a pending application
    const existingApplication = await query(
      `SELECT * FROM ic_membership_applications WHERE user_id = ? AND status = 'pending'`,
      [userId]
    );

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { success: false, message: 'คุณมีคำขอสมัครสมาชิกที่รอการพิจารณาอยู่แล้ว' },
        { status: 400 }
      );
    }

    // Insert application into database
    const result = await query(
      `INSERT INTO ic_membership_applications (
        user_id, 
        id_card_number, 
        name_thai, 
        name_english, 
        representative_name_thai, 
        representative_name_english, 
        representative_email, 
        representative_mobile,
        address_number,
        address_building,
        address_moo,
        address_soi,
        address_road,
        address_subdistrict,
        address_district,
        address_province,
        address_postal_code,
        website,
        facebook,
        phone,
        email,
        fax,
        products_thai,
        products_english,
        status,
        created_at,
        first_name_thai,
        last_name_thai,
        first_name_english,
        last_name_english,
        representative_first_name_thai,
        representative_last_name_thai,
        representative_first_name_english,
        representative_last_name_english
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.idCardNumber,
        nameThai,
        nameEnglish,
        representativeNameThai,
        representativeNameEnglish,
        data.representativeEmail,
        data.representativeMobile,
        data.addressNumber,
        data.addressBuilding,
        data.addressMoo,
        data.addressSoi,
        data.addressRoad,
        data.addressSubdistrict,
        data.addressDistrict,
        data.addressProvince,
        data.addressPostalCode,
        data.website,
        data.facebook,
        data.phone,
        data.email,
        data.fax,
        data.productsThai,
        data.productsEnglish,
        'pending',
        data.firstNameThai,
        data.lastNameThai,
        data.firstNameEnglish || '',
        data.lastNameEnglish || '',
        data.representativeFirstNameThai,
        data.representativeLastNameThai,
        data.representativeFirstNameEnglish || '',
        data.representativeLastNameEnglish || ''
      ]
    );

    const applicationId = result.insertId;

    // Insert industry groups
    for (const groupId of (data.selectedIndustryGroups || [])) {
      await query(
        `INSERT INTO ic_membership_industry_groups (application_id, industry_group_id) VALUES (?, ?)`,
        [applicationId, groupId]
      );
    }

    // Insert province chapters
    for (const chapterId of (data.selectedProvinceChapters || [])) {
      await query(
        `INSERT INTO ic_membership_province_chapters (application_id, province_chapter_id) VALUES (?, ?)`,
        [applicationId, chapterId]
      );
    }

    // Insert business types
    if (data.businessTypes && data.businessTypes.length > 0) {
      for (const type of data.businessTypes) {
        await query(
          `INSERT INTO ic_membership_business_types (application_id, type_name) VALUES (?, ?)`,
          [applicationId, type]
        );
      }
    }

    // Insert business categories
    if (data.businessCategories && data.businessCategories.length > 0) {
      for (const category of data.businessCategories) {
        await query(
          `INSERT INTO ic_membership_business_categories (application_id, category_id) VALUES (?, ?)`,
          [applicationId, category]
        );
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'ส่งข้อมูลการสมัครสมาชิกเรียบร้อยแล้ว',
      applicationId
    });

  } catch (error) {
    console.error('Error submitting IC membership application:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อมูล: ' + error.message },
      { status: 500 }
    );
  }
}
