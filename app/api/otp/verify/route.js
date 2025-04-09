import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request) {
  try {
    const { phone, otpCode, userId } = await request.json();

    // Validate input
    if (!phone || !otpCode || !userId) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Format the phone number (ensure it starts with 0)
    const formattedPhone = phone.startsWith('0') ? phone : `0${phone}`;

    // Check if OTP is valid and not expired
    const otpResults = await query(
      `SELECT * FROM otp_verification 
       WHERE user_id = ? AND phone = ? AND otp_code = ? AND expires_at > NOW() AND used = 0
       ORDER BY created_at DESC LIMIT 1`,
      [userId, formattedPhone, otpCode]
    );

    if (otpResults.length === 0) {
      // Log the failed verification attempt
      await query(
        `INSERT INTO incentive_activity_logs 
         (agent_id, action, module, description, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'OTP_VERIFICATION_FAILED',
          'member_verification',
          JSON.stringify({
            phone: formattedPhone,
            timestamp: new Date().toISOString()
          }),
          request.headers.get('x-forwarded-for') || '',
          request.headers.get('user-agent') || ''
        ]
      );

      return NextResponse.json(
        { success: false, message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await query(
      'UPDATE otp_verification SET used = 1 WHERE id = ?',
      [otpResults[0].id]
    );

    // Log the successful verification
    await query(
      `INSERT INTO incentive_activity_logs 
       (agent_id, action, module, description, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'OTP_VERIFICATION_SUCCESS',
        'member_verification',
        JSON.stringify({
          phone: formattedPhone,
          timestamp: new Date().toISOString()
        }),
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || ''
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'ยืนยันเบอร์โทรศัพท์สำเร็จ'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการยืนยันรหัส OTP' },
      { status: 500 }
    );
  }
}
