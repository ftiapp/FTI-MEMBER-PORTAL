import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET(request) {
  try {
    // Check if user is admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const memberCode = searchParams.get('memberCode') || '';
    const actionType = searchParams.get('actionType') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build query conditions
    let conditions = [];
    let params = [];

    if (memberCode) {
      conditions.push('cl.member_code LIKE ?');
      params.push(`%${memberCode}%`);
    }

    if (actionType) {
      conditions.push('cl.action_type = ?');
      params.push(actionType);
    }

    if (startDate) {
      conditions.push('cl.first_created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('cl.last_updated_at <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM certificate_logs_count cl ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get logs with user information
    const logs = await query(
      `SELECT cl.*, u.email, u.firstname, u.lastname,
              DATE_FORMAT(cl.first_created_at, '%Y-%m-%d %H:%i:%s') as first_created_at_formatted,
              DATE_FORMAT(cl.last_updated_at, '%Y-%m-%d %H:%i:%s') as last_updated_at_formatted
       FROM certificate_logs_count cl
       LEFT JOIN users u ON cl.user_id = u.id
       ${whereClause}
       ORDER BY cl.last_updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // Calculate total views across all records
    const totalViewsResult = await query(
      `SELECT SUM(count) as total_views FROM certificate_logs_count`
    );
    const totalViews = totalViewsResult[0].total_views || 0;
    
    console.log(`Admin fetched ${logs.length} certificate logs (total views: ${totalViews})`);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalViews,
        averageViewsPerRecord: totalViews / (total || 1)
      }
    });
  } catch (error) {
    console.error('Error fetching certificate logs:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message,
      logs: [],
      pagination: {
        total: 0,
        limit,
        offset,
        totalPages: 0
      }
    }, { status: 500 });
  }
}
