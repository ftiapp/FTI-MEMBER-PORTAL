import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { getFTIEmailHtmlTemplate } from "./fti-email-template";

// Initialize MailerSend with API key
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

/**
 * Common sender for all emails
 */
const defaultSender = new Sender("noreply@fti.or.th", "FTI Portal");

/**
 * Send verification email for admin-initiated email change
 * @param {string} newEmail - User's new email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Verification token
 * @returns {Promise} - Promise with email sending result
 */
export async function sendAdminEmailChangeVerification(newEmail, name, verificationToken) {
  // Create base URL for verification link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const verificationLink = `${baseUrl}/verify-new-email?token=${verificationToken}`;

  // Use the default sender
  const recipients = [new Recipient(newEmail, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("ยืนยันอีเมลใหม่ของคุณ - FTI Portal")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "ยืนยันอีเมลใหม่ของคุณ",
        bodyContent: `
    <p>สวัสดี ${name},</p>
    <p>ผู้ดูแลระบบได้ดำเนินการเปลี่ยนอีเมลให้กับบัญชีของคุณใน FTI Portal กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลใหม่ของคุณและตั้งรหัสผ่านใหม่:</p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลใหม่ของฉัน</a>
    </div>
    <p>หากคุณไม่สามารถคลิกที่ปุ่มได้ กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
    <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
    <p style="color: #d97706; margin-top: 32px;">หากคุณไม่ได้ขอให้เปลี่ยนอีเมล กรุณาติดต่อผู้ดูแลระบบทันที</p>
  `,
      }),
    );

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending admin email change verification:", error);
    throw error;
  }
}

/**
 * Send notification to old email about admin-initiated email change
 * @param {string} oldEmail - User's old email address
 * @param {string} name - User's name
 * @param {string} newEmail - User's new email address
 * @returns {Promise} - Promise with email sending result
 */
export async function sendAdminEmailChangeNotification(oldEmail, name, newEmail) {
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const contactLink = `${baseUrl}/contact`;

  // Use the default sender
  const recipients = [new Recipient(oldEmail, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("การเปลี่ยนแปลงอีเมลบัญชีของคุณ - FTI Portal")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "การเปลี่ยนแปลงอีเมลบัญชีของคุณ",
        bodyContent: `
        <p>สวัสดี ${name},</p>
        <p>เราขอแจ้งให้ทราบว่า ผู้ดูแลระบบได้ดำเนินการเปลี่ยนอีเมลสำหรับบัญชีของคุณใน FTI Portal จาก <strong>${oldEmail}</strong> เป็น <strong>${newEmail}</strong></p>
        <p>การเปลี่ยนแปลงนี้ได้รับการดำเนินการโดยผู้ดูแลระบบตามคำขอของคุณ หรือเนื่องจากมีการยืนยันตัวตนของคุณผ่านช่องทางอื่น</p>
        <p>หากคุณไม่ได้ขอให้เปลี่ยนอีเมล กรุณาติดต่อผู้ดูแลระบบทันที</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${contactLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ติดต่อผู้ดูแลระบบ</a>
        </div>
      `,
      }),
    );

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending admin email change notification:", error);
    // Don't throw error here as this is a notification to old email which might be inaccessible
    return null;
  }
}
