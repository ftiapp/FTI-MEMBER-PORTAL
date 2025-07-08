import { query, beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { checkUserSession } from '@/app/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/ic-membership
 * บันทึกข้อมูลการสมัครสมาชิก IC
 */
export async function POST(request) {
  try {
    // ตรวจสอบว่าผู้ใช้ login แล้วหรือไม่
    const cookieStore = await cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // รับข้อมูลจาก request body
    const formData = await request.json();
    
    // ตรวจสอบเลขบัตรประชาชนว่ามีในระบบแล้วหรือไม่
    const checkIdCardQuery = `
      SELECT id, status FROM ICmember_Info WHERE id_card_number = ?
    `;
    
    const idCardResult = await query(checkIdCardQuery, [formData.idCardNumber]);
    
    // ถ้ามีเลขบัตรประชาชนในระบบแล้ว
    if (idCardResult.length > 0) {
      // ถ้าสถานะเป็น 0 (รอพิจารณา)
      if (idCardResult[0].status === 0) {
        return NextResponse.json(
          { error: 'คำขอสมัครสมาชิกของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน' },
          { status: 400 }
        );
      }
      
      // ถ้าสถานะเป็น 1 (อนุมัติ)
      if (idCardResult[0].status === 1) {
        return NextResponse.json(
          { error: 'หมายเลขบัตรประชาชนนี้ได้เป็นสมาชิกแล้ว กรุณาตรวจสอบหน้าข้อมูลสมาชิก' },
          { status: 400 }
        );
      }
    }
    
    // เริ่มต้น transaction
    const connection = await beginTransaction();
    
    try {
      const userId = user.id;
      
      // 1. บันทึกข้อมูลผู้สมัครลงตาราง ICmember_Info
      const insertInfoQuery = `
        INSERT INTO ICmember_Info (
          user_id, id_card_number, first_name_thai, last_name_thai, 
          first_name_english, last_name_english, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const infoResult = await executeQuery(connection, insertInfoQuery, [
        userId,
        formData.idCardNumber,
        formData.firstNameThai,
        formData.lastNameThai,
        formData.firstNameEnglish || null,
        formData.lastNameEnglish || null,
        0 // status: 0 = รอพิจารณา
      ]);
      
      // Get the inserted ic_member_id
      const icMemberId = infoResult.insertId;
      
      // 2. บันทึกข้อมูลผู้แทนใช้สิทธิลงตาราง ICmember_Representatives
      const insertRepQuery = `
        INSERT INTO ICmember_Representatives (
          user_id, ic_member_id, first_name_thai, last_name_thai, first_name_english, 
          last_name_english, email, phone, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const repResult = await executeQuery(connection, insertRepQuery, [
        userId,
        icMemberId,
        formData.representativeFirstNameThai,
        formData.representativeLastNameThai,
        formData.representativeFirstNameEnglish || null,
        formData.representativeLastNameEnglish || null,
        formData.representativeEmail || null,
        formData.representativeMobile || null,
        0 // status: 0 = รอพิจารณา
      ]);
      
      // 3. บันทึกข้อมูลที่อยู่จัดส่งเอกสารลงตาราง ICmember_Addr
      const insertAddrQuery = `
        INSERT INTO ICmember_Addr (
          user_id, ic_member_id, address_number, building, moo, soi, road, sub_district,
          district, province, postal_code, website, facebook, telephone, email, fax, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const addrResult = await executeQuery(connection, insertAddrQuery, [
        userId,
        icMemberId,
        formData.addressNumber || null,
        formData.building || null,
        formData.moo || null,
        formData.soi || null,
        formData.road || null,
        formData.subDistrict || null,
        formData.district || null,
        formData.province || null,
        formData.postalCode || null,
        formData.website || null,
        formData.facebook || null,
        formData.telephone || null,
        formData.email || null,
        formData.fax || null,
        0 // status: 0 = รอพิจารณา
      ]);
      
      // 4. บันทึกข้อมูลสภาอุตสาหกรรมจังหวัด
      if (formData.selectedProvinceChapters && formData.selectedProvinceChapters.length > 0) {
        // มีการเลือกสภาอุตสาหกรรมจังหวัด
        for (const provinceId of formData.selectedProvinceChapters) {
          const insertProvinceQuery = `
            INSERT INTO ICmember_Province_Group (
              user_id, ic_member_id, member_main_group_code, member_group_code, member_group_name, status
            ) VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(connection, insertProvinceQuery, [
            userId,
            icMemberId,
            '000', // main_code
            String(provinceId), // code
            'สภาอุตสาหกรรมจังหวัด', // name_thai
            0 // status: 0 = รอพิจารณา
          ]);
        }
      } else {
        // ไม่ได้เลือกสภาอุตสาหกรรมจังหวัด ไม่ต้องบันทึกข้อมูล
        // ตามความต้องการของผู้ใช้ ฟิลด์นี้ไม่เป็น required
      }
      
      // 5. บันทึกข้อมูลกลุ่มอุตสาหกรรม
      if (formData.selectedIndustryGroups && formData.selectedIndustryGroups.length > 0) {
        // มีการเลือกกลุ่มอุตสาหกรรม
        for (const industryId of formData.selectedIndustryGroups) {
          const insertIndustryQuery = `
            INSERT INTO ICmember_Industry_Group (
              user_id, ic_member_id, member_main_group_code, member_group_code, member_group_name, status
            ) VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(connection, insertIndustryQuery, [
            userId,
            icMemberId,
            '000', // main_code
            String(industryId), // code
            'กลุ่มอุตสาหกรรม', // name_thai
            0 // status: 0 = รอพิจารณา
          ]);
        }
      } else {
        // ไม่ได้เลือกกลุ่มอุตสาหกรรม ไม่ต้องบันทึกข้อมูล
        // ตามความต้องการของผู้ใช้ ฟิลด์นี้ไม่เป็น required
      }
      
      // 6. บันทึกข้อมูลประเภทธุรกิจ
      const insertBusinessTypeQuery = `
        INSERT INTO ICmember_Business_TYPE (
          user_id, ic_member_id, distributor, exporter, importer, manufacturer, service_provider, other, other_detail, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(connection, insertBusinessTypeQuery, [
        userId,
        icMemberId,
        formData.businessTypes?.distributor || false,
        formData.businessTypes?.exporter || false,
        formData.businessTypes?.importer || false,
        formData.businessTypes?.manufacturer || false,
        formData.businessTypes?.serviceProvider || false,
        formData.businessTypes?.other || false,
        formData.businessCategoryOther || null,
        0 // status: 0 = รอพิจารณา
      ]);
      
      // 7. บันทึกข้อมูลผลิตภัณฑ์/บริการ
      if (formData.products && formData.products.length > 0) {
        // แปลงข้อมูลจาก array ของ objects เป็น string
        const productsThai = formData.products.map(p => p.thai).filter(Boolean).join(', ');
        const productsEnglish = formData.products.map(p => p.english).filter(Boolean).join(', ');
        
        const insertProductsQuery = `
          INSERT INTO ICmember_Products (
            user_id, ic_member_id, products_thai, products_english, status
          ) VALUES (?, ?, ?, ?, ?)
        `;
        
        await executeQuery(connection, insertProductsQuery, [
          userId,
          icMemberId,
          productsThai || null,
          productsEnglish || null,
          0 // status: 0 = รอพิจารณา
        ]);
      }
      
      // 8. บันทึกข้อมูลเอกสารแนบลงตาราง ICmember_Document
      const documents = [];
      
      // ตรวจสอบเอกสารแต่ละประเภท
      if (formData.idCardFile) {
        documents.push({
          type: 'id_card',
          file: formData.idCardFile
        });
      }
      
      if (formData.companyRegistrationFile) {
        documents.push({
          type: 'company_registration',
          file: formData.companyRegistrationFile
        });
      }
      
      if (formData.taxRegistrationFile) {
        documents.push({
          type: 'tax_registration',
          file: formData.taxRegistrationFile
        });
      }
      
      // บันทึกข้อมูลเอกสารแนบ
      for (const doc of documents) {
        if (doc.file && doc.file.cloudinaryPath) {
          const insertDocumentQuery = `
          INSERT INTO ICmember_Document (
            user_id, ic_member_id, doc_type, doc_url, doc_name
          ) VALUES (?, ?, ?, ?, ?)
        `;
        
        await executeQuery(connection, insertDocumentQuery, [
          userId,
          icMemberId,
          doc.type,
          doc.file.cloudinaryPath,
          doc.file.fileName || ''
        ]);
        }
      }
      
      // Commit transaction เมื่อทุกอย่างสำเร็จ
      await commitTransaction(connection);
      
      return NextResponse.json({ 
        success: true, 
        message: 'บันทึกข้อมูลการสมัครสมาชิก IC สำเร็จ',
        data: {
          id: infoResult.insertId,
          representativeId: repResult.insertId,
          addressId: addrResult.insertId,
          businessId: businessResult.insertId
        }
      });
      
    } catch (error) {
      // Rollback transaction เมื่อเกิดข้อผิดพลาด
      await rollbackTransaction(connection);
      return NextResponse.json({ 
        error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 
        details: error.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการประมวลผล', 
      details: error.message 
    }, { status: 500 });
  }
}
