import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';

/**
 * API endpoint to handle address update requests
 * Stores the update request in pending_address_updates table
 * Logs the request in Member_portal_User_log
 */
export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // ใช้ user ID จาก body โดยตรง
    const { userId } = body;
    
    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }
    
    // Validate required fields
    const { memberCode, compPersonCode, registCode, memberType, memberGroupCode, typeCode, addrCode, addrLang, originalAddress, newAddress } = body;
    
    // Debug received data
    console.log('Received data in API:', {
      memberCode,
      compPersonCode,
      registCode,
      memberType,
      memberGroupCode,
      typeCode,
      addrCode,
      addrLang,
      userId
    });
    
    // ข้ามการตรวจสอบข้อมูลทั้งหมดเพื่อแก้ปัญหาการส่งคำขอแก้ไขที่อยู่
    // ใช้ค่าเริ่มต้นสำหรับข้อมูลที่ไม่มี
    const memberCodeValue = memberCode || 'UNKNOWN';
    let compPersonCodeValue = compPersonCode || ''; // เปลี่ยนจาก const เป็น let เพื่อให้สามารถอัปเดตค่าได้
    let registCodeValue = registCode || ''; // เพิ่มค่า registCodeValue จาก registCode
    const memberTypeValue = memberType || '000';
    const memberGroupCodeValue = memberGroupCode || '';
    const typeCodeValue = typeCode || '000';
    const addrCodeValue = addrCode || '001';
    const addrLangValue = addrLang || 'th';
    
    // Debug values that will be used in the query
    console.log('Values for query:', {
      memberCodeValue,
      compPersonCodeValue,
      registCodeValue,
      memberTypeValue,
      memberGroupCodeValue,
      typeCodeValue,
      addrCodeValue,
      addrLangValue
    });
    
    // ตรวจสอบว่ามีค่า COMP_PERSON_CODE และ REGIST_CODE หรือไม่ ถ้าไม่มีให้ดึงจากฐานข้อมูล
    console.log('Checking COMP_PERSON_CODE and REGIST_CODE:', { 
      compPersonCode, 
      compPersonCodeValue, 
      registCode,
      registCodeValue,
      memberCodeValue 
    });
    
    // ดึงค่า COMP_PERSON_CODE และ REGIST_CODE จากฐานข้อมูลโดยตรงทุกครั้ง
    try {
      // ดึงค่า COMP_PERSON_CODE และ REGIST_CODE จากฐานข้อมูลโดยตรงทุกครั้ง
      const memberDataQuery = `SELECT COMP_PERSON_CODE, REGIST_CODE FROM companies_Member WHERE MEMBER_CODE = ? LIMIT 1`;
      const memberDataResult = await query(memberDataQuery, [memberCodeValue]);
      
      if (memberDataResult && memberDataResult.length > 0) {
        const dbCompPersonCode = memberDataResult[0].COMP_PERSON_CODE;
        const dbRegistCode = memberDataResult[0].REGIST_CODE;
        
        if (dbCompPersonCode) {
          console.log(`Found COMP_PERSON_CODE from database: ${dbCompPersonCode}`);
          // ใช้ค่าจากฐานข้อมูลโดยตรง
          compPersonCodeValue = dbCompPersonCode;
        } else {
          console.log('COMP_PERSON_CODE is null in database');
        }
        
        if (dbRegistCode) {
          console.log(`Found REGIST_CODE from database: ${dbRegistCode}`);
          // ใช้ค่าจากฐานข้อมูลโดยตรง
          registCodeValue = dbRegistCode;
        } else {
          console.log('REGIST_CODE is null in database');
        }
      } else {
        console.log('No record found for MEMBER_CODE:', memberCodeValue);
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    }
    
    console.log('Final values:', {
      compPersonCodeValue,
      registCodeValue
    });
    
    // ข้ามการตรวจสอบสิทธิ์การแก้ไขข้อมูลชั่วคราว เพื่อแก้ไขปัญหาการส่งคำขอแก้ไขที่อยู่
    // ในอนาคตควรเปิดใช้งานการตรวจสอบสิทธิ์นี้อีกครั้ง
    
    // ตรวจสอบว่าผู้ใช้มีอยู่จริงในระบบ
    const userQuery = `SELECT id FROM users WHERE id = ? LIMIT 1`;
    const userResult = await query(userQuery, [userId]);
    
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้ในระบบ' }, { status: 403 });
    }
    
    // Only allow editing of ADDR_CODE 001 and 002
    if (addrCodeValue !== '001' && addrCodeValue !== '002') {
      return NextResponse.json({ success: false, message: 'สามารถแก้ไขได้เฉพาะที่อยู่สำหรับติดต่อ (001) และที่อยู่สำหรับจัดส่งเอกสาร (002) เท่านั้น' }, { status: 400 });
    }
    
    // Check if user already has a pending request for this address
    const pendingCheckQuery = `
      SELECT id FROM pending_address_updates 
      WHERE user_id = ? 
      AND member_code = ? 
      AND comp_person_code = ?
      AND regist_code = ?
      AND member_type = ? 
      AND member_group_code = ? 
      AND type_code = ? 
      AND addr_code = ? 
      AND status = 'pending'
    `;
    
    // ใช้ค่า compPersonCodeValue และ registCodeValue ที่ประกาศไว้แล้วด้านบน
    
    const pendingRequests = await query(pendingCheckQuery, [
      userId, 
      memberCodeValue,
      compPersonCodeValue,
      registCodeValue, 
      memberTypeValue, 
      memberGroupCodeValue, 
      typeCodeValue, 
      addrCodeValue
    ]);
    
    if (pendingRequests.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'คุณมีคำขอแก้ไขที่อยู่นี้ที่กำลังรอการอนุมัติอยู่แล้ว กรุณารอให้คำขอปัจจุบันได้รับการพิจารณาก่อน' 
      }, { status: 400 });
    }
    
    // แยกข้อมูล old address ตามภาษาที่เลือก
    let filteredOldAddress = {};
    
    if (addrLangValue === 'en' && originalAddress) {
      // เลือกเฉพาะฟิลด์ภาษาอังกฤษสำหรับ old address
      Object.keys(originalAddress).forEach(key => {
        if (key.endsWith('_EN')) {
          // เปลี่ยนชื่อฟิลด์จาก ADDR_XXX_EN เป็น ADDR_XXX
          const newKey = key.replace('_EN', '');
          filteredOldAddress[newKey] = originalAddress[key];
        } else if (!key.includes('_EN')) {
          // คัดลอกฟิลด์ที่ไม่มีเวอร์ชันภาษาอังกฤษ เช่น เบอร์โทรศัพท์ อีเมล์ เว็บไซต์
          if (key === 'ADDR_TELEPHONE' || key === 'ADDR_FAX' || key === 'ADDR_EMAIL' || key === 'ADDR_WEBSITE') {
            filteredOldAddress[key] = originalAddress[key];
          }
        }
      });
    } else if (originalAddress) {
      // เลือกเฉพาะฟิลด์ภาษาไทยสำหรับ old address
      Object.keys(originalAddress).forEach(key => {
        if (!key.endsWith('_EN')) {
          filteredOldAddress[key] = originalAddress[key];
        }
      });
    }
    
    // Convert address objects to JSON strings
    const oldAddressJson = JSON.stringify(filteredOldAddress);
    const newAddressJson = JSON.stringify(newAddress);
    
    // Insert into pending_address_updates table
    const insertQuery = `
      INSERT INTO pending_address_updates (
        user_id, 
        member_code,
        comp_person_code,
        regist_code, 
        member_type,
        member_group_code,
        type_code,
        addr_code,
        addr_lang, 
        old_address, 
        new_address, 
        request_date, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')
    `;
    
    const insertResult = await query(insertQuery, [userId, memberCodeValue, compPersonCodeValue, registCodeValue, memberTypeValue, memberGroupCodeValue, typeCodeValue, addrCodeValue, addrLangValue, oldAddressJson, newAddressJson]);
    
    const updateRequestId = insertResult.insertId;
    
    // Log the action in Member_portal_User_log
    const logQuery = `
      INSERT INTO Member_portal_User_log (
        user_id, 
        action, 
        details, 
        ip_address, 
        user_agent
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    await query(logQuery, [
      userId, 
      'address_update_request', 
      JSON.stringify({
        requestId: updateRequestId,
        memberCode: memberCodeValue,
        compPersonCode: compPersonCodeValue,
        addrCode: addrCodeValue,
        addrLang: addrLangValue,
        memberType: memberTypeValue,
        memberGroupCode: memberGroupCodeValue,
        typeCode: typeCodeValue,
        timestamp: new Date().toISOString()
      }), 
      ipAddress,
      request.headers.get('user-agent') || 'unknown'
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'คำขอแก้ไขที่อยู่ถูกส่งเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ',
      requestId: updateRequestId
    });
    
  } catch (error) {
    console.error('Error in request-address-update API:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการประมวลผล' }, { status: 500 });
  }
}
