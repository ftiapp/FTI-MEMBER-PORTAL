import * as postmark from 'postmark';
import { getFTIEmailHtmlTemplate } from "./fti-email-template";

// Initialize Postmark client with API key
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

/**
 * Common sender for all emails
 */
const defaultSender = "noreply@fti.or.th";

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Verification token
 * @returns {Promise} - Promise with email sending result
 */
export async function sendVerificationEmail(email, name, verificationToken) {
  // Create base URL for verification link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "ยืนยันอีเมลของคุณ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันอีเมลของคุณ",
        bodyContent: `
          <p>สวัสดี ${name},</p>
          <p>ขอบคุณที่ลงทะเบียนกับ FTI Portal กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลของฉัน</a>
          </div>
          <p>หากคุณไม่สามารถคลิกที่ปุ่มได้ กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
          <p style="color: #d97706; margin-top: 32px;">หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
        `
      }),
      TextBody: `
        ยืนยันอีเมลของคุณ - FTI Portal
        
        สวัสดี ${name},
        
        ขอบคุณที่ลงทะเบียนกับ FTI Portal กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:
        
        ${verificationLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
        
        © 2025 FTI Portal. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

/**
 * Send admin invitation email
 * @param {string} email - Recipient email (new admin)
 * @param {string} token - Invitation token
 * @param {Object} options - Optional details
 * @param {number} [options.adminLevel=1] - Admin level in the invite
 * @returns {Promise}
 */
export async function sendAdminInviteEmail(email, token, options = {}) {
  const adminLevel = options.adminLevel ?? 1;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const acceptLink = `${baseUrl}/admin/invite/accept?token=${token}`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "คำเชิญเป็นผู้ดูแลระบบ FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "คำเชิญเป็นผู้ดูแลระบบ",
        bodyContent: `
          <p>เรียน ${email},</p>
          <p>ท่านได้รับคำเชิญให้เป็น <strong>ผู้ดูแลระบบ (Admin Level ${adminLevel})</strong> บน FTI Portal</p>
          <p>กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านและเปิดใช้งานบัญชีแอดมินของท่าน:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${acceptLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยอมรับคำเชิญ</a>
          </div>
          <p>หากคลิกปุ่มไม่ได้ ให้ใช้ลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${acceptLink}</p>
          <p style="color: #6b7280; font-size: 14px;">ลิงก์นี้มีอายุ 24 ชั่วโมง</p>
        `
      }),
      TextBody: `
        คำเชิญเป็นผู้ดูแลระบบ FTI Portal

        ท่านได้รับคำเชิญให้เป็นผู้ดูแลระบบ (Admin Level ${adminLevel})
        โปรดเปิดลิงก์เพื่อตั้งรหัสผ่าน: ${acceptLink}

        ลิงก์นี้มีอายุ 24 ชั่วโมง
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending admin invite email:", error);
    throw error;
  }
}

/**
 * Send verification email for new email address
 * @param {string} newEmail - User's new email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Verification token
 * @returns {Promise} - Promise with email sending result
 */
export async function sendNewEmailVerification(newEmail, name, verificationToken) {
  // Create base URL for verification link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const verificationLink = `${baseUrl}/verify-new-email?token=${verificationToken}`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: newEmail,
      Subject: "ยืนยันอีเมลใหม่ของคุณ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันอีเมลใหม่ของคุณ",
        bodyContent: `
          <p>สวัสดี ${name},</p>
          <p>คุณได้ขอเปลี่ยนอีเมลของคุณใน FTI Portal กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลใหม่ของคุณ:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลใหม่ของฉัน</a>
          </div>
          <p>หากคลิกปุ่มไม่ได้ ให้คัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
        `
      }),
      TextBody: `
        ยืนยันอีเมลใหม่ของคุณ - FTI Portal
        
        สวัสดี ${name},
        
        คุณได้ขอเปลี่ยนอีเมลของคุณใน FTI Portal กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลใหม่ของคุณ:
        
        ${verificationLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending new email verification:", error);
    throw error;
  }
}

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 * @returns {Promise} - Promise with email sending result
 */
export async function sendPasswordResetEmail(email, name, resetToken) {
  // Create base URL for reset link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "รีเซ็ตรหัสผ่านของคุณ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "รีเซ็ตรหัสผ่านของคุณ",
        bodyContent: `
          <p>สวัสดี ${name},</p>
          <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">รีเซ็ตรหัสผ่าน</a>
          </div>
          <p>หากคุณไม่สามารถคลิกที่ปุ่มได้ กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${resetLink}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">ลิงก์นี้จะหมดอายุใน 15 นาที</p>
        `
      }),
      TextBody: `
        รีเซ็ตรหัสผ่านของคุณ - FTI Portal
        
        สวัสดี ${name},
        
        เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
        
        ${resetLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
        
        ลิงก์นี้จะหมดอายุใน 15 นาที
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// Export other email functions as needed, following the same pattern
