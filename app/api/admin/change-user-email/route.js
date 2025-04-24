import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';
import { generateToken } from '@/app/lib/token';
import { sendAdminEmailChangeVerification, sendAdminEmailChangeNotification } from '@/app/lib/mailersend-admin-email-change';

/**
 * POST /api/admin/change-user-email
 * 
 * Initiates the email change process for a user by an admin.
 * This is used when users have lost access to their original email.
 * 
 * The process:
 * 1. Admin verifies user identity through external means
 * 2. Admin initiates email change through this endpoint
 * 3. System sends verification email to the new email address
 * 4. User clicks verification link and sets a new password
 * 5. Email is updated and verified in the system
 * 
 * Requires admin authentication.
 */
export async function POST(request) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    // Get request body
    const { userId, oldEmail, newEmail, adminNote } = await request.json();
    
    // Validate inputs
    if (!userId || !oldEmail || !newEmail || !adminNote) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาระบุข้อมูลให้ครบถ้วน' 
      }, { status: 400 });
    }
    
    // Check if user exists
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    const users = await query(userQuery, [userId]);
    
    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบผู้ใช้' 
      }, { status: 404 });
    }
    
    const user = users[0];
    
    if (user.email !== oldEmail) {
      return NextResponse.json({ 
        success: false, 
        message: 'อีเมลปัจจุบันไม่ตรงกับข้อมูลในระบบ' 
      }, { status: 400 });
    }
    
    // Check if new email is already in use
    const emailCheckQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
    const existingEmails = await query(emailCheckQuery, [newEmail, userId]);
    
    if (existingEmails.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'อีเมลใหม่นี้ถูกใช้งานในระบบแล้ว' 
      }, { status: 400 });
    }
    
    // Check for any pending email changes - handle both with and without status column
    try {
      const pendingCheckQuery = 'SELECT id FROM pending_email_changes WHERE user_id = ? AND status = "pending"';
      const pendingChanges = await query(pendingCheckQuery, [userId]);
      
      if (pendingChanges.length > 0) {
        // Cancel previous pending changes
        await query(
          'UPDATE pending_email_changes SET status = "cancelled", updated_at = NOW() WHERE user_id = ? AND status = "pending"',
          [userId]
        );
      }
    } catch (error) {
      // If status column doesn't exist, just get all pending changes for the user
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes("Unknown column 'status'")) {
        const pendingCheckQuery = 'SELECT id FROM pending_email_changes WHERE user_id = ?';
        const pendingChanges = await query(pendingCheckQuery, [userId]);
        
        if (pendingChanges.length > 0) {
          // Delete previous pending changes since we can't update status
          await query(
            'DELETE FROM pending_email_changes WHERE user_id = ?',
            [userId]
          );
        }
      } else {
        // Re-throw other errors
        throw error;
      }
    }
    
    // Generate verification token
    const token = await generateToken();
    
    // We'll handle each operation separately instead of using a transaction
    // since START TRANSACTION is not supported in prepared statements
    try {
      // Try to insert with all columns, if it fails, try with just the basic columns
      let changeResult;
      try {
        // For admin-initiated email changes, we don't need an OTP, but the field is required
        // Generate a random OTP (it won't be used for admin flow)
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Insert into pending_email_changes table with all columns including otp
        const insertChangeQuery = `
          INSERT INTO pending_email_changes (
            user_id, old_email, new_email, admin_id, admin_note, status, otp, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'pending', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NOW(), NOW())
        `;
        
        changeResult = await query(insertChangeQuery, [
          userId, oldEmail, newEmail, admin.id, adminNote, randomOtp
        ]);
      } catch (error) {
        // If column doesn't exist, try with just the basic columns
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          // First run the migration to add the columns
          try {
            // Run the migration file directly - using separate statements for each column
            // Try to add each column individually and catch errors if they already exist
            try {
              await query(`ALTER TABLE pending_email_changes ADD COLUMN status ENUM('pending', 'verified', 'cancelled', 'rejected') DEFAULT 'pending'`);
            } catch (e) { /* Column might already exist */ }
            
            try {
              await query(`ALTER TABLE pending_email_changes ADD COLUMN old_email VARCHAR(255)`);
            } catch (e) { /* Column might already exist */ }
            
            try {
              await query(`ALTER TABLE pending_email_changes ADD COLUMN admin_id INT`);
            } catch (e) { /* Column might already exist */ }
            
            try {
              await query(`ALTER TABLE pending_email_changes ADD COLUMN admin_note TEXT`);
            } catch (e) { /* Column might already exist */ }
            
            try {
              await query(`ALTER TABLE pending_email_changes ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP`);
            } catch (e) { /* Column might already exist */ }
            
            // Migration is done with separate statements above
            
            // Try the full insert again with the OTP field
            const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
            
            const insertChangeQuery = `
              INSERT INTO pending_email_changes (
                user_id, old_email, new_email, admin_id, admin_note, status, otp, expires_at, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, 'pending', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NOW(), NOW())
            `;
            
            changeResult = await query(insertChangeQuery, [
              userId, oldEmail, newEmail, admin.id, adminNote, randomOtp
            ]);
          } catch (migrationError) {
            // If migration fails, fall back to basic insert
            console.error('Migration failed:', migrationError);
            
            // Even the basic insert needs to include the otp field
            const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
            
            const basicInsertQuery = `
              INSERT INTO pending_email_changes (
                user_id, new_email, otp, expires_at, created_at
              ) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NOW())
            `;
            
            changeResult = await query(basicInsertQuery, [userId, newEmail, randomOtp]);
          }
        } else {
          // Re-throw other errors
          throw error;
        }
      }
      
      const changeId = changeResult.insertId;
      
      // Insert into verification_tokens table
      const insertTokenQuery = `
        INSERT INTO verification_tokens (
          token, user_id, token_type, otp, otp_verified, expires_at, used, created_at
        ) VALUES (?, ?, 'new_email_verification', NULL, 0, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0, NOW())
      `;
      
      await query(insertTokenQuery, [token, userId]);
      
      // Log the action in Member_portal_User_log
      const logQuery = `
        INSERT INTO Member_portal_User_log (
          user_id, action, details, created_at
        ) VALUES (?, 'change_email', ?, NOW())
      `;
      
      const logDetails = JSON.stringify({
        admin_id: admin.id,
        admin_username: admin.username,
        old_email: oldEmail,
        new_email: newEmail,
        change_id: changeId
      });
      
      await query(logQuery, [userId, logDetails]);
      
      // Mark the email as unverified
      await query(
        'UPDATE users SET email_verified = 0, updated_at = NOW() WHERE id = ?',
        [userId]
      );
      
      // Send verification email to the new email address
      await sendAdminEmailChangeVerification(newEmail, user.name, token);
      
      // Try to send notification to the old email address
      try {
        await sendAdminEmailChangeNotification(oldEmail, user.name, newEmail);
      } catch (emailError) {
        console.error('Failed to send notification to old email:', emailError);
        // Continue even if notification to old email fails
      }
      
      return NextResponse.json({
        success: true,
        message: 'ส่งอีเมลยืนยันไปยังอีเมลใหม่เรียบร้อยแล้ว'
      });
    } catch (error) {
      // Log the error and re-throw
      console.error('Error in admin email change process:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error changing user email:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเปลี่ยนอีเมล' },
      { status: 500 }
    );
  }
}
