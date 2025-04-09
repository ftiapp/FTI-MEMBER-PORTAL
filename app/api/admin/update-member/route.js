import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession, logAdminAction } from '@/app/lib/adminAuth';

/**
 * POST handler for updating member information
 * 
 * This endpoint allows admins to update member details and logs the action.
 */
export async function POST(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }
    
    // Get update data from request body
    const {
      id,
      MEMBER_CODE,
      company_name,
      company_type,
      registration_number,
      tax_id,
      address,
      province,
      postal_code,
      phone,
      website,
      admin_comment
    } = await request.json();
    
    if (!id || !company_name) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }
    
    // Check if member exists
    const memberCheck = await query(
      'SELECT user_id FROM companies_Member WHERE id = ?',
      [id]
    );
    
    if (memberCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลสมาชิก' },
        { status: 404 }
      );
    }
    
    const userId = memberCheck[0].user_id;
    
    // Update member information
    await query(
      `UPDATE companies_Member SET
        MEMBER_CODE = ?,
        company_name = ?,
        company_type = ?,
        registration_number = ?,
        tax_id = ?,
        address = ?,
        province = ?,
        postal_code = ?,
        phone = ?,
        website = ?,
        admin_comment = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        MEMBER_CODE,
        company_name,
        company_type,
        registration_number,
        tax_id,
        address,
        province,
        postal_code,
        phone,
        website,
        admin_comment,
        id
      ]
    );
    
    // Log admin action
    await logAdminAction(
      admin.id,
      'update_member',
      id,
      `Member updated: ${company_name}`,
      request
    );
    
    // Log in Member_portal_User_log
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        'member_update',
        `Member information updated by admin`,
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'อัพเดตข้อมูลสมาชิกเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัพเดตข้อมูลสมาชิก' },
      { status: 500 }
    );
  }
}
