import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// Initialize MailerSend with API key
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

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

  // ใช้อีเมลเดียวกับที่ใช้ในโค้ดอื่นที่ทำงานได้
  const sender = new Sender("noreply@fti.or.th", "FTI Portal");
  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject("ยืนยันอีเมลของคุณ - FTI Portal")
    .setHtml(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1a56db;">ยืนยันอีเมลของคุณ</h1>
        </div>
        <div style="margin-bottom: 30px;">
          <p>สวัสดี ${name},</p>
          <p>ขอบคุณที่ลงทะเบียนกับ FTI Portal กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลของฉัน</a>
        </div>
        <div>
          <p>หากคุณไม่สามารถคลิกที่ปุ่มได้ กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 14px;">
          <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
          <p>&copy; 2025 FTI Portal. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    `)
    .setText(`
      ยืนยันอีเมลของคุณ - FTI Portal
      
      สวัสดี ${name},
      
      ขอบคุณที่ลงทะเบียนกับ FTI Portal กรุณาคลิกที่ลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:
      
      ${verificationLink}
      
      หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
      
      &copy; 2025 FTI Portal. สงวนลิขสิทธิ์.
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
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

  const sender = new Sender("noreply@fti.or.th", "FTI Portal");
  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject("รีเซ็ตรหัสผ่านของคุณ - FTI Portal")
    .setHtml(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1a56db;">รีเซ็ตรหัสผ่านของคุณ</h1>
        </div>
        <div style="margin-bottom: 30px;">
          <p>สวัสดี ${name},</p>
          <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${resetLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">รีเซ็ตรหัสผ่าน</a>
        </div>
        <div>
          <p>หากคุณไม่สามารถคลิกที่ปุ่มได้ กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${resetLink}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 14px;">
          <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
          <p>ลิงก์นี้จะหมดอายุใน 15 นาที</p>
          <p>&copy; 2025 FTI Portal. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    `)
    .setText(`
      รีเซ็ตรหัสผ่านของคุณ - FTI Portal
      
      สวัสดี ${name},
      
      เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
      
      ${resetLink}
      
      หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
      
      ลิงก์นี้จะหมดอายุใน 15 นาที
      
      &copy; 2025 FTI Portal. สงวนลิขสิทธิ์.
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
