import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';

// Mock users สำหรับการทดสอบ
const mockUsers = [
  {
    id: 1,
    name: 'ทดสอบ ระบบ',
    email: 'test@example.com',
    phone: '0812345678',
    password: '$2a$10$zH9/qHpGQQBGSuQbVuVQy.lGGmMiXk7mKfTbAO8XmKfBrEcIIUgRu', // รหัสผ่าน: password123
    role: 'member',
    status: 'active',
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00'
  },
  {
    id: 2,
    name: 'Pairoj Chuanchanachai',
    email: 'c.pairoj.n@gmail.com',
    phone: '0812345678',
    password: '$2a$10$zH9/qHpGQQBGSuQbVuVQy.lGGmMiXk7mKfTbAO8XmKfBrEcIIUgRu', // รหัสผ่าน: password123
    role: 'admin',
    status: 'active',
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00'
  }
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt:', {
      email: email,
      usingMockData: false
    });

    // Find user in database
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log('Password verification:', {
      isValid: isValidPassword,
      userId: user.id
    });

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }
    
    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        { 
          error: 'กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ',
          requiresVerification: true 
        },
        { status: 403 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // สร้าง response object
    const response = NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userWithoutPassword
    });

    // เก็บ token ใน cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
