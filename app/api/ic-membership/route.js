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
    let formData;
    const contentType = request.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        // Handle JSON data
        const body = await request.text();
        console.log('Raw JSON request body:', body);
        formData = body ? JSON.parse(body) : {};
      } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        // Handle FormData
        const formDataObj = await request.formData();
        formData = {};
        
        // Convert FormData to plain object
        for (const [key, value] of formDataObj.entries()) {
          // Handle JSON strings in form data
          if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
              formData[key] = JSON.parse(value);
            } catch (e) {
              formData[key] = value;
            }
          } else {
            formData[key] = value;
          }
        }
      } else {
        // Try to parse as JSON by default (for backward compatibility)
        try {
          const body = await request.text();
          formData = body ? JSON.parse(body) : {};
        } catch (e) {
          throw new Error('Unsupported content type');
        }
      }
      
      console.log('Parsed form data:', JSON.stringify(formData, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          error: 'รูปแบบข้อมูลไม่ถูกต้อง', 
          details: parseError.message,
          contentType: contentType,
          expectedFormat: 'JSON or FormData with proper Content-Type header'
        },
        { status: 400 }
      );
    }
    
    // ตรวจสอบเลขบัตรประชาชนว่ามีในระบบใหม่แล้วหรือไม่
    const checkIdCardQuery = `
      SELECT id, status FROM MemberRegist_IC_Main WHERE id_card_number = ?
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
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!formData.idCardNumber) {
      return NextResponse.json(
        { error: 'กรุณาระบุเลขบัตรประชาชน' },
        { status: 400 }
      );
    }

    // เริ่มต้น transaction
    const connection = await beginTransaction();
    
    try {
      const userId = user.id;
      if (!userId) {
        throw new Error('ไม่พบข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง');
      }
      
      // 1. บันทึกข้อมูลผู้สมัครลงตารางใหม่ MemberRegist_IC_Main
      const insertInfoQuery = `
        INSERT INTO MemberRegist_IC_Main (
          user_id, id_card_number, first_name_th, last_name_th, 
          first_name_en, last_name_en, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      let mainId;
      try {
        const result = await executeQuery(connection, insertInfoQuery, [
          userId,
          formData.idCardNumber,
          formData.firstNameThai || null,
          formData.lastNameThai || null,
          formData.firstNameEnglish || null,
          formData.lastNameEnglish || null,
          0 // สถานะเริ่มต้น: รอพิจารณา
        ]);
        mainId = result.insertId;
        console.log(`Inserted IC member with ID: ${mainId}`);
      } catch (dbError) {
        console.error('Error inserting into MemberRegist_IC_Main:', dbError);
        throw new Error(`ไม่สามารถบันทึกข้อมูลผู้สมัครได้: ${dbError.message}`);
      }
      
      // 2. บันทึกข้อมูลผู้แทนลงตารางใหม่ MemberRegist_IC_Representatives
      if (Array.isArray(formData.representatives)) {
        for (const rep of formData.representatives) {
          const insertRepQuery = `
            INSERT INTO MemberRegist_IC_Representatives (
              main_id, first_name_th, last_name_th, first_name_en, last_name_en,
              email, phone, position, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          try {
            await executeQuery(connection, insertRepQuery, [
              mainId,
              rep.firstNameThai || null,
              rep.lastNameThai || null,
              rep.firstNameEnglish || null,
              rep.lastNameEnglish || null,
              rep.email || null,
              rep.phone || null,
              rep.position || null,
              0
            ]);
            console.log('Inserted representative successfully');
          } catch (repError) {
            console.error('Error inserting representative:', repError);
            throw new Error(`ไม่สามารถบันทึกข้อมูลผู้แทนได้: ${repError.message}`);
          }
        }
      }
      // 3. บันทึกที่อยู่ลง MemberRegist_IC_Address (ที่อยู่หลัก)
      try {
        const insertAddressQuery = `
          INSERT INTO MemberRegist_IC_Address (
            main_id, address_number, moo, soi, road, sub_district, district, province, postal_code, phone, email, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const addressResult = await executeQuery(connection, insertAddressQuery, [
          mainId,
          formData.addressNumber || null,
          formData.moo || null,
          formData.soi || null,
          formData.road || null,
          formData.subDistrict || null,
          formData.district || null,
          formData.province || null,
          formData.postalCode || null,
          formData.phone || null,
          formData.email || null,
          formData.website || null
        ]);
        console.log('Inserted address with ID:', addressResult.insertId);
      } catch (addressError) {
        console.error('Error inserting address:', addressError);
        throw new Error(`ไม่สามารถบันทึกข้อมูลที่อยู่ได้: ${addressError.message}`);
      }
      
      // 4. บันทึกข้อมูลสภาอุตสาหกรรมจังหวัด
      if (Array.isArray(formData.provinceChapters) && formData.provinceChapters.length > 0) {
        try {
          const insertProvinceQuery = `
            INSERT INTO MemberRegist_IC_ProvinceChapters (
              main_id, province_chapter_id, status
            ) VALUES (?, ?, ?)
          `;
          
          const provincePromises = formData.provinceChapters.map(chapter => {
            if (!chapter.id) return Promise.resolve();
            return executeQuery(connection, insertProvinceQuery, [
              mainId,
              chapter.id,
              0
            ]);
          });
          
          const provinceResults = await Promise.all(provincePromises);
          console.log(`Inserted ${provinceResults.filter(Boolean).length} province chapters`);
        } catch (provinceError) {
          console.error('Error inserting province chapters:', provinceError);
          throw new Error(`ไม่สามารถบันทึกข้อมูลสภาอุตสาหกรรมจังหวัดได้: ${provinceError.message}`);
        }
      } else {
        console.log('No province chapters to insert');
      }
      
      // 5. บันทึกข้อมูลกลุ่มอุตสาหกรรม
      if (Array.isArray(formData.industryGroups) && formData.industryGroups.length > 0) {
        try {
          const insertIndustryQuery = `
            INSERT INTO MemberRegist_IC_IndustryGroups (
              main_id, industry_group_id, status
            ) VALUES (?, ?, ?)
          `;
          
          const industryPromises = formData.industryGroups.map(group => {
            if (!group.id) return Promise.resolve();
            return executeQuery(connection, insertIndustryQuery, [
              mainId,
              group.id,
              0
            ]);
          });
          
          const industryResults = await Promise.all(industryPromises);
          console.log(`Inserted ${industryResults.filter(Boolean).length} industry groups`);
        } catch (industryError) {
          console.error('Error inserting industry groups:', industryError);
          throw new Error(`ไม่สามารถบันทึกข้อมูลกลุ่มอุตสาหกรรมได้: ${industryError.message}`);
        }
      } else {
        console.log('No industry groups to insert');
      }
      
      // 6. บันทึกข้อมูลประเภทธุรกิจ
      try {
        const businessTypes = formData.businessTypes || {};
        
        // Insert each selected business type
        const insertBusinessTypeQuery = `
          INSERT INTO MemberRegist_IC_BusinessTypes (
            main_id, business_type
          ) VALUES (?, ?)
        `;
        
        // Mapping of form field names to display names
        const businessTypeLabels = {
          manufacturer: 'ผู้ผลิต (Manufacturer)',
          distributor: 'ผู้จัดจำหน่าย (Distributor)',
          exporter: 'ผู้ส่งออก (Exporter)',
          importer: 'ผู้นำเข้า (Importer)',
          service_provider: 'ผู้ให้บริการ (Service Provider)'
        };
        
        // Insert each selected business type
        for (const [type, isSelected] of Object.entries(businessTypes)) {
          if (isSelected && type !== 'other_detail' && businessTypeLabels[type]) {
            await executeQuery(connection, insertBusinessTypeQuery, [
              mainId,
              businessTypeLabels[type] || type
            ]);
          }
        }
        
        // Handle 'other' business type with details
        if (businessTypes.other && businessTypes.other_detail) {
          await executeQuery(connection, insertBusinessTypeQuery, [
            mainId,
            `อื่นๆ (Other): ${businessTypes.other_detail}`
          ]);
        }
        
        console.log('Inserted business types for member ID:', mainId);
      } catch (businessTypeError) {
        console.error('Error inserting business types:', businessTypeError);
        throw new Error(`ไม่สามารถบันทึกข้อมูลประเภทธุรกิจได้: ${businessTypeError.message}`);
      }
      
      // 7. บันทึกข้อมูลผลิตภัณฑ์/บริการ
      if (Array.isArray(formData.products) && formData.products.length > 0) {
        try {
          const insertProductsQuery = `
            INSERT INTO MemberRegist_IC_Products (
              main_id, name_th, name_en, status
            ) VALUES (?, ?, ?, ?)
          `;
          
          const productPromises = formData.products.map(product => {
            if ((!product.thai || product.thai.trim() === '') && 
                (!product.english || product.english.trim() === '')) {
              return Promise.resolve();
            }
            
            return executeQuery(connection, insertProductsQuery, [
              mainId,
              product.thai || null,
              product.english || null,
              0
            ]);
          });
          
          const productResults = await Promise.all(productPromises);
          const insertedProducts = productResults.filter(r => r).length;
          console.log(`Inserted ${insertedProducts} products`);
        } catch (productError) {
          console.error('Error inserting products:', productError);
          throw new Error(`ไม่สามารถบันทึกข้อมูลผลิตภัณฑ์/บริการได้: ${productError.message}`);
        }
      } else {
        console.log('No products to insert');
      }
      
      // 8. บันทึกข้อมูลเอกสารแนบลงตาราง MemberRegist_IC_Documents
      const documents = [];
      
      // ตรวจสอบเอกสารแต่ละประเภท
      if (formData.idCardFile && formData.idCardFile.cloudinaryPath) {
        documents.push({
          type: 'id_card',
          file: formData.idCardFile
        });
        console.log('Added ID card document for upload');
      } else {
        console.log('No ID card document found or missing cloudinary path');
      }
      
      // ตรวจสอบเอกสารทะเบียนบริษัท
      if (formData.companyRegistrationFile?.cloudinaryPath) {
        documents.push({
          type: 'company_registration',
          file: formData.companyRegistrationFile
        });
        console.log('Added company registration document for upload');
      } else {
        console.log('No company registration document found or missing cloudinary path');
      }
      
      // ตรวจสอบเอกสารทะเบียนภาษี
      if (formData.taxRegistrationFile?.cloudinaryPath) {
        documents.push({
          type: 'tax_registration',
          file: formData.taxRegistrationFile
        });
        console.log('Added tax registration document for upload');
      } else {
        console.log('No tax registration document found or missing cloudinary path');
      }
      
      // บันทึกข้อมูลเอกสารแนบ
      if (documents.length > 0) {
        try {
          const insertDocumentQuery = `
            INSERT INTO MemberRegist_IC_Documents (
              main_id, doc_type, doc_url, doc_name, status
            ) VALUES (?, ?, ?, ?, ?)
          `;
          
          const documentPromises = documents.map(doc => {
            if (!doc.file?.cloudinaryPath) return Promise.resolve();
            
            return executeQuery(connection, insertDocumentQuery, [
              mainId,
              doc.type,
              doc.file.cloudinaryPath,
              doc.file.fileName || `document_${Date.now()}`,
              0
            ]);
          });
          
          const docResults = await Promise.all(documentPromises);
          const insertedDocs = docResults.filter(r => r).length;
          console.log(`Inserted ${insertedDocs} documents`);
        } catch (docError) {
          console.error('Error inserting documents:', docError);
          // อย่า throw error ตรงนี้เพราะเอกสารอาจจะไม่จำเป็นต้องมี
          console.warn('Continuing without documents due to error');
        }
      } else {
        console.log('No documents to insert');
      }
      
      // Commit transaction เมื่อทุกอย่างสำเร็จ
      try {
        await commitTransaction(connection);
        console.log(`Successfully committed transaction for IC membership ID: ${mainId}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'บันทึกข้อมูลการสมัครสมาชิก IC สำเร็จ',
          data: {
            mainId
          }
        });
      } catch (commitError) {
        console.error('Error committing transaction:', commitError);
        // พยายาม rollback อีกครั้งถ้า commit ล้มเหลว
        try {
          await rollbackTransaction(connection);
          console.log('Transaction rolled back after commit failure');
        } catch (rollbackError) {
          console.error('Error during rollback after commit failure:', rollbackError);
        }
        
        throw new Error(`ไม่สามารถบันทึกข้อมูลการสมัครได้: ${commitError.message}`);
      }
      
    } catch (error) {
      // Rollback transaction เมื่อเกิดข้อผิดพลาด
      console.error('Error in IC membership submission:', error);
      await rollbackTransaction(connection);
      return NextResponse.json({ 
        error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Unexpected error in IC membership API:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการประมวลผล', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
