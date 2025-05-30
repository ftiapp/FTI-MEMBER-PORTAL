import { query } from '@/app/lib/db';

/**
 * สร้างการแจ้งเตือนใหม่
 * @param {number} userId - ID ของผู้ใช้
 * @param {string} type - ประเภทการแจ้งเตือน (member_verification, contact_reply, address_update, profile_update)
 * @param {string} message - ข้อความแจ้งเตือน
 * @param {string} link - ลิงก์ที่จะนำไปเมื่อคลิกที่การแจ้งเตือน (optional)
 * @param {string} memberCode - รหัสสมาชิก (optional)
 * @param {string} companyName - ชื่อบริษัท (optional)
 * @param {string} status - สถานะการแจ้งเตือน (approved, rejected, null) (optional)
 */
export async function createNotification(userId, type, message, link = null, memberCode = null, companyName = null) {
  try {
    console.log('Creating notification with params:', { userId, type, message, link, memberCode, companyName });
    
    // ตรวจสอบว่า userId เป็นตัวเลขหรือไม่
    if (!userId || isNaN(parseInt(userId))) {
      console.error('Invalid userId:', userId);
      return false;
    }
    
    // แปลง userId เป็นตัวเลข
    const userIdNum = parseInt(userId);
    
    // ตรวจสอบสถานะจากข้อความ
    let status = null;
    if (message.includes('ได้รับการอนุมัติแล้ว')) {
      status = 'approved';
    } else if (message.includes('ถูกปฏิเสธ')) {
      status = 'rejected';
    }
    
    // สร้างการแจ้งเตือนใหม่
    const result = await query(
      `INSERT INTO notifications (user_id, type, message, link, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userIdNum, type, message, link, status]
    );
    
    console.log('Notification created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}
