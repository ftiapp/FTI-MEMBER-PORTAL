import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { query } from '../../../lib/db';

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
      usingMockData: true
    });

    // Find user in mock data
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // ในโหมด mock เราจะยอมรับรหัสผ่านใดๆ สำหรับทุกบัญชี
    // ในการใช้งานจริงควรใช้ bcrypt.compare
    const isValidPassword = true; // ยอมรับรหัสผ่านทุกตัว

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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userWithoutPassword
    });
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
