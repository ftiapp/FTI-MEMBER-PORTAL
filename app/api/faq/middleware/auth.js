import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// สร้าง secret key สำหรับ JWT
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-for-admin-auth');

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
 * @param {Request} request - อ็อบเจ็คต์ Request จาก Next.js
 * @returns {Promise<boolean>} ตอนนี้ให้ใช้ได้ทุกคนโดยไม่ต้องล็อกอิน
 */
export async function checkUserLoggedIn(request) {
  // อนุญาตให้ทุกคนใช้งานได้โดยไม่ต้องล็อกอิน
  return true;
  
  // TODO: Implement actual JWT verification when needed
  /*
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return false;
    }
    
    const { payload } = await jwtVerify(token.value, secretKey);
    return !!payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return false;
  }
  */
}