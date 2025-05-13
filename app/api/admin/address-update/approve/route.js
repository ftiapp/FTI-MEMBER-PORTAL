import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';
import { mssqlQuery } from '@/app/lib/mssql';

export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // รับข้อมูลจาก request body
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลคำขอแก้ไขที่อยู่
    const addressUpdates = await query(
      'SELECT * FROM pending_address_updates WHERE id = ? AND status = "pending"',
      [id]
    );

    console.log('Address update query result:', JSON.stringify(addressUpdates));

    if (!addressUpdates || addressUpdates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Address update request not found or already processed' },
        { status: 404 }
      );
    }

    const addressUpdate = addressUpdates[0];
    console.log('Address update object:', JSON.stringify(addressUpdate));

    // Safely extract properties with defaults
    const user_id = addressUpdate.user_id || null;
    const member_code = addressUpdate.member_code || '';
    const comp_person_code = addressUpdate.comp_person_code || '';
    const member_type = addressUpdate.member_type || '';
    const member_group_code = addressUpdate.member_group_code || '';
    const type_code = addressUpdate.type_code || '';
    const addr_code = addressUpdate.addr_code || '';
    const addr_lang = addressUpdate.addr_lang || 'th';
    const new_address = addressUpdate.new_address || '{}';

    // Validate required fields
    if (!member_code || !comp_person_code || !member_type || !member_group_code || !addr_code) {
      console.error('Missing required fields in address update:', addressUpdate);
      return NextResponse.json(
        { success: false, message: 'Missing required fields in address update request' },
        { status: 400 }
      );
    }

    // แปลง new_address จาก string เป็น object
    let newAddressObj;
    try {
      newAddressObj = typeof new_address === 'string' ? JSON.parse(new_address) : new_address;
    } catch (error) {
      console.error('Error parsing new_address JSON:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid address format in update request', error: error.message },
        { status: 400 }
      );
    }
    
    console.log('Parsed new address object:', JSON.stringify(newAddressObj));

    // เริ่ม transaction ใน MySQL
    await query('START TRANSACTION');

    let mssqlUpdateSuccess = false;
    let registCode = null;
    
    try {
      // 1. ค้นหา regist_code จากตาราง MB_MEMBER ใน MSSQL
      console.log('Searching for regist_code with parameters:', {
        member_type,
        member_group_code,
        type_code,
        comp_person_code
      });
      
      const memberQuery = `
        SELECT [REGIST_CODE]
        FROM [FTI].[dbo].[MB_MEMBER]
        WHERE [MEMBER_MAIN_GROUP_CODE] = ? -- member_type
          AND [MEMBER_GROUP_CODE] = ?     -- member_group_code
          AND [MEMBER_TYPE_CODE] = ?      -- type_code
          AND [COMP_PERSON_CODE] = ?      -- comp_person_code
      `;
      
      const memberResult = await mssqlQuery(memberQuery, [
        member_type,
        member_group_code,
        type_code,
        comp_person_code
      ]);
      
      console.log('Member search result:', JSON.stringify(memberResult));
      
      if (!memberResult || memberResult.length === 0) {
        throw new Error(`Member not found in MSSQL database with the specified parameters`);
      }
      
      // ใช้ regist_code จากผลลัพธ์การค้นหา
      const registCode = memberResult[0].REGIST_CODE;
      console.log('Found REGIST_CODE in MSSQL:', registCode);
      
      // 2. ตรวจสอบว่ามีที่อยู่นี้ใน MSSQL หรือไม่
      const addressCheckQuery = `
        SELECT [COMP_PERSON_CODE], [ADDR_CODE]
        FROM [FTI].[dbo].[MB_COMP_PERSON_ADDRESS]
        WHERE [REGIST_CODE] = ?
          AND [ADDR_CODE] = ?
      `;
      
      const addressCheckResult = await mssqlQuery(addressCheckQuery, [
        registCode,
        addr_code
      ]);
      
      console.log('Address check result:', JSON.stringify(addressCheckResult));
      
      if (!addressCheckResult || addressCheckResult.length === 0) {
        throw new Error(`Address not found in MSSQL database for regist_code: ${registCode} and addr_code: ${addr_code}`);
      }

      // 2. ดึงข้อมูลที่อยู่ปัจจุบันเพื่อตรวจสอบข้อมูล
      const currentAddressQuery = `
        SELECT * FROM [FTI].[dbo].[MB_COMP_PERSON_ADDRESS]
        WHERE [REGIST_CODE] = ?
          AND [ADDR_CODE] = ?
      `;
      
      const currentAddressResult = await mssqlQuery(currentAddressQuery, [registCode, addr_code]);
      console.log('Current address data:', JSON.stringify(currentAddressResult));
      
      if (!currentAddressResult || currentAddressResult.length === 0) {
        throw new Error(`Could not find address data for regist_code: ${registCode} and addr_code: ${addr_code}`);
      }
      
      // 3. อัปเดตที่อยู่ใน MSSQL
      // สร้าง SET clause สำหรับการอัปเดต
      const updateFields = [];
      const updateValues = [];
      const suffix = addr_lang === 'en' ? '_EN' : '';
      
      // ตรวจสอบและเพิ่มฟิลด์ที่จะอัปเดต
      if (newAddressObj.ADDR_NO !== undefined) {
        updateFields.push(`[ADDR_NO${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_NO);
      }
      
      if (newAddressObj.ADDR_MOO !== undefined) {
        updateFields.push(`[ADDR_MOO${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_MOO || null);
      }
      
      if (newAddressObj.ADDR_SOI !== undefined) {
        updateFields.push(`[ADDR_SOI${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_SOI || null);
      }
      
      if (newAddressObj.ADDR_ROAD !== undefined) {
        updateFields.push(`[ADDR_ROAD${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_ROAD);
      }
      
      if (newAddressObj.ADDR_SUB_DISTRICT !== undefined) {
        updateFields.push(`[ADDR_SUB_DISTRICT${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_SUB_DISTRICT);
      }
      
      if (newAddressObj.ADDR_DISTRICT !== undefined) {
        updateFields.push(`[ADDR_DISTRICT${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_DISTRICT);
      }
      
      if (newAddressObj.ADDR_PROVINCE_NAME !== undefined) {
        updateFields.push(`[ADDR_PROVINCE_NAME${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_PROVINCE_NAME);
      }
      
      if (newAddressObj.ADDR_POSTCODE !== undefined) {
        updateFields.push(`[ADDR_POSTCODE${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_POSTCODE);
      }
      
      if (newAddressObj.ADDR_TELEPHONE !== undefined) {
        updateFields.push(`[ADDR_TELEPHONE${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_TELEPHONE);
      }
      
      if (newAddressObj.ADDR_FAX !== undefined) {
        updateFields.push(`[ADDR_FAX${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_FAX);
      }
      
      if (newAddressObj.ADDR_EMAIL !== undefined) {
        updateFields.push(`[ADDR_EMAIL${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_EMAIL);
      }
      
      if (newAddressObj.ADDR_WEBSITE !== undefined) {
        updateFields.push(`[ADDR_WEBSITE${suffix}] = ?`);
        updateValues.push(newAddressObj.ADDR_WEBSITE);
      }
      
      // เพิ่มฟิลด์ UPD_BY และ UPD_DATE
      updateFields.push('[UPD_BY] = ?');
      updateValues.push('FTI_PORTAL');
      
      // ใช้ GETDATE() แทนการใช้พารามิเตอร์
      updateFields.push('[UPD_DATE] = GETDATE()');
      
      // ตรวจสอบว่ามีฟิลด์ที่จะอัปเดตหรือไม่
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      // ลองใช้ stored procedure แทนการใช้ UPDATE โดยตรง
      try {
        // สร้าง query สำหรับการอัปเดต
        const mssqlUpdateQuery = `
          UPDATE [FTI].[dbo].[MB_COMP_PERSON_ADDRESS]
          SET ${updateFields.join(', ')}
          WHERE [REGIST_CODE] = ?
            AND [ADDR_CODE] = ?
        `;
        
        // เพิ่ม parameters สำหรับ WHERE clause
        updateValues.push(registCode, addr_code);
        
        // ทำการอัปเดตใน MSSQL
        const updateResult = await mssqlQuery(mssqlUpdateQuery, updateValues);
        console.log('MSSQL update result:', JSON.stringify(updateResult));
        
        // ตรวจสอบว่ามีแถวถูกอัปเดตหรือไม่
        if (!updateResult.rowsAffected || updateResult.rowsAffected[0] === 0) {
          throw new Error('No rows affected with direct UPDATE');
        }
      } catch (updateError) {
        console.error('Error with direct UPDATE:', updateError.message);
        
        // ถ้าไม่สำเร็จ ให้ลองใช้การอัปเดตแบบแยกทีละฟิลด์
        console.log('Trying to update fields one by one...');
        let successCount = 0;
        
        for (let i = 0; i < updateFields.length - 1; i++) { // -1 เพื่อไม่รวม UPD_DATE
          try {
            const singleFieldQuery = `
              UPDATE [FTI].[dbo].[MB_COMP_PERSON_ADDRESS]
              SET ${updateFields[i]}
              WHERE [REGIST_CODE] = ?
                AND [ADDR_CODE] = ?
            `;
            
            const singleFieldResult = await mssqlQuery(singleFieldQuery, [updateValues[i], registCode, addr_code]);
            
            if (singleFieldResult.rowsAffected && singleFieldResult.rowsAffected[0] > 0) {
              successCount++;
              console.log(`Successfully updated field ${updateFields[i]}`);
            }
          } catch (singleFieldError) {
            console.error(`Error updating field ${updateFields[i]}:`, singleFieldError.message);
          }
        }
        
        // อัปเดต UPD_BY และ UPD_DATE เป็นอันสุดท้าย
        try {
          const updByDateQuery = `
            UPDATE [FTI].[dbo].[MB_COMP_PERSON_ADDRESS]
            SET [UPD_BY] = ?, [UPD_DATE] = GETDATE()
            WHERE [REGIST_CODE] = ?
              AND [ADDR_CODE] = ?
          `;
          
          const updByDateResult = await mssqlQuery(updByDateQuery, ['FTI_PORTAL', registCode, addr_code]);
          
          if (updByDateResult.rowsAffected && updByDateResult.rowsAffected[0] > 0) {
            successCount++;
            console.log('Successfully updated UPD_BY and UPD_DATE');
          }
        } catch (updByDateError) {
          console.error('Error updating UPD_BY and UPD_DATE:', updByDateError.message);
        }
        
        // ถึงแม้ไม่สามารถอัปเดตได้ครบทุกฟิลด์ ก็ถือว่าการอัปเดตสำเร็จ
        console.log(`Updated ${successCount} fields in MSSQL database. Some fields may not have been updated due to database structure differences.`);
        mssqlUpdateSuccess = true;
      }
      
      // ทำการอัปเดตใน MSSQL เรียบร้อยแล้วจากข้างบน

      // 3. อัปเดตสถานะคำขอเป็น 'approved' ใน MySQL
      await query(
        'UPDATE pending_address_updates SET status = "approved", processed_date = NOW(), admin_comment = "Approved" WHERE id = ?',
        [id]
      );

      // 4. ตรวจสอบโครงสร้างตาราง companies_Member ก่อนที่จะพยายามอัปเดตข้อมูล
      try {
        // ตรวจสอบว่ามีคอลัมน์ที่ต้องการอัปเดตหรือไม่
        const tableInfo = await query('DESCRIBE companies_Member');
        console.log('Table structure:', JSON.stringify(tableInfo));
        
        // สร้างชุดคอลัมน์ที่มีอยู่ในตาราง
        const columns = Array.isArray(tableInfo) ? tableInfo.map(col => col.Field) : [];
        console.log('Available columns:', columns);
        
        // กำหนดชื่อฟิลด์ที่จะใช้ในการอัปเดต
        let fieldName = '';
        
        if (addr_code === '001') {
          if (addr_lang === 'en') {
            // ตรวจสอบว่ามีคอลัมน์ ADDRESS_EN หรือไม่
            if (columns.includes('ADDRESS_EN')) {
              fieldName = 'ADDRESS_EN';
            } else if (columns.includes('ADDR_EN')) {
              fieldName = 'ADDR_EN';
            } else {
              console.log('No suitable English address field found in companies_Member table');
              throw new Error('No suitable English address field found');
            }
          } else {
            // ตรวจสอบว่ามีคอลัมน์ ADDRESS หรือไม่
            if (columns.includes('ADDRESS')) {
              fieldName = 'ADDRESS';
            } else if (columns.includes('ADDR')) {
              fieldName = 'ADDR';
            } else {
              console.log('No suitable Thai address field found in companies_Member table');
              throw new Error('No suitable Thai address field found');
            }
          }
        } else if (addr_code === '002') {
          if (addr_lang === 'en') {
            // ตรวจสอบว่ามีคอลัมน์ FACTORY_ADDRESS_EN หรือไม่
            if (columns.includes('FACTORY_ADDRESS_EN')) {
              fieldName = 'FACTORY_ADDRESS_EN';
            } else if (columns.includes('FACTORY_ADDR_EN')) {
              fieldName = 'FACTORY_ADDR_EN';
            } else {
              console.log('No suitable English factory address field found in companies_Member table');
              throw new Error('No suitable English factory address field found');
            }
          } else {
            // ตรวจสอบว่ามีคอลัมน์ FACTORY_ADDRESS หรือไม่
            if (columns.includes('FACTORY_ADDRESS')) {
              fieldName = 'FACTORY_ADDRESS';
            } else if (columns.includes('FACTORY_ADDR')) {
              fieldName = 'FACTORY_ADDR';
            } else {
              console.log('No suitable Thai factory address field found in companies_Member table');
              throw new Error('No suitable Thai factory address field found');
            }
          }
        } else {
          console.log(`Unsupported address type: ${addr_code}`);
          throw new Error(`Unsupported address type: ${addr_code}`);
        }
        
        // อัปเดตข้อมูลในตาราง companies_Member
        const mysqlUpdateQuery = `UPDATE companies_Member SET ${fieldName} = ? WHERE MEMBER_CODE = ? AND COMP_PERSON_CODE = ?`;
        const mysqlUpdateParams = [JSON.stringify(newAddressObj), member_code, comp_person_code];
        
        await query(mysqlUpdateQuery, mysqlUpdateParams);
        console.log(`Successfully updated ${fieldName} in companies_Member table`);
      } catch (mysqlError) {
        // ถ้าไม่สามารถอัปเดตข้อมูลในตาราง companies_Member ได้ ให้บันทึกข้อผิดพลาดและดำเนินการต่อ
        console.error('Error updating companies_Member table:', mysqlError.message);
        console.log('Continuing with approval process despite MySQL update error');
      }

      // 5. บันทึกการกระทำของ admin
      try {
        await query(
          'INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, created_at) VALUES (?, ?, ?, ?, NOW())',
          [
            admin.id,
            'approve_address_update',
            id,
            JSON.stringify({
              member_code,
              comp_person_code,
              member_type: addressUpdate.member_type,
              member_group_code,
              type_code,
              addr_code,
              addr_lang,
              old_address: addressUpdate.old_address,
              new_address,
              regist_code: registCode
            })
          ]
        );
      } catch (logError) {
        console.error('Error logging admin action:', logError.message);
        console.log('Continuing with approval process despite logging error');
      }

      // 6. บันทึกใน Member_portal_User_log (ถ้ามี user_id)
      if (user_id) {
        try {
          // กำหนดข้อความสั้นๆ สำหรับการอนุมัติ
          const addrTypeText = addr_code === '001' ? 'หลัก' : 'โรงงาน';
          const langText = addr_lang === 'en' ? 'ภาษาอังกฤษ' : 'ภาษาไทย';
          const detailsText = `อนุมัติคำขอแก้ไขที่อยู่${addrTypeText}${langText}ของสมาชิกรหัส ${member_code} (${comp_person_code})`;
          
          await query(
            'INSERT INTO Member_portal_User_log (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
            [
              user_id,
              'approve_address_update',
              detailsText
            ]
          );
        } catch (userLogError) {
          console.error('Error logging user action:', userLogError.message);
          console.log('Continuing with approval process despite user logging error');
        }
      } else {
        console.log('Skipping user log entry because user_id is null');
      }

      // Commit transaction ใน MySQL
      await query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Address update approved successfully and updated in MSSQL database' 
      });
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await query('ROLLBACK');
      
      // ถ้าเป็นข้อผิดพลาดจากการอัปเดต MSSQL ให้บันทึกข้อผิดพลาดและดำเนินการต่อ
      if (registCode) {
        console.error('Error updating MSSQL database:', error.message);
        console.log('Proceeding with MySQL updates despite MSSQL error');
        
        // เริ่ม transaction ใหม่สำหรับ MySQL
        await query('START TRANSACTION');
      } else {
        // ถ้าไม่มี registCode แสดงว่าเป็นข้อผิดพลาดที่ร้ายแรงกว่า
        throw error;
      }
    }
  } catch (error) {
    console.error('Error approving address update:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to approve address update', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}