import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { getAdminFromSession, logAdminAction } from '../../../../lib/adminAuth';

/**
 * GET /api/admin/ic-membership/[id]
 * 
 * Fetches detailed information about a specific IC membership application
 */
export async function GET(request, { params }) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin session verified
    
    // ต้อง await params เพื่อหลีกเลี่ยง warning จาก Next.js
    const { id } = await params;
    
    // Get basic information
    const infoQuery = `
      SELECT *
      FROM ICmember_Info
      WHERE id = ?
    `;
    
    const infoResult = await query(infoQuery, [id]);
    
    if (infoResult.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    const application = infoResult[0];
    
    // Get province chapter - ใช้เฉพาะข้อมูลจาก ICmember_Province_Group เนื่องจากไม่มีตาราง province_chapters
    const provinceQuery = `
      SELECT *
      FROM ICmember_Province_Group
      WHERE ic_member_id = ?
    `;
    
    const provinceResult = await query(provinceQuery, [id]);
    application.provinceChapter = provinceResult.length > 0 ? provinceResult[0] : null;
    
    // Get industry group - ใช้เฉพาะข้อมูลจาก ICmember_Industry_Group เนื่องจากไม่มีตาราง industry_groups
    const industryQuery = `
      SELECT *
      FROM ICmember_Industry_Group
      WHERE ic_member_id = ?
    `;
    
    const industryResult = await query(industryQuery, [id]);
    application.industryGroup = industryResult.length > 0 ? industryResult[0] : null;
    
    // Get representatives
    const representativesQuery = `
      SELECT *
      FROM ICmember_Representatives
      WHERE ic_member_id = ?
    `;
    
    const representativesResult = await query(representativesQuery, [id]);
    application.representatives = representativesResult;
    
    // Get address
    const addressQuery = `
      SELECT *
      FROM ICmember_Addr
      WHERE ic_member_id = ?
    `;
    
    const addressResult = await query(addressQuery, [id]);
    application.address = addressResult.length > 0 ? addressResult[0] : null;
    
    // Get business info
    const businessInfoQuery = `
      SELECT *
      FROM ICmember_Business_Info
      WHERE ic_member_id = ?
    `;
    
    const businessInfoResult = await query(businessInfoQuery, [id]);
    application.businessInfo = businessInfoResult.length > 0 ? businessInfoResult[0] : null;
    
    // Get business types
    const businessTypeQuery = `
      SELECT *
      FROM ICmember_Business_TYPE
      WHERE ic_member_id = ?
    `;
    
    const businessTypeResult = await query(businessTypeQuery, [id]);
    application.businessType = businessTypeResult.length > 0 ? businessTypeResult[0] : null;
    
    // ไม่มีตาราง ICmember_Business_Categories จึงข้ามการ query ส่วนนี้
    application.businessCategories = [];
    
    // Get products
    const productsQuery = `
      SELECT *
      FROM ICmember_Products
      WHERE ic_member_id = ?
    `;
    
    const productsResult = await query(productsQuery, [id]);
    application.products = productsResult;
    
    // Get documents
    const documentsQuery = `
      SELECT *
      FROM ICmember_Document
      WHERE ic_member_id = ?
    `;
    
    const documentsResult = await query(documentsQuery, [id]);
    application.documents = documentsResult;
    
    return NextResponse.json({ application });
    
  } catch (error) {
    console.error('Error fetching IC membership application details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/ic-membership/[id]
 * 
 * Updates an IC membership application
 */
export async function PUT(request, { params }) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin session verified

    // ต้อง await params เพื่อหลีกเลี่ยง warning จาก Next.js
    const { id } = await params;
    const data = await request.json();
    
    // Start a transaction
    await query('START TRANSACTION');
    
    try {
      // Update basic information
      const infoUpdateQuery = `
        UPDATE ICmember_Info
        SET
          first_name_thai = ?,
          last_name_thai = ?,
          first_name_english = ?,
          last_name_english = ?,
          id_card_number = ?,
          email = ?,
          phone = ?,
          mobile = ?,
          fax = ?
        WHERE id = ?
      `;
      
      await query(infoUpdateQuery, [
        data.first_name_thai,
        data.last_name_thai,
        data.first_name_english,
        data.last_name_english,
        data.id_card_number,
        data.email,
        data.phone,
        data.mobile,
        data.fax,
        id
      ]);
      
      // Update province chapter if provided
      if (data.provinceChapter) {
        // Delete existing province chapter
        await query('DELETE FROM ICmember_Province_Group WHERE ic_member_id = ?', [id]);
        
        // Insert new province chapter if selected
        if (data.provinceChapter.id) {
          await query(
            'INSERT INTO ICmember_Province_Group (user_id, ic_member_id, member_code, member_main_group_code, member_group_code, member_group_name) VALUES (?, ?, ?, ?, ?, ?)',
            [data.user_id, id, data.provinceChapter.member_code || '', data.provinceChapter.member_main_group_code || '', data.provinceChapter.member_group_code || '', data.provinceChapter.member_group_name || '']
          );
        }
      }
      
      // Update industry group if provided
      if (data.industryGroup) {
        // Delete existing industry group
        await query('DELETE FROM ICmember_Industry_Group WHERE ic_member_id = ?', [id]);
        
        // Insert new industry group if selected
        if (data.industryGroup.id) {
          await query(
            'INSERT INTO ICmember_Industry_Group (user_id, ic_member_id, member_code, member_main_group_code, member_group_code, member_group_name) VALUES (?, ?, ?, ?, ?, ?)',
            [data.user_id, id, data.industryGroup.member_code || '', data.industryGroup.member_main_group_code || '', data.industryGroup.member_group_code || '', data.industryGroup.member_group_name || '']
          );
        }
      }
      
      // Update representatives if provided
      if (data.representatives && data.representatives.length > 0) {
        // Delete existing representatives
        await query('DELETE FROM ICmember_Representatives WHERE ic_member_id = ?', [id]);
        
        // Insert new representatives
        for (const rep of data.representatives) {
          await query(
            `INSERT INTO ICmember_Representatives 
            (user_id, ic_member_id, first_name_thai, last_name_thai, first_name_english, last_name_english, 
            position_thai, position_english, email, phone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.user_id,
              id,
              rep.first_name_thai,
              rep.last_name_thai,
              rep.first_name_english || null,
              rep.last_name_english || null,
              rep.position_thai || null,
              rep.position_english || null,
              rep.email || null,
              rep.phone || null
            ]
          );
        }
      }
      
      // Update address if provided
      if (data.address) {
        const addressUpdateQuery = `
          UPDATE ICmember_Addr
          SET
            address_number = ?,
            building = ?,
            moo = ?,
            soi = ?,
            road = ?,
            sub_district = ?,
            district = ?,
            province = ?,
            postal_code = ?,
            website = ?,
            facebook = ?,
            telephone = ?,
            email = ?,
            fax = ?
          WHERE ic_member_id = ?
        `;
        
        await query(addressUpdateQuery, [
          data.address.address_number,
          data.address.building,
          data.address.moo,
          data.address.soi,
          data.address.road,
          data.address.sub_district,
          data.address.district,
          data.address.province,
          data.address.postal_code,
          data.address.website,
          data.address.facebook,
          data.address.telephone,
          data.address.email,
          data.address.fax,
          id
        ]);
      }
      
      // Update business info if provided
      if (data.businessInfo) {
        const businessInfoUpdateQuery = `
          UPDATE ICmember_Business_Info
          SET
            business_category_other = ?
          WHERE ic_member_id = ?
        `;
        
        await query(businessInfoUpdateQuery, [
          data.businessInfo.business_category_other,
          id
        ]);
      }
      
      // Update business types if provided
      if (data.businessType) {
        // Check if business type record exists
        const checkBusinessTypeQuery = `
          SELECT id FROM ICmember_Business_TYPE WHERE ic_member_id = ?
        `;
        
        const businessTypeResult = await query(checkBusinessTypeQuery, [id]);
        
        if (businessTypeResult.length > 0) {
          // Update existing record
          const businessTypeUpdateQuery = `
            UPDATE ICmember_Business_TYPE
            SET
              distributor = ?,
              exporter = ?,
              importer = ?,
              manufacturer = ?,
              service_provider = ?,
              other = ?,
              other_detail = ?
            WHERE ic_member_id = ?
          `;
          
          await query(businessTypeUpdateQuery, [
            data.businessType.distributor || false,
            data.businessType.exporter || false,
            data.businessType.importer || false,
            data.businessType.manufacturer || false,
            data.businessType.service_provider || false,
            data.businessType.other || false,
            data.businessType.other_detail || null,
            id
          ]);
        } else {
          // Insert new record
          const businessTypeInsertQuery = `
            INSERT INTO ICmember_Business_TYPE (
              user_id, ic_member_id, distributor, exporter, importer, 
              manufacturer, service_provider, other, other_detail
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await query(businessTypeInsertQuery, [
            data.user_id,
            id,
            data.businessType.distributor || false,
            data.businessType.exporter || false,
            data.businessType.importer || false,
            data.businessType.manufacturer || false,
            data.businessType.service_provider || false,
            data.businessType.other || false,
            data.businessType.other_detail || null
          ]);
        }
      }
      
      // Update products if provided
      if (data.products && data.products.length > 0) {
        // Delete existing products
        await query('DELETE FROM ICmember_Products WHERE ic_member_id = ?', [id]);
        
        // Insert new products
        for (const product of data.products) {
          await query(
            'INSERT INTO ICmember_Products (user_id, ic_member_id, thai, english) VALUES (?, ?, ?, ?)',
            [data.user_id, id, product.thai, product.english]
          );
        }
      }
      
      // Commit the transaction
      await query('COMMIT');
      
      // Log the admin action
      await logAdminAction({
        adminId: session.user.id,
        actionType: 'update_ic_membership',
        targetId: id,
        description: `Updated IC membership application for ${data.first_name_thai} ${data.last_name_thai} (ID Card: ${data.id_card_number})`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      return NextResponse.json({ success: true, message: 'Application updated successfully' });
      
    } catch (error) {
      // Rollback the transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating IC membership application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
