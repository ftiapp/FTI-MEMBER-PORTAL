import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch all operations status
    const operations = await fetchOperationStatus(userId);

    return NextResponse.json({ operations });
  } catch (error) {
    console.error('Error fetching operation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function fetchOperationStatus(userId) {
  try {
    // Fetch member verification status
    const memberVerifications = await query(
      `SELECT id, user_id, MEMBER_CODE, company_name, company_type, Admin_Submit, reject_reason, created_at 
       FROM companies_Member 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Fetch profile update requests
    const profileUpdates = await query(
      `SELECT id, user_id, new_firstname, new_lastname, status, reject_reason, created_at 
       FROM profile_update_requests 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Transform member verifications
    const memberOperations = memberVerifications.map(verification => ({
      id: verification.id,
      type: 'member_verification',
      title: `ยืนยันสมาชิกเดิม: ${verification.company_name} (${verification.MEMBER_CODE})`,
      description: `ประเภทบริษัท: ${verification.company_type}`,
      status: verification.Admin_Submit === 0 ? 'pending' : 
              verification.Admin_Submit === 1 ? 'approved' : 'rejected',
      reason: verification.reject_reason,
      created_at: verification.created_at
    }));

    // Transform profile updates
    const profileOperations = profileUpdates.map(update => ({
      id: update.id,
      type: 'profile_update',
      title: 'แก้ไขข้อมูลส่วนตัว',
      description: `แก้ไขชื่อและนามสกุลเป็น ${update.new_firstname} ${update.new_lastname}`,
      status: update.status,
      reason: update.reject_reason,
      created_at: update.created_at
    }));

    // Combine all operations and sort by creation date (newest first)
    const allOperations = [
      ...memberOperations,
      ...profileOperations
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return allOperations;
  } catch (error) {
    console.error('Error in fetchOperationStatus:', error);
    throw error;
  }
}
