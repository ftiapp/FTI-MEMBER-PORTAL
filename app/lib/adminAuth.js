"use server";

import bcrypt from "bcrypt";
import { query } from "./db";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// สร้าง secret key สำหรับ JWT
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-for-admin-auth",
);

// ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
export async function verifyAdminPassword(username, password) {
  try {
    const admins = await query(
      "SELECT * FROM FTI_Portal_Admin_Users WHERE username = ? AND is_active = TRUE LIMIT 1",
      [username],
    );

    if (admins.length === 0) {
      return { success: false, message: "ไม่พบชื่อผู้ใช้" };
    }

    const admin = admins[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
    }

    return {
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        adminLevel: admin.admin_level,
        canCreate: admin.can_create,
        canUpdate: admin.can_update,
      },
    };
  } catch (error) {
    console.error("Error verifying admin password:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบ" };
  }
}

// ฟังก์ชันสำหรับสร้าง JWT token
export async function createAdminSession(admin) {
  try {
    const token = await new SignJWT({
      id: admin.id,
      username: admin.username,
      adminLevel: admin.adminLevel,
      canCreate: admin.canCreate,
      canUpdate: admin.canUpdate,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secretKey);

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating admin session:", error);
    return { success: false, message: "ไม่สามารถสร้าง session ได้" };
  }
}

// ฟังก์ชันสำหรับตรวจสอบ JWT token
export async function getAdminFromSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, secretKey);
    return verified.payload;
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return null;
  }
}

// ฟังก์ชันสำหรับบันทึกการกระทำของ admin
export async function logAdminAction(
  adminId,
  actionType,
  targetId,
  description,
  req,
  userId = null,
) {
  try {
    // ตรวจสอบว่า description เป็น object หรือไม่
    let descriptionStr = description;

    // ถ้าเป็น object ให้เพิ่ม userId เข้าไป
    if (typeof description === "object") {
      // ถ้ามี userId ที่ส่งมาให้เพิ่มเข้าไปใน description
      if (userId) {
        description.userId = userId;
      }
      descriptionStr = JSON.stringify(description);
    } else if (userId) {
      // ถ้า description ไม่ใช่ object แต่มี userId ให้สร้าง object ใหม่
      descriptionStr = JSON.stringify({
        originalDescription: description,
        userId: userId,
      });
    }

    await query(
      `INSERT INTO FTI_Portal_Admin_Actions_Logs 
       (admin_id, action_type, target_id, description, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        actionType,
        targetId,
        descriptionStr,
        req.headers.get("x-forwarded-for") || req.ip || "",
        req.headers.get("user-agent") || "",
      ],
    );
    return { success: true };
  } catch (error) {
    console.error("Error logging admin action:", error);
    return { success: false };
  }
}

// ฟังก์ชันสำหรับออกจากระบบ
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return { success: true };
}
