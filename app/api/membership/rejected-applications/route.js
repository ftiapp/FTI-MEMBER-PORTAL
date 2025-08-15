import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { getUserFromSession } from '@/app/lib/userAuth';

export async function GET(request) {
  let connection;
  
  try {
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Ensure limit/offset are safe integers
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;

    // Fetch rejected applications for the user (interpolate limit/offset to avoid placeholder issues)
    const listQuery = `
      SELECT 
        r.id,
        r.membership_type,
        r.membership_id,
        r.admin_note,
        r.created_at,
        r.is_active,
        CASE 
          WHEN r.membership_type = 'oc' THEN oc.company_name_th
          WHEN r.membership_type = 'ac' THEN ac.company_name_th  
          WHEN r.membership_type = 'am' THEN am.company_name_th
          WHEN r.membership_type = 'ic' THEN CONCAT(ic.first_name_th, ' ', ic.last_name_th)
        END as application_name,
        CASE 
          WHEN r.membership_type = 'oc' THEN oc.tax_id
          WHEN r.membership_type = 'ac' THEN ac.tax_id  
          WHEN r.membership_type = 'am' THEN am.tax_id
          WHEN r.membership_type = 'ic' THEN ic.id_card_number
        END as identifier,
        CASE 
          WHEN r.membership_type = 'oc' THEN oc.rejection_reason
          WHEN r.membership_type = 'ac' THEN ac.rejection_reason  
          WHEN r.membership_type = 'am' THEN am.rejection_reason
          WHEN r.membership_type = 'ic' THEN ic.rejection_reason
        END as rejection_reason
      FROM MemberRegist_Reject_DATA r
      LEFT JOIN MemberRegist_OC_Main oc ON r.membership_type = 'oc' AND r.membership_id = oc.id
      LEFT JOIN MemberRegist_AC_Main ac ON r.membership_type = 'ac' AND r.membership_id = ac.id
      LEFT JOIN MemberRegist_AM_Main am ON r.membership_type = 'am' AND r.membership_id = am.id
      LEFT JOIN MemberRegist_IC_Main ic ON r.membership_type = 'ic' AND r.membership_id = ic.id
      WHERE r.user_id = ? AND r.is_active = 1
      ORDER BY r.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    const [rejectedApps] = await connection.execute(listQuery, [userId]);

    // Get total count
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM MemberRegist_Reject_DATA 
      WHERE user_id = ? AND is_active = 1
    `, [userId]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: rejectedApps,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching rejected applications:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch rejected applications' 
    }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch {}
    }
  }
}
