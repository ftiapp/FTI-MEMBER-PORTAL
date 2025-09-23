import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

/**
 * GET handler for retrieving members with filtering by status
 * 
 * This endpoint returns members filtered by Admin_Submit status (0=pending, 1=approved, 2=rejected)
 * with pagination support.
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
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || '0';
    const term = (url.searchParams.get('term') || '').trim();
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const sortFieldParam = (url.searchParams.get('sortField') || '').trim();
    const sortOrderParam = (url.searchParams.get('sortOrder') || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build dynamic where conditions
    const whereClauses = ['cm.Admin_Submit = ?'];
    const whereParams = [status];

    if (term) {
      const like = `%${term}%`;
      whereClauses.push(`(
        cm.MEMBER_CODE LIKE ?
        OR cm.company_name LIKE ?
        OR u.email LIKE ?
        OR CONCAT(COALESCE(u.firstname,''),' ',COALESCE(u.lastname,'')) LIKE ?
      )`);
      whereParams.push(like, like, like, like);
    }

    if (from) {
      whereClauses.push('cm.created_at >= ?');
      whereParams.push(from);
    }
    if (to) {
      whereClauses.push('cm.created_at <= ?');
      whereParams.push(to);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Validate sort field mapping
    const sortFieldMap = {
      company_name: 'cm.company_name',
      created_at: 'cm.created_at',
      Admin_Submit: 'cm.Admin_Submit',
      name: "CONCAT(COALESCE(u.firstname,''),' ',COALESCE(u.lastname,''))",
      email: 'u.email',
      id: 'cm.id',
    };
    const sortFieldSql = sortFieldMap[sortFieldParam] || 'cm.id';

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM companies_Member cm
       JOIN users u ON cm.user_id = u.id
       ${whereSql}`,
      whereParams
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Get members with the specified status
    // Convert limit and offset to numbers to avoid MySQL prepared statement issues
    const membersResult = await query(
      `SELECT cm.*, u.email, u.name, u.firstname, u.lastname, u.phone
       FROM companies_Member cm
       JOIN users u ON cm.user_id = u.id
       ${whereSql}
       ORDER BY ${sortFieldSql} ${sortOrderParam}
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      whereParams
    );
    
    // Get documents for each member, grouped by MEMBER_CODE
    const membersWithDocuments = await Promise.all(
      membersResult.map(async (member) => {
        const documents = await query(
          `SELECT id, MEMBER_CODE, file_name, file_path, status, Admin_Submit, reject_reason, uploaded_at, updated_at
           FROM documents_Member
           WHERE user_id = ? AND MEMBER_CODE = ?
           ORDER BY uploaded_at DESC`,
          [member.user_id, member.MEMBER_CODE]
        );
        
        return {
          ...member,
          documents
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: membersWithDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก' },
      { status: 500 }
    );
  }
}
