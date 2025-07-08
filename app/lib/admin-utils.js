'use server';

import { query } from './db';

/**
 * ตรวจสอบสิทธิ์ของแอดมินว่ามีสิทธิ์ในการทำงานที่ต้องการหรือไม่
 * 
 * @param {number} adminId - ID ของแอดมิน
 * @param {string} permission - สิทธิ์ที่ต้องการตรวจสอบ (เช่น 'view_ic_membership', 'approve_ic_membership')
 * @returns {Promise<boolean>} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
export async function verifyAdminPermission(adminId, permission) {
  try {
    // ดึงข้อมูลแอดมินจากฐานข้อมูล
    const admins = await query(
      'SELECT * FROM admin_users WHERE id = ? AND is_active = TRUE LIMIT 1',
      [adminId]
    );

    if (admins.length === 0) {
      return false;
    }

    const admin = admins[0];
    
    // ตรวจสอบว่าเป็น Super Admin หรือไม่ (มีสิทธิ์ทั้งหมด)
    if (admin.admin_level === 'super_admin') {
      return true;
    }

    // ตรวจสอบสิทธิ์ตามประเภทการทำงาน
    switch (permission) {
      case 'view_ic_membership':
        // แอดมินทั่วไปสามารถดูข้อมูลการสมัครสมาชิก IC ได้
        return admin.admin_level === 'admin';
      
      case 'approve_ic_membership':
        // แอดมินทั่วไปสามารถอนุมัติ/ปฏิเสธการสมัครสมาชิก IC ได้
        return admin.admin_level === 'admin' && admin.can_update === 1;
      
      case 'edit_ic_membership':
        // แอดมินทั่วไปที่มีสิทธิ์แก้ไขสามารถแก้ไขข้อมูลการสมัครสมาชิก IC ได้
        return admin.admin_level === 'admin' && admin.can_update === 1;
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error verifying admin permission:', error);
    return false;
  }
}

/**
 * ตรวจสอบว่าแอดมินมีสิทธิ์ในการจัดการเมนูหรือไม่
 * 
 * @param {Object} admin - ข้อมูลแอดมิน
 * @param {string} menuPermission - สิทธิ์ที่ต้องการสำหรับเมนู
 * @returns {boolean} - true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
export function checkMenuPermission(admin, menuPermission) {
  if (!admin) return false;
  
  // Super Admin มีสิทธิ์ทั้งหมด
  if (admin.adminLevel === 'super_admin') {
    return true;
  }
  
  // ตรวจสอบสิทธิ์ตามประเภทเมนู
  switch (menuPermission) {
    case 'view_ic_membership':
      return admin.adminLevel === 'admin';
    
    case 'manage_users':
      return admin.adminLevel === 'admin' && admin.canUpdate === 1;
    
    default:
      return false;
  }
}
