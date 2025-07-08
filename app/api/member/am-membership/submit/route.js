import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

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

    // Get user ID from session
    const userId = session.user.id;

    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract JSON data
    const jsonData = formData.get('data');
    if (!jsonData) {
      return new Response(JSON.stringify({ error: 'ไม่พบข้อมูลฟอร์ม' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = JSON.parse(jsonData);
    
    // Validate required fields
    if (!data.idCardNumber || !data.firstNameThai || !data.lastNameThai || !data.email || !data.phone || 
        !data.employeeCount || !data.associationMemberCount) {
      return new Response(JSON.stringify({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if at least one representative is provided
    if (!data.representatives || !data.representatives[0] || 
        !data.representatives[0].firstNameThai || !data.representatives[0].lastNameThai || 
        !data.representatives[0].email || !data.representatives[0].phone) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุข้อมูลผู้แทนอย่างน้อย 1 คน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if address information is provided
    if (!data.address || !data.address.addressNumber || !data.address.subDistrict || 
        !data.address.district || !data.address.province || !data.address.postalCode || 
        !data.address.email || !data.address.telephone) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุข้อมูลที่อยู่ให้ครบถ้วน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if business types are selected
    if (!data.businessTypes || data.businessTypes.length === 0) {
      return new Response(JSON.stringify({ error: 'กรุณาเลือกประเภทกิจการอย่างน้อย 1 รายการ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if products are provided
    if (!data.products) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุผลิตภัณฑ์/บริการ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if ID card document is uploaded
    const idCardFile = formData.get('idCard');
    if (!idCardFile) {
      return new Response(JSON.stringify({ error: 'กรุณาอัพโหลดสำเนาบัตรประชาชน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if the ID card number already exists
    const [existingMember] = await db.query(
      'SELECT id FROM AMmember_Info WHERE id_card_number = ? AND status IN (1, 2)',
      [data.idCardNumber]
    );
    
    if (existingMember.length > 0) {
      return new Response(JSON.stringify({ error: 'เลขบัตรประชาชนนี้มีในระบบแล้ว' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert into AMmember_Info
      const [infoResult] = await connection.query(
        'INSERT INTO AMmember_Info (id_card_number, first_name_thai, last_name_thai, first_name_english, last_name_english, email, phone, employee_count, association_member_count, user_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())',
        [data.idCardNumber, data.firstNameThai, data.lastNameThai, data.firstNameEnglish, data.lastNameEnglish, data.email, data.phone, data.employeeCount, data.associationMemberCount, userId]
      );
      
      const memberId = infoResult.insertId;
      
      // Insert industry groups if selected
      if (data.selectedIndustryGroups && data.selectedIndustryGroups.length > 0) {
        for (const groupId of data.selectedIndustryGroups) {
          await connection.query(
            'INSERT INTO AMmember_Industry_Group (member_id, industry_group_id) VALUES (?, ?)',
            [memberId, groupId]
          );
        }
      }
      
      // Insert province chapters if selected
      if (data.selectedProvinceChapters && data.selectedProvinceChapters.length > 0) {
        for (const chapterId of data.selectedProvinceChapters) {
          await connection.query(
            'INSERT INTO AMmember_Province_Chapter (member_id, province_chapter_id) VALUES (?, ?)',
            [memberId, chapterId]
          );
        }
      }
      
      // Insert representatives
      for (const rep of data.representatives) {
        if (rep.firstNameThai && rep.lastNameThai && rep.email && rep.phone) {
          await connection.query(
            'INSERT INTO AMmember_Representatives (member_id, first_name_thai, last_name_thai, first_name_english, last_name_english, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [memberId, rep.firstNameThai, rep.lastNameThai, rep.firstNameEnglish, rep.lastNameEnglish, rep.email, rep.phone]
          );
        }
      }
      
      // Insert address
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
      
      // Insert business types
      for (const businessType of data.businessTypes) {
        await connection.query(
          'INSERT INTO AMmember_Business_Type (member_id, business_type_id, other_type) VALUES (?, ?, ?)',
          [memberId, businessType, businessType === 'other' ? data.businessCategoryOther : null]
        );
      }
      
      // Insert products
      await connection.query(
        'INSERT INTO AMmember_Products (member_id, products) VALUES (?, ?)',
        [memberId, JSON.stringify(data.products)]
      );
      
      // Save uploaded file
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
      
      // Commit transaction
      await connection.commit();
      
      return new Response(JSON.stringify({ success: true, memberId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error submitting AM membership:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการส่งข้อมูล' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
