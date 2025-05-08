import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function GET(request) {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists('pending_address_updates');
    if (!tableExists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Table pending_address_updates does not exist' 
      });
    }

    // Create a test record
    const oldAddress = {
      "ADDR_CODE": "001",
      "ADDR_NO": "เลขที่ 43",
      "ADDR_MOO": null,
      "ADDR_SOI": "ซอยประเสริฐมนูกิจ 5",
      "ADDR_ROAD": null,
      "ADDR_SUB_DISTRICT": "แขวงจรเข้บัว",
      "ADDR_DISTRICT": "เขตลาดพร้าว",
      "ADDR_PROVINCE_NAME": "กรุงเทพมหานคร",
      "ADDR_POSTCODE": "10230",
      "ADDR_TELEPHONE": "09-7165-9574",
      "ADDR_FAX": "0-2570-5581",
      "ADDR_FAX_EN": "0-2570-5581",
      "ADDR_EMAIL": "thaibiogastrade@gmail.com",
      "ADDR_NO_EN": "No 43",
      "ADDR_MOO_EN": null,
      "ADDR_SOI_EN": "Soi Prasertmanookit 5,",
      "ADDR_ROAD_EN": null,
      "ADDR_SUB_DISTRICT_EN": "Jorakhebua,",
      "ADDR_DISTRICT_EN": "Ladprao,",
      "ADDR_PROVINCE_NAME_EN": "Bangkok",
      "ADDR_POSTCODE_EN": "10230",
      "ADDR_TELEPHONE_EN": "09-7165-9574",
      "ADDR_EMAIL_EN": "thaibiogastrade@gmail.com",
      "ADDR_WEBSITE": null
    };

    const newAddress = {
      "ADDR_CODE": "001",
      "ADDR_NO": "เลขที่ 43/1",
      "ADDR_MOO": null,
      "ADDR_SOI": "ซอยประเสริฐมนูกิจ 5",
      "ADDR_ROAD": "ถนนประเสริฐมนูกิจ",
      "ADDR_SUB_DISTRICT": "แขวงจรเข้บัว",
      "ADDR_DISTRICT": "เขตลาดพร้าว",
      "ADDR_PROVINCE_NAME": "กรุงเทพมหานคร",
      "ADDR_POSTCODE": "10230",
      "ADDR_TELEPHONE": "09-7165-9574",
      "ADDR_FAX": "0-2570-5581",
      "ADDR_FAX_EN": "0-2570-5581",
      "ADDR_EMAIL": "thaibiogastrade@gmail.com",
      "ADDR_NO_EN": "No 43/1",
      "ADDR_MOO_EN": null,
      "ADDR_SOI_EN": "Soi Prasertmanookit 5,",
      "ADDR_ROAD_EN": "Prasertmanookit Road",
      "ADDR_SUB_DISTRICT_EN": "Jorakhebua,",
      "ADDR_DISTRICT_EN": "Ladprao,",
      "ADDR_PROVINCE_NAME_EN": "Bangkok",
      "ADDR_POSTCODE_EN": "10230",
      "ADDR_TELEPHONE_EN": "09-7165-9574",
      "ADDR_EMAIL_EN": "thaibiogastrade@gmail.com",
      "ADDR_WEBSITE": null
    };

    // Check if a test record already exists
    const [existingRecords] = await db.query(
      'SELECT id FROM pending_address_updates WHERE member_code = ? AND type_code = ? AND addr_code = ? AND status = ?',
      ['TEST001', '000', '001', 'pending']
    );

    let testRecordId;

    if (existingRecords.length > 0) {
      testRecordId = existingRecords[0].id;
      console.log('Test record already exists with ID:', testRecordId);
    } else {
      // Insert a test record
      const insertResult = await db.query(
        `INSERT INTO pending_address_updates (
          user_id, 
          member_code, 
          member_type,
          member_group_code,
          type_code,
          addr_code, 
          old_address, 
          new_address, 
          request_date, 
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
        [
          1, // user_id (assuming user with ID 1 exists)
          'TEST001', // member_code
          '000', // member_type
          'TEST', // member_group_code
          '001', // type_code
          '001', // addr_code
          JSON.stringify(oldAddress), // old_address
          JSON.stringify(newAddress), // new_address
        ]
      );

      testRecordId = insertResult.insertId;
      console.log('Created test record with ID:', testRecordId);
    }

    // Fetch all records to confirm
    const [allRecords] = await db.query('SELECT * FROM pending_address_updates');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test record created or found',
      testRecordId,
      totalRecords: allRecords.length,
      pendingRecords: allRecords.filter(r => r.status === 'pending').length
    });
  } catch (error) {
    console.error('Error creating test record:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create test record', 
      error: error.message 
    }, { status: 500 });
  }
}

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const [rows] = await db.query(`
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
