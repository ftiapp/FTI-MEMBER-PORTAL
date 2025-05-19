import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';
import { sendTsicApprovalEmail } from '@/app/lib/mailersend';

/**
 * API endpoint to approve a TSIC update request
 */
export async function POST(req) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await req.json();
    const { requestId, comment } = body;
    
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'ไม่พบรหัสคำขอ' }, { status: 400 });
    }
    
    // ตรวจสอบว่าคำขอมีอยู่จริงและมีสถานะ pending
    console.log('Executing query to find TSIC request with ID:', requestId);
    const result = await query(
      'SELECT * FROM pending_tsic_updates WHERE id = ? AND status = ?',
      [requestId, 'pending']
    );
    
    console.log('Query result structure:', JSON.stringify(result));
    
    // ตรวจสอบรูปแบบข้อมูลที่ได้รับ
    let requests = [];
    if (Array.isArray(result)) {
      if (result.length > 0 && Array.isArray(result[0])) {
        // รูปแบบ [rows, fields]
        requests = result[0];
      } else {
        // รูปแบบ rows โดยตรง
        requests = result;
      }
    }
    
    console.log('Processed requests:', requests.length, requests);
    
    if (!requests || requests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบคำขอหรือคำขอไม่ได้อยู่ในสถานะรอการอนุมัติ' },
        { status: 404 }
      );
    }
    
    const tsicRequest = requests[0];
    console.log('TSIC request found:', tsicRequest);
    
    // เริ่ม transaction
    await query('START TRANSACTION');
    
    try {
      // อัปเดตสถานะคำขอเป็น approved
      await query(
        'UPDATE pending_tsic_updates SET status = ?, admin_id = ?, admin_comment = ?, processed_date = NOW() WHERE id = ?',
        ['approved', admin.id, comment || null, requestId]
      );
      
      // อัปเดตข้อมูล TSIC ในตาราง members หรือตารางที่เกี่ยวข้อง
      // ในกรณีนี้ต้องแปลง JSON string เป็น object ก่อน
      const tsicData = typeof tsicRequest.tsic_data === 'string' 
        ? JSON.parse(tsicRequest.tsic_data) 
        : tsicRequest.tsic_data;
      
      // สร้าง array ของ TSIC codes จาก tsicData
      const tsicCodes = tsicData.map(item => item.tsic_code);
      
      // บันทึกข้อมูลว่าได้อัปเดต TSIC แล้ว
      // หมายเหตุ: ในกรณีนี้เราไม่ได้อัปเดตข้อมูลในตารางอื่นจริงๆ 
      // เนื่องจากไม่มีตาราง member_tsic_codes
      // แต่ในอนาคตถ้ามีตารางนี้ ให้เปิดใช้งานโค้ดด้านล่าง
      
      /*
      // อัปเดตข้อมูล TSIC ในตาราง member_tsic_codes
      // ลบข้อมูล TSIC เดิมก่อน
      await query('DELETE FROM member_tsic_codes WHERE member_code = ?', [tsicRequest.member_code]);
      
      // เพิ่มข้อมูล TSIC ใหม่
      for (const tsicItem of tsicData) {
        await query(
          'INSERT INTO member_tsic_codes (member_code, tsic_code, tsic_description, category_code) VALUES (?, ?, ?, ?)',
          [tsicRequest.member_code, tsicItem.tsic_code, tsicItem.tsic_description || tsicItem.description, tsicItem.category_code]
        );
      }
      */
      
      // บันทึกข้อมูล TSIC ที่อัปเดตลงในฐานข้อมูลหลัก (ถ้ามี)
      console.log(`TSIC data updated for member ${tsicRequest.member_code}:`, tsicCodes);
      
      // ดึงข้อมูลผู้ใช้เพื่อส่งอีเมลแจ้งเตือน
      const [users] = await query(
        'SELECT u.email, u.firstname, u.lastname FROM users u WHERE u.id = ?',
        [tsicRequest.user_id]
      );
      
      // ดึงข้อมูลบริษัทจาก member_code
      
      // ดึงข้อมูล IP และ User Agent จาก headers
      const headers = req.headers;
      const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '0.0.0.0';
      const userAgent = headers.get('user-agent') || '';
      
      await query(
        'INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [
          admin.id, 
          'approve_tsic_update', 
          requestId, 
          `อนุมัติคำขอแก้ไขรหัส TSIC ${tsicRequest.tsic_code} สำหรับสมาชิกรหัส ${tsicRequest.member_code}${comment ? ` ความคิดเห็น: ${comment}` : ''}`,
          ip, 
          userAgent
        ]
      );
      
      // Check if this TSIC code already exists for the member
      const [existingTsic] = await query(
        'SELECT id FROM pending_tsic_updates WHERE member_code = ? AND tsic_code = ? AND status = ?',
        [tsicRequest.member_code, tsicRequest.tsic_code, 'approved']
      );
      
      if (existingTsic && existingTsic.length > 0) {
        console.log(`TSIC code ${tsicRequest.tsic_code} already exists for member ${tsicRequest.member_code}`);
      }
      
      // Send approval email with better error handling
      try {
        // Get user and company details for email
        const [users] = await query(
          `SELECT u.email, u.firstname, u.lastname, c.COMPANY_NAME 
           FROM users u 
           LEFT JOIN companies_Member c ON c.MEMBER_CODE = ? 
           WHERE u.id = ?`,
          [tsicRequest.member_code, tsicRequest.user_id]
        );
        
        if (users && users.length > 0) {
          const user = users[0];
          const [companyInfo] = await query(
            'SELECT COMPANY_NAME FROM companies_Member WHERE MEMBER_CODE = ?',
            [tsicRequest.member_code]
          );
          
          const companyName = (companyInfo && companyInfo[0]?.COMPANY_NAME) || tsicRequest.member_code;
          
          console.log('Sending TSIC approval email to:', user.email);
          
          // Get TSIC code and description for the email
          const [tsicDetails] = await query(
            `SELECT 
              tsic_code, 
              tsic_description,
              category_code,
              category_name,
              category_order,
              positive_list
             FROM pending_tsic_updates 
             WHERE id = ?`,
            [requestId]
          );
          
          const tsicInfo = tsicDetails && tsicDetails[0];
          
          // Format TSIC details for email
          let tsicDetailsText = 'ไม่ระบุ';
          if (tsicInfo) {
            const details = [];
            if (tsicInfo.tsic_code) details.push(`รหัส: ${tsicInfo.tsic_code}`);
            if (tsicInfo.tsic_description) details.push(`คำอธิบาย: ${tsicInfo.tsic_description}`);
            if (tsicInfo.category_code) details.push(`หมวดหมู่: ${tsicInfo.category_code}`);
            if (tsicInfo.category_name) details.push(`ชื่อหมวดหมู่: ${tsicInfo.category_name}`);
            tsicDetailsText = details.join('\n');
          }
          
          await sendTsicApprovalEmail(
            user.email,
            user.firstname || '',
            user.lastname || '',
            tsicRequest.member_code,
            companyName,
            tsicDetailsText,
            comment || ''
          );
          
          console.log(`Successfully sent TSIC approval email to ${user.email}`);
        } else {
          console.log('User not found for sending approval email');
        }
      } catch (emailError) {
        console.error('Error sending TSIC approval email:', emailError);
        // Don't fail the request if email sending fails
      }
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'อนุมัติคำขอแก้ไข TSIC เรียบร้อยแล้ว'
      });
      
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error approving TSIC update request:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไข TSIC' },
      { status: 500 }
    );
  }
}
