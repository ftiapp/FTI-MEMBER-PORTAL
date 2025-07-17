import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { beginTransaction, executeQuery, commitTransaction, rollbackTransaction } from '@/app/lib/db';
import { uploadToCloudinary } from '@/app/lib/cloudinary';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '@/app/lib/db';

export async function POST(request) {
  let trx;
  try {
    // 1. Auth
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      return NextResponse.json({ error: 'ไม่สามารถอ่านข้อมูลฟอร์ม', details: formError.message }, { status: 400 });
    }

    // 3. Extract fields
    const data = {};
    const files = {};
    const productionImages = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key.startsWith('productionImages[')) {
          productionImages.push(value);
        } else {
          files[key] = value;
        }
      } else {
        data[key] = value;
      }
    }
    if (productionImages.length > 0) files.productionImages = productionImages;

    // 4. Validate required fields
    if (!data.taxId || !data.companyName || !data.companyNameEng) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' }, { status: 400 });
    }

    // Check address validation
    if (!data.address || !data.address.addressNumber || !data.address.subDistrict || 
        !data.address.district || !data.address.province || !data.address.postalCode || 
        !data.address.email || !data.address.telephone) {
      return NextResponse.json({ error: 'กรุณาระบุข้อมูลที่อยู่ให้ครบถ้วน' }, { status: 400 });
    }
    
    // Check if business types are selected
    if (!data.businessTypes || data.businessTypes.length === 0) {
      return NextResponse.json({ error: 'กรุณาเลือกประเภทกิจการอย่างน้อย 1 รายการ' }, { status: 400 });
    }
    
    // Check if products are provided
    if (!data.products) {
      return NextResponse.json({ error: 'กรุณาระบุผลิตภัณฑ์/บริการ' }, { status: 400 });
    }
    
    // Check if ID card document is uploaded
    const idCardFile = formData.get('idCard');
    if (!idCardFile) {
      return NextResponse.json({ error: 'กรุณาอัพโหลดสำเนาบัตรประชาชน' }, { status: 400 });
    }

    // 5. Duplicate Tax ID check (OC/AC/AM)
    const [oc] = await executeQuery(null, 'SELECT id FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1', [data.taxId]);
    if (oc) return NextResponse.json({ error: 'เลขประจำตัวผู้เสียภาษีนี้ถูกใช้ในสมาชิกสามัญแล้ว' }, { status: 409 });
    
    const [ac] = await executeQuery(null, 'SELECT id FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1', [data.taxId]);
    if (ac) return NextResponse.json({ error: 'เลขประจำตัวผู้เสียภาษีนี้ถูกใช้ในสมาชิกสมทบแล้ว' }, { status: 409 });
    
    const [am] = await executeQuery(null, 'SELECT id FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1', [data.taxId]);
    if (am) return NextResponse.json({ error: 'เลขประจำตัวผู้เสียภาษีนี้ถูกใช้ในสมาชิกสมาคมแล้ว' }, { status: 409 });

    // Check if the ID card number already exists
    const [existingMember] = await db.query(
      'SELECT id FROM AMmember_Info WHERE id_card_number = ? AND status IN (1, 2)',
      [data.idCardNumber]
    );
    
    if (existingMember.length > 0) {
      return NextResponse.json({ error: 'เลขบัตรประชาชนนี้มีในระบบแล้ว' }, { status: 400 });
    }

    // 6. Begin transaction
    trx = await beginTransaction();
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 7. Insert main
      const mainResult = await executeQuery(trx, `INSERT INTO MemberRegist_AM_Main (user_id, company_name_th, company_name_en, tax_id, company_email, company_phone, factory_type, number_of_employees, number_of_member, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`, [
        userId,
        data.companyName,
        data.companyNameEng,
        data.taxId,
        data.companyEmail,
        data.companyPhone,
        data.factoryType,
        data.numberOfEmployees ? parseInt(data.numberOfEmployees, 10) : null,
        data.numberOfMember ? parseInt(data.numberOfMember, 10) : null
      ]);
      const mainId = mainResult.insertId;

      // Insert into AMmember_Info
      const [infoResult] = await connection.query(
        'INSERT INTO AMmember_Info (id_card_number, first_name_thai, last_name_thai, first_name_english, last_name_english, email, phone, employee_count, association_member_count, user_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())',
        [data.idCardNumber, data.firstNameThai, data.lastNameThai, data.firstNameEnglish, data.lastNameEnglish, data.email, data.phone, data.employeeCount, data.associationMemberCount, userId]
      );
      
      const memberId = infoResult.insertId;

      // 8. Insert address
      await executeQuery(trx, `INSERT INTO MemberRegist_AM_Address (main_id, address_number, building, moo, soi, road, sub_district, district, province, postal_code, phone, email, website, fax, facebook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        mainId,
        data.addressNumber || '',
        data.building || '',
        data.moo || '',
        data.soi || '',
        data.road || '',
        data.subDistrict || '',
        data.district || '',
        data.province || '',
        data.postalCode || '',
        data.companyPhone || '',
        data.companyEmail || '',
        data.companyWebsite || '',
        data.companyFax || '',
        data.companyFacebook || ''
      ]);

      // Insert address into AMmember_Addr
      await connection.query(
        'INSERT INTO AMmember_Addr (member_id, address_number, building, moo, soi, road, sub_district, district, province, postal_code, email, telephone, fax, website, facebook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          memberId, 
          data.address.addressNumber, 
          data.address.building, 
          data.address.moo, 
          data.address.soi, 
          data.address.road, 
          data.address.subDistrict, 
          data.address.district, 
          data.address.province, 
          data.address.postalCode, 
          data.address.email, 
          data.address.telephone, 
          data.address.fax, 
          data.address.website, 
          data.address.facebook
        ]
      );

      // 9. Insert contact person
      await executeQuery(trx, `INSERT INTO MemberRegist_AM_ContactPerson (main_id, first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        mainId,
        data.contactPersonFirstName || '',
        data.contactPersonLastName || '',
        data.contactPersonFirstNameEng || '',
        data.contactPersonLastNameEng || '',
        data.contactPersonPosition || '',
        data.contactPersonEmail || '',
        data.contactPersonPhone || ''
      ]);

      // 10. Insert representatives
      if (data.representatives) {
        let reps = data.representatives;
        if (typeof reps === 'string') reps = JSON.parse(reps);
        for (const rep of Array.isArray(reps) ? reps : []) {
          await executeQuery(trx, `INSERT INTO MemberRegist_AM_Representatives (main_id, first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            mainId,
            rep.firstName || '',
            rep.lastName || '',
            rep.firstNameEng || rep.firstNameEnglish || '',
            rep.lastNameEng || rep.lastNameEnglish || '',
            rep.position || '',
            rep.email || '',
            rep.phone || ''
          ]);
        }
      }

      // Insert representatives into AMmember_Representatives
      if (data.representatives && Array.isArray(data.representatives)) {
        for (const rep of data.representatives) {
          if (rep.firstNameThai && rep.lastNameThai && rep.email && rep.phone) {
            await connection.query(
              'INSERT INTO AMmember_Representatives (member_id, first_name_thai, last_name_thai, first_name_english, last_name_english, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [memberId, rep.firstNameThai, rep.lastNameThai, rep.firstNameEnglish, rep.lastNameEnglish, rep.email, rep.phone]
            );
          }
        }
      }

      // 11. Insert province chapters
      if (data.provincialChapters) {
        let chapters = data.provincialChapters;
        if (typeof chapters === 'string') chapters = JSON.parse(chapters);
        for (const chapterId of Array.isArray(chapters) ? chapters : []) {
          await executeQuery(trx, `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id) VALUES (?, ?)`, [mainId, chapterId]);
        }
      }

      // Insert province chapters into AMmember_Province_Chapter
      if (data.selectedProvinceChapters && data.selectedProvinceChapters.length > 0) {
        for (const chapterId of data.selectedProvinceChapters) {
          await connection.query(
            'INSERT INTO AMmember_Province_Chapter (member_id, province_chapter_id) VALUES (?, ?)',
            [memberId, chapterId]
          );
        }
      }

      // 12. Insert industry groups
      if (data.industrialGroups) {
        let groups = data.industrialGroups;
        if (typeof groups === 'string') groups = JSON.parse(groups);
        for (const groupId of Array.isArray(groups) ? groups : []) {
          await executeQuery(trx, `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id) VALUES (?, ?)`, [mainId, groupId]);
        }
      }

      // Insert industry groups into AMmember_Industry_Group
      if (data.selectedIndustryGroups && data.selectedIndustryGroups.length > 0) {
        for (const groupId of data.selectedIndustryGroups) {
          await connection.query(
            'INSERT INTO AMmember_Industry_Group (member_id, industry_group_id) VALUES (?, ?)',
            [memberId, groupId]
          );
        }
      }

      // 13. Insert products
      if (data.products) {
        let products = data.products;
        if (typeof products === 'string') products = JSON.parse(products);
        await executeQuery(trx, `INSERT INTO MemberRegist_AM_Products (main_id, products) VALUES (?, ?)`, [mainId, JSON.stringify(products)]);
        
        // Also insert into AMmember_Products
        await connection.query(
          'INSERT INTO AMmember_Products (member_id, products) VALUES (?, ?)',
          [memberId, JSON.stringify(products)]
        );
      }

      // 14. Insert business types
      if (data.businessTypes) {
        let types = data.businessTypes;
        if (typeof types === 'string') types = JSON.parse(types);
        for (const type of Array.isArray(types) ? types : []) {
          await executeQuery(trx, `INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type_id) VALUES (?, ?)`, [mainId, type]);
          
          // Also insert into AMmember_Business_Type
          await connection.query(
            'INSERT INTO AMmember_Business_Type (member_id, business_type_id, other_type) VALUES (?, ?, ?)',
            [memberId, type, type === 'other' ? data.businessCategoryOther : null]
          );
        }
      }

      // 15. Insert business type other
      if (data.businessTypeOther) {
        await executeQuery(trx, `INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, other_type) VALUES (?, ?)`, [mainId, data.businessTypeOther]);
      }

      // 16. Insert documents (file uploads)
      for (const [key, file] of Object.entries(files)) {
        if (file instanceof File) {
          const uploadResult = await uploadToCloudinary(file);
          await executeQuery(trx, `INSERT INTO MemberRegist_AM_Documents (main_id, file_url, file_name, file_type, created_at) VALUES (?, ?, ?, ?, NOW())`, [mainId, uploadResult.secure_url, file.name, file.type]);
        } else if (Array.isArray(file)) {
          for (const f of file) {
            const uploadResult = await uploadToCloudinary(f);
            await executeQuery(trx, `INSERT INTO MemberRegist_AM_Documents (main_id, file_url, file_name, file_type, created_at) VALUES (?, ?, ?, ?, NOW())`, [mainId, uploadResult.secure_url, f.name, f.type]);
          }
        }
      }

      // Save uploaded ID card file
      if (idCardFile) {
        // Create directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'am-membership', memberId.toString());
        await mkdir(uploadDir, { recursive: true });
        
        // Generate unique filename
        const fileExtension = idCardFile.name.split('.').pop();
        const fileName = `id_card_${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);
        
        // Write file to disk
        const fileBuffer = Buffer.from(await idCardFile.arrayBuffer());
        await writeFile(filePath, fileBuffer);
        
        // Save file reference in database
        await connection.query(
          'INSERT INTO AMmember_Document (member_id, document_type, file_path, original_filename) VALUES (?, ?, ?, ?)',
          [memberId, 'id_card', `/uploads/am-membership/${memberId}/${fileName}`, idCardFile.name]
        );
      }

      // 17. Commit both transactions
      await commitTransaction(trx);
      await connection.commit();
      
      return NextResponse.json({ 
        success: true, 
        message: 'สมัครสมาชิกสมาคมสำเร็จ',
        memberId,
        mainId
      });

    } catch (error) {
      // Rollback both transactions on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (err) {
    if (trx) await rollbackTransaction(trx);
    console.error('Error submitting AM membership:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก', details: err.message }, { status: 500 });
  }
}