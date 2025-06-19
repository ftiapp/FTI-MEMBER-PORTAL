// API route: /api/dashboard/operation-status/product-update-status?userId=xxx
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to fetch product update requests for the current user
 * @route GET /api/dashboard/operation-status/product-update-status
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

    // Check if the pending_product_updates table exists
    try {
      const tableExists = await query(
        `SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'pending_product_updates'`
      );
      
      if (tableExists[0].count === 0) {
        console.log('pending_product_updates table does not exist');
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

    // Fetch product update requests for this user
    const productUpdates = await query(
      `SELECT 
        ppu.id,
        ppu.user_id,
        ppu.member_code,
        ppu.company_name,
        ppu.member_type,
        ppu.member_group_code,
        ppu.type_code,
        ppu.old_products_th,
        ppu.new_products_th,
        ppu.old_products_en,
        ppu.new_products_en,
        ppu.status,
        ppu.admin_notes,
        ppu.reject_reason,
        ppu.created_at,
        ppu.updated_at
      FROM 
        pending_product_updates ppu
      WHERE 
        ppu.user_id = ?
      ORDER BY 
        ppu.created_at DESC`,
      [userId]
    );

    console.log(`Found ${productUpdates.length} product update requests for user ${userId}`);

    return NextResponse.json({
      success: true,
      updates: productUpdates
    });
  } catch (error) {
    console.error('Error fetching product update status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch product update status',
      updates: []
    }, { status: 500 });
  }
}
