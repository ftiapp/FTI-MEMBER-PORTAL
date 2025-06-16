import { getAdminFromSession } from '../../../lib/adminAuth';
import { query } from '../../../lib/db';

export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all counts in a single database query using subqueries
    const countsQuery = `
      SELECT
        0 AS verifications_count, -- ลบการอ้างอิงถึงตาราง member_verifications ที่ไม่มีอยู่จริง
        (SELECT COUNT(*) FROM profile_update_requests WHERE status = 'pending') AS profile_updates_count,
        (SELECT COUNT(*) FROM pending_address_updates WHERE status = 'pending') AS address_updates_count,
        (SELECT COUNT(*) FROM guest_contact_messages WHERE status = 'unread') AS guest_messages_count,
        (SELECT COUNT(*) FROM pending_product_updates WHERE status = 'pending') AS product_updates_count
    `;

    const [countsResult] = await query(countsQuery);

    return new Response(JSON.stringify({
      success: true,
      counts: {
        verifications: countsResult.verifications_count || 0,
        profileUpdates: countsResult.profile_updates_count || 0,
        addressUpdates: countsResult.address_updates_count || 0,
        guestMessages: countsResult.guest_messages_count || 0,
        productUpdates: countsResult.product_updates_count || 0
      },
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        adminLevel: admin.adminLevel || admin.admin_level || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
