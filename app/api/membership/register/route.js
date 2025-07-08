import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database function to simulate database operations
const mockDbQuery = async (query, ...params) => {
  console.log('Mock DB Query:', query, params);
  return { rows: [] };
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract data from form
    const idCardNumber = formData.get('idCardNumber');
    const firstNameThai = formData.get('firstNameThai');
    const lastNameThai = formData.get('lastNameThai');
    const firstNameEnglish = formData.get('firstNameEnglish');
    const lastNameEnglish = formData.get('lastNameEnglish');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const addressNumber = formData.get('addressNumber');
    const moo = formData.get('moo');
    const soi = formData.get('soi');
    const road = formData.get('road');
    const subDistrict = formData.get('subDistrict');
    const district = formData.get('district');
    const province = formData.get('province');
    const postalCode = formData.get('postalCode');
    const industrialGroup = formData.get('industrialGroup');
    const provincialCouncil = formData.get('provincialCouncil');
    const businessTypes = JSON.parse(formData.get('businessTypes') || '[]');
    const otherBusinessType = formData.get('otherBusinessType');
    const products = formData.get('products');
    const additionalInfo = formData.get('additionalInfo');
    const memberType = formData.get('memberType');
    const idCardFile = formData.get('idCardFile');

    // Validate required fields
    if (!idCardNumber || !firstNameThai || !lastNameThai || !email || !phone) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Check if ID card already exists
    const checkResult = await mockDbQuery(
      'SELECT id FROM Regist_Membership_members WHERE id_card_number = $1 AND member_type_id = (SELECT id FROM Regist_Membership_member_types WHERE code = $2) AND (status = 0 OR status = 1)',
      idCardNumber,
      memberType
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { message: 'เลขบัตรประชาชนนี้มีในระบบแล้ว' },
        { status: 400 }
      );
    }

    // Get member type ID
    const memberTypeResult = await mockDbQuery(
      'SELECT id FROM Regist_Membership_member_types WHERE code = $1',
      memberType
    );

    if (memberTypeResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'ไม่พบประเภทสมาชิก' },
        { status: 400 }
      );
    }

    const memberTypeId = memberTypeResult.rows[0].id;

    // Generate a unique member ID
    const memberId = uuidv4();

    // Insert member data
    await mockDbQuery(
      'INSERT INTO Regist_Membership_members (id, member_type_id, id_card_number, first_name_th, last_name_th, first_name_en, last_name_en, email, phone, address_number, moo, soi, road, sub_district, district, province, postal_code, industrial_group_id, provincial_council_id, products, additional_info, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())',
      memberId, memberTypeId, idCardNumber, firstNameThai, lastNameThai,
      firstNameEnglish || null, lastNameEnglish || null, email, phone, addressNumber,
      moo || null, soi || null, road || null, subDistrict, district, province, postalCode,
      industrialGroup || null, provincialCouncil || null, products, additionalInfo || null,
      0
    );

    // Insert business types
    for (const businessType of businessTypes) {
      if (businessType !== 'other') {
        await mockDbQuery(
          'INSERT INTO Regist_Membership_member_business_types (member_id, business_type_id) VALUES ($1, $2)',
          memberId, businessType
        );
      }
    }

    // If 'other' business type is selected, add it to additional_info
    if (businessTypes.includes('other') && otherBusinessType) {
      await mockDbQuery(
        'UPDATE Regist_Membership_members SET additional_info = CONCAT(additional_info, $1) WHERE id = $2',
        '\nประเภทธุรกิจอื่นๆ: ' + otherBusinessType,
        memberId
      );
    }

    // Handle file upload (in a real application, you would upload to a storage service like Cloudinary)
    if (idCardFile) {
      // Here you would upload the file to a storage service and get a URL
      // For now, we'll just record that a file was uploaded
      await mockDbQuery(
        'INSERT INTO Regist_Membership_attachments (member_id, file_type, file_name, file_path, created_at) VALUES ($1, $2, $3, $4, NOW())',
        memberId, 'id_card', 'id_card.pdf', 'path/to/file'
      );
    }

    return NextResponse.json({ message: 'ลงทะเบียนสำเร็จ', memberId });
  } catch (error) {
    console.error('Error registering member:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลงทะเบียน' },
      { status: 500 }
    );
  }
}
