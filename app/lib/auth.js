import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { query } from './db';

// สร้าง secret key สำหรับ JWT
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-for-admin-auth');
const userSecretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

/**
 * ตรวจสอบ session ของ admin จาก cookie
 * @returns {Promise<Object|null>} ข้อมูล admin หรือ null ถ้าไม่มี session
 */
export async function checkAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, secretKey);
    const payload = verified.payload;
    
    // ตรวจสอบว่า admin ยังคงมีอยู่ในฐานข้อมูลและยังเป็น active อยู่
    const admins = await query(
      'SELECT * FROM admin_users WHERE id = ? AND is_active = TRUE LIMIT 1',
      [payload.id]
    );

    if (admins.length === 0) {
      return null;
    }

    return {
      id: payload.id,
      username: payload.username,
      adminLevel: payload.adminLevel,
      canCreate: payload.canCreate,
      canUpdate: payload.canUpdate
    };
  } catch (error) {
    console.error('Error checking admin session:', error);
    return null;
  }
}

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหรือไม่
 * @param {Object} admin ข้อมูล admin
 * @param {number} requiredLevel ระดับสิทธิ์ที่ต้องการ
 * @returns {Promise<boolean>} true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
export async function hasPermission(admin, requiredLevel) {
  if (!admin) return false;
  return admin.adminLevel >= requiredLevel;
}

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการสร้างหรือไม่
 * @param {Object} admin ข้อมูล admin
 * @returns {Promise<boolean>} true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
export async function canCreate(admin) {
  if (!admin) return false;
  return admin.canCreate === 1 || admin.adminLevel === 5;
}

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการแก้ไขหรือไม่
 * @param {Object} admin ข้อมูล admin
 * @returns {Promise<boolean>} true ถ้ามีสิทธิ์, false ถ้าไม่มีสิทธิ์
 */
export async function canUpdate(admin) {
  if (!admin) return false;
  return admin.canUpdate === 1 || admin.adminLevel === 5;
}

/**
 * ตรวจสอบ session ของผู้ใช้จาก cookie
 * @param {Object} cookieStore - cookie store จาก next/headers
 * @returns {Promise<Object|null>} ข้อมูลผู้ใช้หรือ null ถ้าไม่มี session
 */
export async function checkUserSession(cookieStore) {
  try {
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, userSecretKey);
    const payload = verified.payload;
    
    // ตรวจสอบว่าผู้ใช้ยังคงมีอยู่ในฐานข้อมูลและยังเป็น active อยู่
    const users = await query(
      'SELECT * FROM users WHERE id = ? AND is_active = TRUE LIMIT 1',
      [payload.userId]
    );

    if (users.length === 0) {
      return null;
    }

    // ส่งคืนข้อมูลผู้ใช้จากฐานข้อมูล
    const user = users[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Error checking user session:', error);
    return null;
  }
}