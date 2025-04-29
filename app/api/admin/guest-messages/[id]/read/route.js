import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Update message status to 'read'
    const updateQuery = `
      UPDATE guest_contact_messages
      SET status = 'read', read_by_admin_id = ?
      WHERE id = ? AND status = 'unread'
    `;
    
    const result = await query(updateQuery, [admin.id, id]);
    
    // Log the action
    const logQuery = `
      INSERT INTO admin_actions_log 
      (admin_id, action_type, target_id, description, ip_address, user_agent, created_at)
      VALUES (?, 'contact_message_response', ?, 'Read guest contact message', ?, ?, NOW())
    `;
    
    await query(logQuery, [
      admin.id,
      id,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
