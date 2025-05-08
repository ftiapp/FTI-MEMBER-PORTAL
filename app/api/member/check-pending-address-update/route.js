import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

/**
 * API endpoint to check if a user has a pending address update request
 * for a specific address
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const memberCode = searchParams.get('memberCode');
    const compPersonCode = searchParams.get('compPersonCode');
    const memberType = searchParams.get('memberType');
    const memberGroupCode = searchParams.get('memberGroupCode');
    const typeCode = searchParams.get('typeCode');
    const addrCode = searchParams.get('addrCode');
    const addrLang = searchParams.get('addrLang');
    
    // Validate required parameters
    if (!userId || !memberCode || !addrCode) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Check for pending address update requests
    const pendingCheckQuery = `
      SELECT id FROM pending_address_updates 
      WHERE user_id = ? 
      AND member_code = ? 
      AND comp_person_code = ?
      AND member_type = ? 
      AND member_group_code = ? 
      AND type_code = ? 
      AND addr_code = ? 
      AND addr_lang = ? 
      AND status = 'pending'
    `;
    
    const pendingRequests = await query(pendingCheckQuery, [
      userId, 
      memberCode, 
      compPersonCode || '',
      memberType || '000', 
      memberGroupCode || '', 
      typeCode || '000', 
      addrCode,
      addrLang || 'th'
    ]);
    
    return NextResponse.json({ 
      success: true, 
      hasPendingRequest: pendingRequests.length > 0,
      requestCount: pendingRequests.length
    });
    
  } catch (error) {
    console.error('Error checking pending address update:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
