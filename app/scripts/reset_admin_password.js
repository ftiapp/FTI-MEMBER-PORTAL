"use server";

import bcrypt from "bcrypt";
import { query } from "../lib/db";

/**
 * สคริปต์สำหรับรีเซ็ตรหัสผ่าน Super Admin (admin_level 5)
 * รหัสผ่านใหม่จะถูกตั้งเป็น "FTIadmin2025!"
 */
export async function resetSuperAdminPassword() {
  try {
    // สร้าง hash จากรหัสผ่านใหม่
    const newPassword = "FTIadmin2025!";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // อัปเดตรหัสผ่านสำหรับ admin ที่มี admin_level = 5
    const result = await query("UPDATE admin_users SET password = ? WHERE admin_level = 5", [
      hashedPassword,
    ]);

    if (result.affectedRows > 0) {
      return {
        success: true,
        message: `รีเซ็ตรหัสผ่านสำเร็จ ${result.affectedRows} บัญชี`,
        newPassword: newPassword,
      };
    } else {
      return {
        success: false,
        message: "ไม่พบบัญชี Super Admin (admin_level 5)",
      };
    }
  } catch (error) {
    console.error("Error resetting Super Admin password:", error);
    return {
      success: false,
      message: `เกิดข้อผิดพลาด: ${error.message}`,
    };
  }
}
