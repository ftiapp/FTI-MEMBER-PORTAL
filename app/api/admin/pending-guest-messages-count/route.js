import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getAdminFromSession } from '../../../lib/adminAuth';

export async function GET() {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Query to count unread guest messages
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM guest_contact_messages 
      WHERE status = 'unread'
    `;
    
    const result = await query(countQuery);
    const count = result[0]?.count || 0;

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending guest messages count:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pending guest messages count' },
      { status: 500 }
    );
  }
}
