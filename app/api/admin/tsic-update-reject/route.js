import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';
import { sendTsicRejectionEmail } from '@/app/lib/mailersend';

/**
 * API endpoint to reject a TSIC update request
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
    const { requestId, reason } = body;
    
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'ไม่พบรหัสคำขอ' }, { status: 400 });
    }
    
    if (!reason || reason.trim() === '') {
      return NextResponse.json({ success: false, message: 'กรุณาระบุเหตุผลในการปฏิเสธคำขอ' }, { status: 400 });
    }
    
    // ตรวจสอบว่าคำขอมีอยู่จริงและมีสถานะ pending
    const [requests] = await query(
      'SELECT * FROM pending_tsic_updates WHERE id = ? AND status = ?',
      [requestId, 'pending']
    );
    
    if (requests.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบคำขอหรือคำขอไม่ได้อยู่ในสถานะรอการอนุมัติ' },
        { status: 404 }
      );
    }
    
    // อัปเดตสถานะคำขอเป็น rejected
    await query(
      'UPDATE pending_tsic_updates SET status = ?, admin_id = ?, admin_comment = ?, processed_date = NOW() WHERE id = ?',
      ['rejected', admin.id, reason, requestId]
    );
    
    // ดึงข้อมูลผู้ใช้เพื่อส่งอีเมลแจ้งเตือน
    const [users] = await query(
      'SELECT u.email, u.firstname, u.lastname FROM users u WHERE u.id = ?',
      [requests[0].user_id]
    );
    
    // ดึงข้อมูลบริษัทจาก member_code
    const [companies] = await query(
      'SELECT COMPANY_NAME_TH FROM companies_Member WHERE MEMBER_CODE = ?',
      [requests[0].member_code]
    );
    
    // บันทึก log การปฏิเสธลงในตาราง admin_actions_log
    const companyName = companies && companies.length > 0 ? companies[0].COMPANY_NAME_TH : requests[0].member_code;
    const description = `ปฏิเสธคำขอแก้ไขรหัส TSIC ${requests[0].tsic_code} สำหรับสมาชิกรหัส ${requests[0].member_code} เนื่องจาก: ${reason}`;
    
    // ดึงข้อมูล IP และ User Agent จาก headers
    const headers = req.headers;
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = headers.get('user-agent') || '';
    
    await query(
      'INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [
        admin.id, 
        'reject_tsic_update', 
        requestId, 
        `ปฏิเสธคำขอแก้ไขรหัส TSIC ${requests[0].tsic_code} สำหรับสมาชิกรหัส ${requests[0].member_code} เนื่องจาก: ${reason}`,
        ip, 
        userAgent
      ]
    );
    
    // ส่งอีเมลแจ้งเตือนการปฏิเสธ
    try {
      if (users && users.length > 0) {
        const user = users[0];
        const companyName = companies && companies.length > 0 ? companies[0].COMPANY_NAME_TH : requests[0].member_code;
        
        try {
          console.log('Sending TSIC rejection email to:', user.email);
          
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
          
          await sendTsicRejectionEmail(
            user.email,
            user.firstname || '',
            user.lastname || '',
            requests[0].member_code,
            companyName,
            tsicDetailsText,
            reason || 'ไม่มีเหตุผลระบุ'
          );
          
          console.log(`Successfully sent TSIC rejection email to ${user.email}`);
        } catch (emailError) {
          console.error('Error sending TSIC rejection email:', emailError);
          // Don't fail the request if email sending fails
        }
      }
    } catch (emailError) {
      console.error('Error sending TSIC rejection email:', emailError);
      // การปฏิเสธสำเร็จแล้ว แม้การส่งอีเมลจะล้มเหลว
    }
    
    return NextResponse.json({
      success: true,
      message: 'ปฏิเสธคำขอแก้ไข TSIC เรียบร้อยแล้ว'
    });
    
  } catch (error) {
    console.error('Error rejecting TSIC update request:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไข TSIC' },
      { status: 500 }
    );
  }
}
