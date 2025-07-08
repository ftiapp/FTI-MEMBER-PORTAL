import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getAdminFromSession, logAdminAction } from '../../../lib/adminAuth';

/**
 * GET /api/admin/ic-membership
 * 
 * Fetches IC membership applications with pagination, filtering, and search
 * 
 * Query parameters:
 * - page: Current page number (default: 1)
 * - limit: Number of items per page (default: 10)
 * - status: Filter by status ('all', 'pending', 'approved', 'rejected')
 * - search: Search term for name or ID card number
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
    const statusFilter = searchParams.get('status') || 'all';
    const searchTerm = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    // Status filter
    if (statusFilter !== 'all') {
      let statusValue;
      switch (statusFilter) {
        case 'pending':
          statusValue = 0;
          break;
        case 'approved':
          statusValue = 1;
          break;
        case 'rejected':
          statusValue = 2;
          break;
        default:
          statusValue = null;
      }
      
      if (statusValue !== null) {
        conditions.push('i.status = ?');
        params.push(statusValue);
      }
    }
    
    // Search filter
    if (searchTerm) {
      conditions.push('(i.first_name_thai LIKE ? OR i.last_name_thai LIKE ? OR i.first_name_english LIKE ? OR i.last_name_english LIKE ? OR i.id_card_number LIKE ?)');
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Combine conditions
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ICmember_Info i
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;
    
    // Get applications with pagination
    const applicationsQuery = `
      SELECT 
        i.id,
        i.first_name_thai,
        i.last_name_thai,
        i.first_name_english,
        i.last_name_english,
        i.id_card_number,
        i.status,
        i.created_at
      FROM ICmember_Info i
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const applications = await query(applicationsQuery, [...params, limit, offset]);
    
    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
    // โค้ดส่วนนี้ไม่จำเป็นต้องมีแล้ว เพราะได้ย้ายไปอยู่ใน try-catch ด้านบนแล้ว
    
  } catch (error) {
    console.error('Error fetching IC membership applications:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}
