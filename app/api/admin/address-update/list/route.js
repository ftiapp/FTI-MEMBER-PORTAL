import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query as dbQuery } from '@/app/lib/db';

export async function GET(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // ข้ามการตรวจสอบว่ามีตาราง pending_address_updates หรือไม่
    // เนื่องจากทราบว่ามีตารางอยู่แล้ว
    console.log('Assuming table pending_address_updates exists...');

    console.log('Fetching pending address updates...');
    
    // ตรวจสอบข้อมูลทั้งหมดในตารางก่อน
    console.log('Checking all records in pending_address_updates table...');
    try {
      const allRecords = await dbQuery(`
        SELECT id, status, member_code, user_id FROM pending_address_updates
      `);
      console.log('All records:', JSON.stringify(allRecords, null, 2));
      console.log('Total records found:', allRecords.length);
      
      // Count records by status
      const pendingCount = allRecords.filter(r => r.status === 'pending').length;
      const approvedCount = allRecords.filter(r => r.status === 'approved').length;
      const rejectedCount = allRecords.filter(r => r.status === 'rejected').length;
      console.log(`Status counts - Pending: ${pendingCount}, Approved: ${approvedCount}, Rejected: ${rejectedCount}`);
    } catch (error) {
      console.error('Error checking all records:', error);
    }
    
    // ดึงข้อมูลคำขอแก้ไขที่อยู่ทั้งหมด
    console.log('Executing query for all address updates...');
    const sqlQuery = `
      SELECT 
        pau.id,
        pau.user_id,
        pau.member_code,
        pau.member_type,
        pau.member_group_code,
        pau.type_code,
        pau.addr_code,
        pau.old_address,
        pau.new_address,
        pau.request_date,
        pau.processed_date,
        pau.status,
        pau.admin_comment,
        cm.COMPANY_NAME as company_name,
        u.name,
        u.firstname,
        u.lastname,
        u.email,
        u.phone
      FROM pending_address_updates pau
      LEFT JOIN companies_Member cm ON pau.member_code = cm.MEMBER_CODE
      LEFT JOIN users u ON pau.user_id = u.id
      ORDER BY pau.request_date DESC
    `;
    console.log('SQL Query:', sqlQuery);
    
    const updates = await dbQuery(sqlQuery);
    
    console.log(`Found ${updates.length} pending address updates`);
    
    // แสดงข้อมูลแรกเพื่อดูโครงสร้าง
    if (updates.length > 0) {
      console.log('Sample update:', JSON.stringify(updates[0], null, 2));
    }

    // Make sure we're returning the updates array properly
    console.log('Final response data:', { success: true, updates, count: updates.length });
    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Error fetching address updates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch address updates', error: error.message },
      { status: 500 }
    );
  }
}

// ฟังก์ชันตรวจสอบว่ามีตารางในฐานข้อมูลหรือไม่
async function checkTableExists(tableName) {
  try {
    const rows = await dbQuery(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = ?
    `, [tableName]);
    
    return rows[0]?.count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}