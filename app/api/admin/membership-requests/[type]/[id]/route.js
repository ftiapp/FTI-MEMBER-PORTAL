import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

// Helper function to convert snake_case fields to camelCase for frontend compatibility
function convertFieldNames(data, type) {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Common conversions for all types
  if (converted.tax_id !== undefined) {
    converted.taxId = converted.tax_id;
    delete converted.tax_id;
  }
  if (converted.created_at !== undefined) {
    converted.createdAt = converted.created_at;
    delete converted.created_at;
  }
  if (converted.updated_at !== undefined) {
    converted.updatedAt = converted.updated_at;
    delete converted.updated_at;
  }
  if (converted.member_code !== undefined) {
    converted.memberCode = converted.member_code;
    delete converted.member_code;
  }
  if (converted.user_id !== undefined) {
    converted.userId = converted.user_id;
    delete converted.user_id;
  }
  
  // Type-specific conversions based on actual database schema
  switch (type) {
    case 'oc':
      // OC (สามัญ-โรงงาน) field conversions - MemberRegist_OC_Main
      if (converted.company_name_th !== undefined) {
        converted.companyNameTh = converted.company_name_th;
        delete converted.company_name_th;
      }
      if (converted.company_name_en !== undefined) {
        converted.companyNameEn = converted.company_name_en;
        delete converted.company_name_en;
      }
      if (converted.company_email !== undefined) {
        converted.companyEmail = converted.company_email;
        delete converted.company_email;
      }
      if (converted.company_phone !== undefined) {
        converted.companyPhone = converted.company_phone;
        delete converted.company_phone;
      }
      if (converted.factory_type !== undefined) {
        converted.factoryType = converted.factory_type;
        delete converted.factory_type;
      }
      if (converted.number_of_employees !== undefined) {
        converted.numberOfEmployees = converted.number_of_employees;
        delete converted.number_of_employees;
      }
      break;
      
    case 'am':
      // AM (สามัญ-สมาคมการค้า) field conversions - MemberRegist_AM_Main
      if (converted.company_name_th !== undefined) {
        converted.associationNameTh = converted.company_name_th; // Map to what frontend expects
        delete converted.company_name_th;
      }
      if (converted.company_name_en !== undefined) {
        converted.associationNameEn = converted.company_name_en; // Map to what frontend expects
        delete converted.company_name_en;
      }
      if (converted.company_email !== undefined) {
        converted.email = converted.company_email; // Map to what frontend expects
        delete converted.company_email;
      }
      if (converted.company_phone !== undefined) {
        converted.phone = converted.company_phone; // Map to what frontend expects
        delete converted.company_phone;
      }
      if (converted.factory_type !== undefined) {
        converted.factoryType = converted.factory_type;
        delete converted.factory_type;
      }
      if (converted.number_of_employees !== undefined) {
        converted.numberOfEmployees = converted.number_of_employees;
        delete converted.number_of_employees;
      }
      if (converted.number_of_member !== undefined) {
        converted.numberOfMember = converted.number_of_member;
        delete converted.number_of_member;
      }
      break;
      
    case 'ac':
      // AC (สมทบ-นิติบุคคล) field conversions - MemberRegist_AC_Main
      if (converted.company_name_th !== undefined) {
        converted.companyNameTh = converted.company_name_th;
        delete converted.company_name_th;
      }
      if (converted.company_name_en !== undefined) {
        converted.companyNameEn = converted.company_name_en;
        delete converted.company_name_en;
      }
      if (converted.company_email !== undefined) {
        converted.companyEmail = converted.company_email;
        delete converted.company_email;
      }
      if (converted.company_phone !== undefined) {
        converted.companyPhone = converted.company_phone;
        delete converted.company_phone;
      }
      if (converted.factory_type !== undefined) {
        converted.factoryType = converted.factory_type;
        delete converted.factory_type;
      }
      if (converted.number_of_employees !== undefined) {
        converted.numberOfEmployees = converted.number_of_employees;
        delete converted.number_of_employees;
      }
      if (converted.company_website !== undefined) {
        converted.companyWebsite = converted.company_website;
        delete converted.company_website;
      }
      break;
      
    case 'ic':
      // IC (สมทบ-บุคคลธรรมดา) field conversions - MemberRegist_IC_Main
      if (converted.first_name_th !== undefined) {
        converted.firstNameTh = converted.first_name_th;
        delete converted.first_name_th;
      }
      if (converted.last_name_th !== undefined) {
        converted.lastNameTh = converted.last_name_th;
        delete converted.last_name_th;
      }
      if (converted.first_name_en !== undefined) {
        converted.firstNameEn = converted.first_name_en;
        delete converted.first_name_en;
      }
      if (converted.last_name_en !== undefined) {
        converted.lastNameEn = converted.last_name_en;
        delete converted.last_name_en;
      }
      if (converted.id_card_number !== undefined) {
        converted.idCard = converted.id_card_number; // Map to what frontend expects
        delete converted.id_card_number;
      }
      // IC has phone and email directly (not company_phone/company_email)
      if (converted.phone !== undefined) {
        converted.phone = converted.phone; // Already correct
      }
      if (converted.email !== undefined) {
        converted.email = converted.email; // Already correct
      }
      if (converted.website !== undefined) {
        converted.website = converted.website; // Already correct
      }
      break;
  }
  
  return converted;
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    // Get params first
    const { type, id } = await params;
    console.log(`[PERF] Starting membership request detail fetch for type: ${type}, id: ${id}`);
    
    // Verify admin token
    const authStart = Date.now();
    const adminData = await checkAdminSession();
    console.log(`[PERF] Auth check took: ${Date.now() - authStart}ms`);
    
    if (!adminData) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate type parameter
    const validTypes = ['oc', 'am', 'ac', 'ic'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid membership type' }, { status: 400 });
    }

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    // Get database connection
    const dbStart = Date.now();
    const connection = await getConnection();
    console.log(`[PERF] DB connection took: ${Date.now() - dbStart}ms`);

    // Fetch membership request details based on type
    let query, result;
    const mainQueryStart = Date.now();
    
    switch (type) {
      case 'oc':
        query = `
          SELECT 
            m.*,
            a.address_number,
            a.moo,
            a.soi,
            a.street,
            a.sub_district,
            a.district,
            a.province,
            a.postal_code,
            a.phone AS company_phone,
            a.email AS company_email,
            a.website AS company_website
          FROM MemberRegist_OC_Main m
          LEFT JOIN MemberRegist_OC_Address a ON m.id = a.main_id
          WHERE m.id = ?
        `;
        [result] = await connection.execute(query, [id]);
        break;
        
      case 'am':
        query = `
          SELECT 
            m.*,
            a.address AS association_address,
            a.province,
            a.district,
            a.sub_district,
            a.postal_code,
            a.phone,
            a.email,
            a.website
          FROM MemberRegist_AM_Main m
          LEFT JOIN MemberRegist_AM_Address a ON m.id = a.member_id
          WHERE m.id = ?
        `;
        [result] = await connection.execute(query, [id]);
        break;
        
      case 'ac':
        query = `
          SELECT 
            m.*,
            a.address AS company_address,
            a.province,
            a.district,
            a.sub_district,
            a.postal_code,
            a.phone AS company_phone,
            a.email AS company_email,
            a.website AS company_website
          FROM MemberRegist_AC_Main m
          LEFT JOIN MemberRegist_AC_Address a ON m.id = a.member_id
          WHERE m.id = ?
        `;
        [result] = await connection.execute(query, [id]);
        break;
        
      case 'ic':
        query = `
          SELECT 
            i.*,
            a.address,
            a.province,
            a.district,
            a.sub_district,
            a.postal_code
          FROM ICmember_Info i
          LEFT JOIN ICmember_Address a ON i.id = a.member_id
          WHERE i.id = ?
        `;
        [result] = await connection.execute(query, [id]);
        break;
    }

    console.log(`[PERF] Main query took: ${Date.now() - mainQueryStart}ms`);
    
    // Check if membership request exists
    if (!result || result.length === 0) {
      connection.release();
      console.log(`[PERF] Request not found after: ${Date.now() - startTime}ms`);
      return NextResponse.json({ success: false, message: 'Membership request not found' }, { status: 404 });
    }

    // Get additional data based on type
    let additionalData = {};
    const additionalDataStart = Date.now();
    
    // For OC: Get contact person
    if (type === 'oc') {
      try {
        const contactStart = Date.now();
        const [contactPerson] = await connection.execute(
          `SELECT * FROM MemberRegist_OC_ContactPerson WHERE main_id = ?`,
          [id]
        );
        console.log(`[PERF] Contact person query took: ${Date.now() - contactStart}ms`);
        additionalData.contactPerson = contactPerson || [];
      } catch (contactError) {
        console.error('Error fetching contact person:', contactError);
        additionalData.contactPerson = [];
      }
    }
    
    // For OC, AM, AC: Get representatives
    if (['oc', 'am', 'ac'].includes(type)) {
      try {
        const repStart = Date.now();
        const tableName = `MemberRegist_${type.toUpperCase()}_Representatives`;
        const [representatives] = await connection.execute(
          `SELECT * FROM ${tableName} WHERE main_id = ?`,
          [id]
        );
        console.log(`[PERF] Representatives query took: ${Date.now() - repStart}ms`);
        additionalData.representatives = representatives || [];
      } catch (repError) {
        console.error('Error fetching representatives:', repError);
        additionalData.representatives = [];
      }
    }
    
    // For OC, AC, IC: Get business types and products in parallel
    if (['oc', 'ac', 'ic'].includes(type)) {
      try {
        const businessStart = Date.now();
        const businessTablePrefix = type === 'ic' ? 'ICmember' : `MemberRegist_${type.toUpperCase()}`;
        
        // Execute business types and products queries in parallel
        const [businessTypesResult, productsResult] = await Promise.all([
          connection.execute(
            `SELECT * FROM ${businessTablePrefix}_BusinessTypes WHERE main_id = ?`,
            [id]
          ),
          connection.execute(
            `SELECT * FROM ${businessTablePrefix}_Products WHERE main_id = ?`,
            [id]
          )
        ]);
        
        console.log(`[PERF] Business types and products queries took: ${Date.now() - businessStart}ms`);
        additionalData.businessTypes = businessTypesResult[0] || [];
        additionalData.products = productsResult[0] || [];
      } catch (businessError) {
        console.error('Error fetching business types/products:', businessError);
        additionalData.businessTypes = [];
        additionalData.products = [];
      }
    }
    
    // For OC, AM, AC: Get industrial groups and provincial chapters in parallel
    if (['oc', 'am', 'ac'].includes(type)) {
      try {
        const groupsStart = Date.now();
        const tablePrefix = `MemberRegist_${type.toUpperCase()}`;
        
        // Execute industrial groups and provincial chapters queries in parallel
        const [industrialGroupsResult, provincialChaptersResult] = await Promise.all([
          connection.execute(`
            SELECT industry_group_id as id
            FROM ${tablePrefix}_IndustryGroups
            WHERE main_id = ?
          `, [id]).catch(err => {
            console.error('Error fetching industrial groups:', err);
            return [[]]; // Return empty result
          }),
          connection.execute(`
            SELECT province_chapter_id as id
            FROM ${tablePrefix}_ProvinceChapters
            WHERE main_id = ?
          `, [id]).catch(err => {
            console.error('Error fetching provincial chapters:', err);
            return [[]]; // Return empty result
          })
        ]);
        
        console.log(`[PERF] Industrial groups and provincial chapters queries took: ${Date.now() - groupsStart}ms`);
        additionalData.industrialGroupIds = industrialGroupsResult[0] || [];
        additionalData.provincialChapterIds = provincialChaptersResult[0] || [];
      } catch (groupsError) {
        console.error('Error fetching groups:', groupsError);
        additionalData.industrialGroupIds = [];
        additionalData.provincialChapterIds = [];
      }
    }
    
    // For all types: Get documents
    try {
      const documentsStart = Date.now();
      const documentsTableName = type === 'ic' ? 'ICmember_Documents' : `MemberRegist_${type.toUpperCase()}_Documents`;
      const [documents] = await connection.execute(
        `SELECT * FROM ${documentsTableName} WHERE main_id = ?`,
        [id]
      );
      console.log(`[PERF] Documents query took: ${Date.now() - documentsStart}ms`);
      additionalData.documents = documents || [];
    } catch (docsError) {
      console.error('Error fetching documents:', docsError);
      additionalData.documents = [];
    }
    
    console.log(`[PERF] Additional data queries took: ${Date.now() - additionalDataStart}ms`);

    // Convert snake_case to camelCase for frontend compatibility
    const mainData = result[0];
    const convertedMainData = convertFieldNames(mainData, type);
    
    // Combine main data with additional data
    const membershipData = {
      ...convertedMainData,
      ...additionalData
    };

    // Release connection back to pool
    connection.release();
    
    console.log(`[PERF] Total request took: ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: true, data: membershipData });
  } catch (error) {
    console.error('Error fetching membership request details:', error);
    console.log(`[PERF] Request failed after: ${Date.now() - startTime}ms`);
    
    // Make sure to release connection in error case
    try {
      if (connection) {
        connection.release();
      }
    } catch (releaseError) {
      console.error('Error releasing connection:', releaseError);
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch membership request details' },
      { status: 500 }
    );
  }
}
