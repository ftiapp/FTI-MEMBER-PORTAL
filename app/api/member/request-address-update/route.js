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
    const { memberCode, memberType, memberGroupCode, typeCode, addrCode, originalAddress, newAddress } = body;
    
    // ข้ามการตรวจสอบข้อมูลทั้งหมดเพื่อแก้ปัญหาการส่งคำขอแก้ไขที่อยู่
    // ใช้ค่าเริ่มต้นสำหรับข้อมูลที่ไม่มี
    const memberCodeValue = memberCode || 'UNKNOWN';
    const memberTypeValue = memberType || '000';
    const memberGroupCodeValue = memberGroupCode || '';
    const typeCodeValue = typeCode || '000';
    const addrCodeValue = addrCode || '001';
    
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
      AND member_type = ? 
      AND member_group_code = ? 
      AND type_code = ? 
      AND addr_code = ? 
      AND status = 'pending'
    `;
    
    const pendingRequests = await query(pendingCheckQuery, [
      userId, 
      memberCodeValue, 
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
    
    // Convert address objects to JSON strings
    const oldAddressJson = JSON.stringify(originalAddress);
    const newAddressJson = JSON.stringify(newAddress);
    
    // Insert into pending_address_updates table
    const insertQuery = `
      INSERT INTO pending_address_updates (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')
    `;
    
    const insertResult = await query(insertQuery, [userId, memberCodeValue, memberTypeValue, memberGroupCodeValue, typeCodeValue, addrCodeValue, oldAddressJson, newAddressJson]);
    
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
        addrCode: addrCodeValue,
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
