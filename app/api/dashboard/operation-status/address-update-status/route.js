// API route: /api/dashboard/operation-status/address-update-status?userId=xxx
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to fetch address update requests for the current user
 * @route GET /api/dashboard/operation-status/address-update-status
 */
export async function GET(request) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.error('No userId provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if the pending_address_updates table exists
    try {
      const tableExists = await query(
        `SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'pending_address_updates'`
      );
      
      if (tableExists[0].count === 0) {
        console.log('pending_address_updates table does not exist');
        return NextResponse.json({ 
          success: true, 
          updates: [] 
        });
      }
    } catch (error) {
      console.error('Error checking if table exists:', error);
      return NextResponse.json({ 
        success: true, 
        updates: [] 
      });
    }

    // Fetch address update requests for this user
    const addressUpdates = await query(
      `SELECT 
        pau.id,
        pau.member_code,
        pau.type_code,
        pau.addr_code,
        pau.old_address,
        pau.new_address,
        pau.request_date,
        pau.processed_date,
        pau.status,
        pau.admin_comment,
        cm.COMPANY_NAME as company_name
      FROM 
        pending_address_updates pau
      LEFT JOIN 
        companies_Member cm ON pau.member_code = cm.MEMBER_CODE
      WHERE 
        pau.user_id = ?
      ORDER BY 
        pau.request_date DESC`,
      [userId]
    );

    console.log(`Found ${addressUpdates.length} address update requests for user ${userId}`);

    return NextResponse.json({
      success: true,
      updates: addressUpdates
    });
  } catch (error) {
    console.error('Error fetching address update status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch address update status',
      updates: []
    }, { status: 500 });
  }
}
