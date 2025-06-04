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
    const { email, password, rememberMe } = await request.json();
    
    // Log the rememberMe parameter
    console.log('Login attempt:', {
      email: email,
      rememberMe: !!rememberMe,
      usingMockData: false
    });

    // Log removed as it's now above

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

    // สร้าง JWT token with expiration based on rememberMe
    const expiresIn = rememberMe ? '30d' : '1d'; // 30 days if remember me, 1 day if not
    
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        rememberMe: !!rememberMe
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn }
    );

    // สร้าง response object
    const response = NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userWithoutPassword,
      rememberMe: !!rememberMe
    });

    // เก็บ token ใน cookie with expiration based on rememberMe
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day in seconds
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
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
