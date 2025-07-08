import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const jsonData = formData.get('data');
    
    if (!jsonData) {
      return new Response(JSON.stringify({ error: 'ข้อมูลไม่ถูกต้อง' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(jsonData);
    
    // Validate required fields
    if (!data.companyRegNumber || data.companyRegNumber.length !== 13) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกเลขทะเบียนนิติบุคคลให้ถูกต้อง' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!data.companyNameThai) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกชื่อบริษัทภาษาไทย' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!data.employeeCount) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกจำนวนพนักงาน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if at least one representative is provided
    if (!data.representatives || !data.representatives[0] || 
        !data.representatives[0].firstNameThai || 
        !data.representatives[0].lastNameThai || 
        !data.representatives[0].email || 
        !data.representatives[0].phone) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกข้อมูลผู้แทนอย่างน้อย 1 คน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if address is provided
    if (!data.address || 
        !data.address.addressNumber || 
        !data.address.subDistrict || 
        !data.address.district || 
        !data.address.province || 
        !data.address.postalCode || 
        !data.address.email || 
        !data.address.telephone) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if at least one business type is selected
    const hasBusinessType = Object.values(data.businessTypes).some(value => value === true);
    if (!hasBusinessType) {
      return new Response(JSON.stringify({ error: 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if products are provided
    if (!data.products) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกข้อมูลสินค้า/บริการหลัก' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if company registration document is uploaded
    const companyRegistrationFile = formData.get('companyRegistration');
    if (!companyRegistrationFile) {
      return new Response(JSON.stringify({ error: 'กรุณาอัพโหลดหนังสือรับรองการจดทะเบียนนิติบุคคล' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if company registration number already exists
    const existingApplication = await db.query(
      `SELECT status FROM OCmember_Info WHERE company_reg_number = ? AND (status = 1 OR status = 2) LIMIT 1`,
      [data.companyRegNumber]
    );

    if (existingApplication.length > 0) {
      const status = existingApplication[0].status;
      
      if (status === 1) { // Pending
        return new Response(JSON.stringify({ 
          error: 'เลขทะเบียนนิติบุคคลนี้มีการสมัครที่อยู่ระหว่างการพิจารณา' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (status === 2) { // Approved
        return new Response(JSON.stringify({ 
          error: 'เลขทะเบียนนิติบุคคลนี้เป็นสมาชิกอยู่แล้ว' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Begin transaction
    await db.beginTransaction();

    try {
      // Insert into OCmember_Info table
      const infoResult = await db.query(
        `INSERT INTO OCmember_Info (
          company_reg_number, 
          company_name_thai, 
          company_name_english, 
          employee_count,
          user_id, 
          status, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.companyRegNumber,
          data.companyNameThai,
          data.companyNameEnglish || null,
          data.employeeCount,
          session.user.id,
          1 // Status: 1 = Pending
        ]
      );

      const memberId = infoResult.insertId;

      // Insert industry groups if selected
      if (data.selectedIndustryGroups && data.selectedIndustryGroups.length > 0) {
        for (const groupId of data.selectedIndustryGroups) {
          await db.query(
            `INSERT INTO OCmember_Industry_Group (member_id, industry_group_id) VALUES (?, ?)`,
            [memberId, groupId]
          );
        }
      }

      // Insert province chapters if selected
      if (data.selectedProvinceChapters && data.selectedProvinceChapters.length > 0) {
        for (const chapterId of data.selectedProvinceChapters) {
          await db.query(
            `INSERT INTO OCmember_Province_Chapter (member_id, province_chapter_id) VALUES (?, ?)`,
            [memberId, chapterId]
          );
        }
      }

      // Insert representatives
      for (const rep of data.representatives) {
        if (rep && rep.firstNameThai && rep.lastNameThai) {
          await db.query(
            `INSERT INTO OCmember_Representatives (
              member_id, 
              first_name_thai, 
              last_name_thai, 
              first_name_english, 
              last_name_english, 
              email, 
              phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              memberId,
              rep.firstNameThai,
              rep.lastNameThai,
              rep.firstNameEnglish || null,
              rep.lastNameEnglish || null,
              rep.email,
              rep.phone
            ]
          );
        }
      }

      // Insert address
      await db.query(
        `INSERT INTO OCmember_Addr (
          member_id, 
          address_number, 
          building, 
          moo, 
          soi, 
          road, 
          sub_district, 
          district, 
          province, 
          postal_code, 
          email, 
          telephone, 
          fax, 
          website, 
          facebook
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memberId,
          data.address.addressNumber,
          data.address.building || null,
          data.address.moo || null,
          data.address.soi || null,
          data.address.road || null,
          data.address.subDistrict,
          data.address.district,
          data.address.province,
          data.address.postalCode,
          data.address.email,
          data.address.telephone,
          data.address.fax || null,
          data.address.website || null,
          data.address.facebook || null
        ]
      );

      // Insert business types
      for (const typeId in data.businessTypes) {
        if (data.businessTypes[typeId] && typeId !== 'other') {
          await db.query(
            `INSERT INTO OCmember_Business_Type (member_id, business_type_id) VALUES (?, ?)`,
            [memberId, typeId]
          );
        }
      }

      // Insert other business type if selected
      if (data.businessTypes.other && data.otherBusinessType) {
        await db.query(
          `INSERT INTO OCmember_Business_Type (member_id, business_type_id, other_type) VALUES (?, 'other', ?)`,
          [memberId, data.otherBusinessType]
        );
      }

      // Insert products
      await db.query(
        `INSERT INTO OCmember_Products (member_id, products) VALUES (?, ?)`,
        [memberId, data.products]
      );

      // Save uploaded files
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'oc-membership', memberId.toString());
      
      // Create directory if it doesn't exist
      try {
        await writeFile(join(uploadDir, '.gitkeep'), '');
      } catch (error) {
        // Directory creation error is not critical, continue
        console.error('Error creating upload directory:', error);
      }

      // Save company registration document
      if (companyRegistrationFile) {
        const buffer = Buffer.from(await companyRegistrationFile.arrayBuffer());
        const fileName = `company_registration_${uuidv4()}.${companyRegistrationFile.name.split('.').pop()}`;
        const filePath = join(uploadDir, fileName);
        
        try {
          await writeFile(filePath, buffer);
          
          // Insert document record
          await db.query(
            `INSERT INTO OCmember_Document (member_id, document_type, file_path, original_filename) VALUES (?, ?, ?, ?)`,
            [memberId, 'company_registration', `/uploads/oc-membership/${memberId}/${fileName}`, companyRegistrationFile.name]
          );
        } catch (error) {
          console.error('Error saving file:', error);
          throw new Error('ไม่สามารถบันทึกไฟล์เอกสารได้');
        }
      }

      // Commit transaction
      await db.commit();

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'บันทึกข้อมูลสำเร็จ',
        memberId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      // Rollback transaction on error
      await db.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error submitting OC membership:', error);
    return new Response(JSON.stringify({ error: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
