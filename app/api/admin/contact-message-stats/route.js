import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

/**
 * API endpoint to get statistics for contact messages by status
 * 
 * @returns {Object} Counts of contact messages grouped by status
 */
export async function GET() {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get counts for each status type
    const sql = `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM 
        contact_messages 
      GROUP BY 
        status
    `;
    
    const results = await query(sql);
    
    // Format the response with all possible statuses
    const statusCounts = {
      unread: 0,
      read: 0,
      replied: 0
    };
    
    // Fill in the actual counts
    results.forEach(row => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = row.count;
      }
    });
    
    // Get total count
    const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        statusCounts,
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching contact message stats:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch contact message statistics', 
      error: error.message 
    }, { status: 500 });
  }
}
