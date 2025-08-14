import { NextResponse } from 'next/server';
import { executeQueryWithoutTransaction } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { applicationId, type, section, data } = await request.json();

    if (!applicationId || !type || !section || !data) {
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ครบถ้วน' 
      }, { status: 400 });
    }

    try {
      let updateResult;

      switch (section) {
        case 'products':
          updateResult = await updateProducts(applicationId, type, data);
          break;
        case 'addresses':
          updateResult = await updateAddresses(applicationId, type, data);
          break;
        case 'industrialGroups':
          updateResult = await updateIndustrialGroups(applicationId, type, data);
          break;
        case 'representatives':
          updateResult = await updateRepresentatives(applicationId, type, data);
          break;
        case 'contactPersons':
          updateResult = await updateContactPersons(applicationId, type, data);
          break;
        case 'companyInfo':
          updateResult = await updateCompanyInfo(applicationId, type, data);
          break;
        case 'applicantInfo':
          updateResult = await updateApplicantInfo(applicationId, type, data);
          break;
        default:
          throw new Error(`ไม่รองรับการแก้ไขส่วน: ${section}`);
      }

      // บันทึก log การแก้ไข
      await executeQueryWithoutTransaction(
        `INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          admin.id,
          'Admin_Update_MemberRegist', // ใช้ ENUM ใหม่ที่เพิ่มเข้าไปในตาราง
          applicationId,
          JSON.stringify({ type, section, changes: data }),
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '::1',
          request.headers.get('user-agent') || ''
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'อัปเดตข้อมูลสำเร็จ'
      });

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('Error updating membership data:', error);
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
      details: error.message
    }, { status: 500 });
  }
}

// ฟังก์ชันสำหรับอัปเดตสินค้า
async function updateProducts(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Products`;
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [applicationId]);
  
  // เพิ่มข้อมูลใหม่
  if (data.products && data.products.length > 0) {
    for (const product of data.products) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (main_id, name_th, name_en, description) VALUES (?, ?, ?, ?)`,
        [applicationId, product.productNameTh || product.nameTh || '', product.productNameEn || product.nameEn || '', product.description || '']
      );
    }
  }
  
  return { updated: data.products?.length || 0 };
}

// ฟังก์ชันสำหรับอัปเดตที่อยู่
async function updateAddresses(applicationId, type, addressData) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Address`;
  
  // รองรับทั้ง object เดี่ยวและ array
  const addresses = Array.isArray(addressData) ? addressData : [addressData];
  
  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [applicationId]);
  
  // เพิ่มข้อมูลใหม่
  if (addresses && addresses.length > 0) {
    for (const [index, address] of addresses.entries()) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (
          main_id, building, address_number, moo, soi, street, 
          sub_district, district, province, postal_code, 
          phone, email, website, address_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          address.building || '',
          address.addressNumber || address.address_number || '',
          address.moo || '',
          address.soi || '',
          address.street || '',
          address.subDistrict || address.subdistrict || address.sub_district || '',
          address.district || '',
          address.province || '',
          address.postalCode || address.postal_code || '',
          address.phone || '',
          address.email || '',
          address.website || '',
          address.addressType || (index + 1).toString()
        ]
      );
    }
  }
  
  return { updated: addresses.length };
}

