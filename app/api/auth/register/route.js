import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createVerificationToken } from '@/app/lib/token';
import { sendVerificationEmail } from '@/app/lib/mailersend';

export async function POST(request) {
  try {
    const { name, firstName, lastName, email, phone, password } = await request.json();

    // Check if user already exists and if email is verified
    const existingUser = await query(
      'SELECT id, name, email_verified FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      // If email exists but is not verified, send a new verification token
      if (existingUser[0].email_verified === 0) {
        // Invalidate any existing tokens for this user
        await query(
          'UPDATE verification_tokens SET used = 1 WHERE user_id = ? AND used = 0',
          [existingUser[0].id]
        );
        
        // Generate a new verification token
        const verificationToken = await createVerificationToken(existingUser[0].id);
        
        // Send verification email
        await sendVerificationEmail(email, existingUser[0].name, verificationToken);
        
        return NextResponse.json({
          message: 'อีเมลนี้ได้ลงทะเบียนแล้วแต่ยังไม่ได้ยืนยัน เราได้ส่งอีเมลยืนยันใหม่ให้คุณแล้ว',
          userId: existingUser[0].id,
          requiresVerification: true
        });
      } else {
        // If email is already verified, don't allow re-registration
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with email_verified set to false
    const result = await query(
      'INSERT INTO users (name, firstname, lastname, email, phone, password, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, firstName, lastName, email, phone, hashedPassword, 0]
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
