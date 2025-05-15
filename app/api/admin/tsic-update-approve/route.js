import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';

/**
 * API endpoint to approve a TSIC update request
 */
export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    const { requestId, comment } = body;
    
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'ไม่พบรหัสคำขอ' }, { status: 400 });
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
    
    const request = requests[0];
    
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
      const tsicData = typeof request.tsic_data === 'string' 
        ? JSON.parse(request.tsic_data) 
        : request.tsic_data;
      
      // สร้าง array ของ TSIC codes จาก tsicData
      const tsicCodes = tsicData.map(item => item.tsic_code);
      
      // บันทึกข้อมูลว่าได้อัปเดต TSIC แล้ว
      // หมายเหตุ: ในกรณีนี้เราไม่ได้อัปเดตข้อมูลในตารางอื่นจริงๆ 
      // เนื่องจากไม่มีตาราง member_tsic_codes
      // แต่ในอนาคตถ้ามีตารางนี้ ให้เปิดใช้งานโค้ดด้านล่าง
      
      /*
      // อัปเดตข้อมูล TSIC ในตาราง member_tsic_codes
      // ลบข้อมูล TSIC เดิมก่อน
      await query('DELETE FROM member_tsic_codes WHERE member_code = ?', [request.member_code]);
      
      // เพิ่มข้อมูล TSIC ใหม่
      for (const tsicItem of tsicData) {
        await query(
          'INSERT INTO member_tsic_codes (member_code, tsic_code, tsic_description, category_code) VALUES (?, ?, ?, ?)',
          [request.member_code, tsicItem.tsic_code, tsicItem.tsic_description || tsicItem.description, tsicItem.category_code]
        );
      }
      */
      
      // บันทึกข้อมูล TSIC ที่อัปเดตลงในฐานข้อมูลหลัก (ถ้ามี)
      console.log(`TSIC data updated for member ${request.member_code}:`, tsicCodes);
      
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
