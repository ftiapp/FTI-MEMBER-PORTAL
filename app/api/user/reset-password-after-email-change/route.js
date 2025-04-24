import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/user/reset-password-after-email-change
 * 
 * Resets a user's password after email change verification.
 * This is used when users have lost access to their original email and an admin has changed it.
 * 
 * Required parameters:
 * - userId: The ID of the user
 * - newPassword: The new password to set
 * - token: The verification token used for the email change (for security verification)
 */
export async function POST(request) {
  try {
    const { userId, newPassword, token } = await request.json();

    // Validate inputs
    if (!userId || !newPassword || !token) {
      return NextResponse.json({ 
        error: 'กรุณาระบุข้อมูลให้ครบถ้วน' 
      }, { status: 400 });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' 
      }, { status: 400 });
    }

    // Try to verify token using token_id join first
    let tokenResult = [];
    
    try {
      const tokenQuery = `
        SELECT vt.*, pec.id as pending_id 
        FROM verification_tokens vt
        JOIN pending_email_changes pec ON vt.id = pec.token_id
        WHERE vt.token = ? 
          AND vt.user_id = ? 
          AND vt.token_type = 'new_email_verification' 
          AND vt.used = 1
      `;
      
      tokenResult = await query(tokenQuery, [token, userId]);
    } catch (error) {
      // If token_id column doesn't exist, try with user_id join instead
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes("token_id")) {
        console.log('Falling back to user_id join for password reset verification');
        
        const alternativeQuery = `
          SELECT vt.*, pec.id as pending_id 
          FROM verification_tokens vt
          JOIN pending_email_changes pec ON vt.user_id = pec.user_id
          WHERE vt.token = ? 
            AND vt.user_id = ? 
            AND vt.token_type = 'new_email_verification' 
            AND vt.used = 1
          ORDER BY pec.created_at DESC LIMIT 1
        `;
        
        tokenResult = await query(alternativeQuery, [token, userId]);
      } else {
        // If it's another error, re-throw it
        throw error;
      }
    }
    
    if (tokenResult.length === 0) {
      return NextResponse.json({ 
        error: 'โทเคนไม่ถูกต้องหรือไม่ตรงกับผู้ใช้นี้' 
      }, { status: 400 });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password
    await query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    // Log the password reset using the 'change_email' action since we know it exists
    // We'll use a detailed description that explains both the email change and password reset
    await query(
      `INSERT INTO Member_portal_User_log 
       (user_id, action, details, ip_address, user_agent, created_at) 
       VALUES (?, 'change_email', ?, ?, ?, NOW())`,
      [
        userId, 
        'ท่านได้เปลี่ยนอีเมลและตั้งรหัสผ่านใหม่เรียบร้อยแล้ว', 
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );
    
    // Note: After running the migration to add 'password_reset' to the ENUM,
    // we can update this code to use that action type instead
    
    return NextResponse.json({ 
      success: true, 
      message: 'รีเซ็ตรหัสผ่านสำเร็จ' 
    });
  } catch (error) {
    console.error('Error resetting password after email change:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' 
    }, { status: 500 });
  }
}