// ฟังก์ชันสำหรับอัปเดตกลุ่มอุตสาหกรรม
async function updateIndustrialGroups(applicationId, type, data) {
  const industrialTable = `MemberRegist_${type.toUpperCase()}_IndustryGroups`;
  const provincialTable = `MemberRegist_${type.toUpperCase()}_ProvinceChapters`;
  
  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${industrialTable} WHERE main_id = ?`, [applicationId]);
  await executeQueryWithoutTransaction(`DELETE FROM ${provincialTable} WHERE main_id = ?`, [applicationId]);
  
  // เพิ่มข้อมูลกลุ่มอุตสาหกรรมใหม่
  if (data.industrialGroups && data.industrialGroups.length > 0) {
    for (const group of data.industrialGroups) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${industrialTable} (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
        [applicationId, group.id || group.industry_group_id, group.name || group.industry_group_name || '']
      );
    }
  }
  
  // เพิ่มข้อมูลสภาจังหวัดใหม่
  if (data.provincialChapters && data.provincialChapters.length > 0) {
    for (const chapter of data.provincialChapters) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${provincialTable} (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
        [applicationId, chapter.id || chapter.province_chapter_id, chapter.name || chapter.province_chapter_name || '']
      );
    }
  }
  
  return { 
    industrialGroups: data.industrialGroups?.length || 0,
    provincialChapters: data.provincialChapters?.length || 0
  };
}

// ฟังก์ชันสำหรับอัปเดตผู้แทน
async function updateRepresentatives(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Representatives`;
  
  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [applicationId]);
  
  // เพิ่มข้อมูลใหม่
  if (data && data.length > 0) {
    for (const rep of data) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en,
          position, email, phone, phone_extension
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          rep.firstNameTh || '',
          rep.lastNameTh || '',
          rep.firstNameEn || '',
          rep.lastNameEn || '',
          rep.position || '',
          rep.email || '',
          rep.phone || '',
          rep.phoneExtension || ''
        ]
      );
    }
  }
  
  return { updated: data?.length || 0 };
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลบริษัท
async function updateCompanyInfo(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Main`;
  
  const updateFields = [];
  const updateValues = [];
  
  // สร้าง dynamic update query
  if (data.companyName !== undefined) {
    updateFields.push('company_name = ?');
    updateValues.push(data.companyName);
  }
  if (data.companyNameEn !== undefined) {
    updateFields.push('company_name_en = ?');
    updateValues.push(data.companyNameEn);
  }
  if (data.registrationNumber !== undefined) {
    updateFields.push('registration_number = ?');
    updateValues.push(data.registrationNumber);
  }
  if (data.taxId !== undefined) {
    updateFields.push('tax_id = ?');
    updateValues.push(data.taxId);
  }
  
  if (updateFields.length > 0) {
    updateValues.push(applicationId);
    await executeQueryWithoutTransaction(
      `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }
  
  return { updated: updateFields.length };
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ติดต่อ
async function updateContactPersons(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_ContactPerson`;
  
  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [applicationId]);
  
  // เพิ่มข้อมูลใหม่
  if (data && data.length > 0) {
    for (const contact of data) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en,
          position, email, phone, phone_extension, type_contact_id, type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          contact.firstNameTh || '',
          contact.lastNameTh || '',
          contact.firstNameEn || '',
          contact.lastNameEn || '',
          contact.position || '',
          contact.email || '',
          contact.phone || '',
          contact.phoneExtension || '',
          contact.typeContactId || null,
          contact.typeContactName || '',
          contact.typeContactOtherDetail || ''
        ]
      );
    }
  }
  
  return { updated: data?.length || 0 };
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้สมัคร (สำหรับ IC)
async function updateApplicantInfo(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Main`;
  
  const updateFields = [];
  const updateValues = [];
  
  // สร้าง dynamic update query
  if (data.firstNameTh !== undefined) {
    updateFields.push('first_name_th = ?');
    updateValues.push(data.firstNameTh);
  }
  if (data.lastNameTh !== undefined) {
    updateFields.push('last_name_th = ?');
    updateValues.push(data.lastNameTh);
  }
  if (data.firstNameEn !== undefined) {
    updateFields.push('first_name_en = ?');
    updateValues.push(data.firstNameEn);
  }
  if (data.lastNameEn !== undefined) {
    updateFields.push('last_name_en = ?');
    updateValues.push(data.lastNameEn);
  }
  if (data.idCard !== undefined) {
    updateFields.push('id_card = ?');
    updateValues.push(data.idCard);
  }
  if (data.email !== undefined) {
    updateFields.push('email = ?');
    updateValues.push(data.email);
  }
  if (data.phone !== undefined) {
    updateFields.push('phone = ?');
    updateValues.push(data.phone);
  }
  
  if (updateFields.length > 0) {
    updateValues.push(applicationId);
    await executeQueryWithoutTransaction(
      `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }
  
  return { updated: updateFields.length };
}
