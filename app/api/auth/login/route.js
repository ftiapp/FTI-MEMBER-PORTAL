import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Log environment variables (mask sensitive data)
    console.log('Database connection attempt:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD
    });

    // Find user
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log('Query result:', {
      userFound: users.length > 0,
      email: email
    });

    if (!users || users.length === 0) {
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
