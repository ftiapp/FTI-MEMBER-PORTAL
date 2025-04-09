import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { sendOTP, generateOTP, logSMSActivity } from '@/app/lib/sms';

export async function POST(request) {
  try {
    const { phone, userId } = await request.json();

    // Validate phone number
    if (!phone || !/^\d{9,10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Format the phone number (ensure it starts with 0)
    const formattedPhone = phone.startsWith('0') ? phone : `0${phone}`;

    // Generate OTP
    const otpCode = generateOTP();

    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Save OTP to database
    await query(
      `INSERT INTO otp_verification (user_id, phone, otp_code, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [userId, formattedPhone, otpCode, expiresAt]
    );

    // Send OTP via SMS
    const smsResult = await sendOTP(formattedPhone, otpCode);

    // Log the activity
    await logSMSActivity(
      userId,
      formattedPhone,
      otpCode,
      smsResult.success,
      smsResult.success ? null : smsResult.error
    );

    if (smsResult.success) {
      return NextResponse.json({
        success: true,
        message: 'รหัส OTP ถูกส่งไปยังเบอร์โทรศัพท์ของคุณแล้ว'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการส่งรหัส OTP' },
      { status: 500 }
    );
  }
}
