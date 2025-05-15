import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // ตรวจสอบว่ามีตาราง pending_address_updates หรือไม่
    const tableExists = await checkTableExists('pending_address_updates');
    if (!tableExists) {
      console.log('Table pending_address_updates does not exist');
      return NextResponse.json({ 
        success: false, 
        message: 'Table pending_address_updates does not exist' 
      });
    }

    // ดึงข้อมูลทั้งหมดจากตาราง pending_address_updates
    const [allRecords] = await query(`
      SELECT * FROM pending_address_updates
    `);
    
    // ดึงข้อมูลโครงสร้างตาราง
    const [tableStructure] = await query(`
      DESCRIBE pending_address_updates
    `);

    // ตรวจสอบจำนวนรายการตามสถานะ
    const [statusCounts] = await query(`
      SELECT status, COUNT(*) as count 
      FROM pending_address_updates 
      GROUP BY status
    `);

    // ดึงข้อมูลล่าสุด 5 รายการ
    const [recentRecords] = await query(`
      SELECT id, user_id, member_code, member_type, member_group_code, 
             type_code, addr_code, request_date, status
      FROM pending_address_updates
      ORDER BY request_date DESC
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      tableExists,
      tableStructure,
      totalRecords: allRecords.length,
      statusCounts,
      recentRecords
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching debug information', 
      error: error.message 
    }, { status: 500 });
  }
}

// ฟังก์ชันตรวจสอบว่ามีตารางในฐานข้อมูลหรือไม่
async function checkTableExists(tableName) {
  try {
    const [rows] = await query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = ?
    `, [tableName]);
    
    return rows[0].count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}
