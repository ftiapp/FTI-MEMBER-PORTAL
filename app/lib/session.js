'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { query } from './db';

// สร้าง secret key สำหรับ JWT
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-for-user-auth');
const adminSecretKey = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'your-secret-key-for-admin-auth');

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก session
export async function getSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token');
    
    if (!token) {
      return null;
    }
    
    // ตรวจสอบ token
    const { payload } = await jwtVerify(token.value, secretKey);
    
    if (!payload || !payload.id) {
      return null;
    }
    
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const users = await query(
      'SELECT id, email, name FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return { user: users[0] };
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// ฟังก์ชันสำหรับสร้าง session
export async function createSession(user) {
  // ในอนาคตอาจจะเพิ่มการสร้าง JWT token และบันทึกลงใน cookie
  return user;
}

// ฟังก์ชันสำหรับลบ session
export async function destroySession() {
  // ในอนาคตอาจจะเพิ่มการลบ cookie
  return true;
}

// ฟังก์ชันสำหรับดึงข้อมูล admin จาก session
export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    
    if (!token) {
      return null;
    }
    
    // ตรวจสอบ token
    const { payload } = await jwtVerify(token.value, adminSecretKey);
    
    if (!payload || !payload.id) {
      return null;
    }
    
    // ดึงข้อมูล admin จากฐานข้อมูล
    const admins = await query(
      'SELECT id, username, admin_level as level, can_create, can_update FROM admin_users WHERE id = ? AND is_active = 1 LIMIT 1',
      [payload.id]
    );
    
    if (admins.length === 0) {
      return null;
    }
    
    return { admin: admins[0] };
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}
