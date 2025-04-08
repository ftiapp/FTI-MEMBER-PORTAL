import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createVerificationToken } from '@/app/lib/token';
import { sendVerificationEmail } from '@/app/lib/mailersend';

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with email_verified set to false
    const result = await query(
      'INSERT INTO users (name, email, phone, password, email_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, 0]
    );
    
    const userId = result.insertId;
    
    // Generate verification token
    const verificationToken = await createVerificationToken(userId);
    
    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    return NextResponse.json({
      message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี',
      userId: userId,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลงทะเบียน' },
      { status: 500 }
    );
  }
}
