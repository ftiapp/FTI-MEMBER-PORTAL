import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "./db";

/**
 * ตรวจสอบ session ของผู้ใช้จาก cookie
 * @returns {Promise<Object|null>} ข้อมูลผู้ใช้หรือ null ถ้าไม่มี session
 */
export async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    // สร้าง secret key สำหรับ JWT
    const secretKey = process.env.JWT_SECRET || "your-secret-key";

    const payload = jwt.verify(token, secretKey);

    // ตรวจสอบว่าผู้ใช้ยังคงมีอยู่ในฐานข้อมูล
    const FTI_Portal_User = await query(
      "SELECT id, email, firstname, lastname FROM FTI_Portal_User WHERE id = ? LIMIT 1",
      [payload.userId],
    );

    if (FTI_Portal_User.length === 0) {
      return null;
    }

    return FTI_Portal_User[0];
  } catch (error) {
    console.error("Error checking user session:", error);
    return null;
  }
}

/**
 * สร้าง JWT token สำหรับผู้ใช้
 * @param {Object} user ข้อมูลผู้ใช้
 * @returns {Promise<string>} JWT token
 */
export async function createUserToken(user) {
  // สร้าง secret key สำหรับ JWT
  const secretKey = process.env.JWT_SECRET || "your-secret-key";

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    secretKey,
    { expiresIn: "7d" },
  );
}
