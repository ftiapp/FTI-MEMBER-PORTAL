import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

/**
 * API endpoint for fetching pending member verification requests
 * 
 * This endpoint retrieves members who have submitted verification information
 * but have not yet been approved or rejected by an admin. It includes pagination
 * and joins data from multiple tables to provide complete information.
 */

export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Get pending members with user information
    const members = await query(
      `SELECT 
        c.id, 
        c.user_id, 
        c.company_name, 
        c.company_type,
        c.registration_number,
        c.address,
        c.province,
        c.postal_code,
        c.phone,
        c.website,
        c.Admin_Submit,
        c.created_at,
        d.id as document_id,
        d.document_type,
        d.file_path,
        d.status as document_status,
        u.email,
        u.name as user_name,
        u.firstname,
        u.lastname
      FROM 
        companies_Member c
      JOIN 
        documents_Member d ON c.user_id = d.user_id
      JOIN
        users u ON c.user_id = u.id
      WHERE 
        c.Admin_Submit = 0
      ORDER BY 
        c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`
    );
    
    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM companies_Member WHERE Admin_Submit = 0`
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    

    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching pending members:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}
