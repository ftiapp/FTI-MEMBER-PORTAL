import { query } from '@/app/lib/db';

/**
 * สร้างการแจ้งเตือนใหม่
 * @param {Object|number} params - Object ที่มีข้อมูลการแจ้งเตือนหรือ userId
 * @param {number} params.user_id - ID ของผู้ใช้ (เมื่อใช้แบบ Object)
 * @param {string} params.message - ข้อความแจ้งเตือน (เมื่อใช้แบบ Object)
 * @param {string} params.type - ประเภทการแจ้งเตือน (เมื่อใช้แบบ Object)
 * @param {string} params.link - ลิงก์ที่จะนำไปเมื่อคลิกที่การแจ้งเตือน (เมื่อใช้แบบ Object, optional)
 * @param {string} params.status - สถานะการแจ้งเตือน (เมื่อใช้แบบ Object, optional)
 * @param {string} params.member_code - รหัสสมาชิก (เมื่อใช้แบบ Object, optional)
 * @param {string} params.member_type - รหัสประเภทสมาชิก (เมื่อใช้แบบ Object, optional)
 * @param {string} params.member_group_code - รหัสกลุ่มสมาชิก (เมื่อใช้แบบ Object, optional)
 * @param {string} params.type_code - รหัสประเภท (เมื่อใช้แบบ Object, optional)
 * @param {string} params.addr_code - รหัสที่อยู่ (เมื่อใช้แบบ Object, optional)
 * @param {string} params.addr_lang - ภาษาของที่อยู่ (เมื่อใช้แบบ Object, optional)
 * @param {string} type - ประเภทการแจ้งเตือน (เมื่อใช้แบบเก่า)
 * @param {string} message - ข้อความแจ้งเตือน (เมื่อใช้แบบเก่า)
 * @param {string} link - ลิงก์ที่จะนำไปเมื่อคลิกที่การแจ้งเตือน (เมื่อใช้แบบเก่า, optional)
 * @param {string} memberCode - รหัสสมาชิก (เมื่อใช้แบบเก่า, optional)
 * @param {string} companyName - ชื่อบริษัท (เมื่อใช้แบบเก่า, optional)
 * @param {string} memberType - รหัสประเภทสมาชิก (เมื่อใช้แบบเก่า, optional)
 * @param {string} memberGroupCode - รหัสกลุ่มสมาชิก (เมื่อใช้แบบเก่า, optional)
 * @param {string} typeCode - รหัสประเภท (เมื่อใช้แบบเก่า, optional)
 * @param {string} addrCode - รหัสที่อยู่ (เมื่อใช้แบบเก่า, optional)
 * @param {string} addrLang - ภาษาของที่อยู่ (เมื่อใช้แบบเก่า, optional)
 */
export async function createNotification(params, type, message, link = null, memberCode = null, companyName = null, memberType = null, memberGroupCode = null, typeCode = null, addrCode = null, addrLang = null) {
  try {
    let userIdNum, notificationType, notificationMessage, notificationLink, notificationStatus;
    let notificationMemberCode, notificationMemberType, notificationMemberGroupCode, notificationTypeCode;
    let notificationAddrCode, notificationAddrLang;
    
    // ตรวจสอบว่าเป็นการเรียกใช้แบบใหม่ (Object) หรือแบบเก่า
    if (typeof params === 'object' && params !== null) {
      // แบบใหม่ (Object)
      console.log('Creating notification with object params:', params);
      
      userIdNum = parseInt(params.user_id);
      notificationType = params.type;
      notificationMessage = params.message;
      notificationLink = params.link || null;
      notificationStatus = params.status || null;
      notificationMemberCode = params.member_code || null;
      notificationMemberType = params.member_type || null;
      notificationMemberGroupCode = params.member_group_code || null;
      notificationTypeCode = params.type_code || null;
      notificationAddrCode = params.addr_code || null;
      notificationAddrLang = params.addr_lang || null;
      
      // ถ้าไม่มี status แต่มี message ให้ตรวจสอบสถานะจากข้อความ
      if (!notificationStatus && notificationMessage) {
        if (notificationMessage.includes('ได้รับการอนุมัติแล้ว')) {
          notificationStatus = 'approved';
        } else if (notificationMessage.includes('ถูกปฏิเสธ')) {
          notificationStatus = 'rejected';
        }
      }
    } else {
      // แบบเก่า (พารามิเตอร์แยก)
      console.log('Creating notification with individual params:', { userId: params, type, message, link, memberCode, companyName });
      
      // ตรวจสอบว่า userId เป็นตัวเลขหรือไม่
      if (!params || isNaN(parseInt(params))) {
        console.error('Invalid userId:', params);
        return false;
      }
      
      userIdNum = parseInt(params);
      notificationType = type;
      notificationMessage = message;
      notificationLink = link;
      
      // ตรวจสอบสถานะจากข้อความ
      notificationStatus = null;
      if (message && message.includes('ได้รับการอนุมัติแล้ว')) {
        notificationStatus = 'approved';
      } else if (message && message.includes('ถูกปฏิเสธ')) {
        notificationStatus = 'rejected';
      }
      
      notificationMemberCode = memberCode;
      notificationMemberType = memberType;
      notificationMemberGroupCode = memberGroupCode;
      notificationTypeCode = typeCode;
      notificationAddrCode = addrCode;
      notificationAddrLang = addrLang;
    }
    
    // ตรวจสอบว่า userId ถูกต้องหรือไม่
    if (isNaN(userIdNum)) {
      console.error('Invalid userId after parsing:', userIdNum);
      return false;
    }
    
    // สร้างการแจ้งเตือนใหม่
    const result = await query(
      `INSERT INTO notifications (user_id, type, message, link, status, member_code, member_type, member_group_code, type_code, addr_code, addr_lang, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userIdNum, notificationType, notificationMessage, notificationLink, notificationStatus, notificationMemberCode, notificationMemberType, notificationMemberGroupCode, notificationTypeCode, notificationAddrCode, notificationAddrLang]
    );
    
    console.log('Notification created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}
