import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkAdminSession } from '@/app/lib/auth';
import { pool } from '@/app/lib/db';

/**
 * API endpoint to list all product update requests
 * @param {Object} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function GET(request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const admin = await checkAdminSession(cookieStore);

    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลผู้ดูแลระบบ กรุณาเข้าสู่ระบบใหม่' 
      }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Check if the table exists
    const [tableExists] = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'pending_product_updates'
    `);

    if (tableExists[0].count === 0) {
      // Table doesn't exist yet, so there are no requests
      return NextResponse.json({ 
        success: true, 
        updates: [],
        pagination: {
          total: 0,
          limit,
          page,
          totalPages: 0
        }
      });
    }

    // Build the query based on status and search parameters
    let query = `
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM pending_product_updates p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      queryParams.push(status);
    }
    
    if (search) {
      query += ` AND (p.member_code LIKE ? OR p.company_name LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Count total results for pagination
    const countQuery = query.replace('p.*, u.name as user_name, u.email as user_email', 'COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Add sorting and pagination
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Execute the query
    const [updates] = await pool.query(query, queryParams);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      updates,
      pagination: {
        total,
        limit,
        page,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching product updates:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูลสินค้า' 
    }, { status: 500 });
  }
}
