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
 * Send OTP email for email change request
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} otp - OTP code
 * @returns {Promise} - Promise with email sending result
 */
export async function sendEmailChangeOTP(email, firstname, lastname, otp) {
  // Use the default sender
  const recipients = [new Recipient(email, `${firstname} ${lastname}`)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("รหัสยืนยันสำหรับการเปลี่ยนอีเมล - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(getFTIEmailHtmlTemplate({
  title: "รหัสยืนยันสำหรับการเปลี่ยนอีเมล",
  bodyContent: `
    <p>เรียน ท่าน ${firstname} ${lastname}</p>
    <p>ทางสภาอุตสาหกรรมแห่งประเทศไทยได้รับคำขอเปลี่ยนอีเมลในระบบสมาชิก</p>
    <p>กรุณาใช้รหัสยืนยันด้านล่างนี้เพื่อดำเนินการต่อ:</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 28px; letter-spacing: 6px; text-align: center; font-weight: bold; margin: 20px 0; color: #1a56db;">
      ${otp}
    </div>
    <p>รหัสยืนยันนี้จะหมดอายุภายใน 15 นาที</p>
    <p>หากท่านไม่ได้ทำรายการนี้ โปรดแจ้งเจ้าหน้าที่ผู้ดูแลระบบทันที</p>
  `
}));

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send email notification for successful email change (to old email)
 * @param {string} email - User's old email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} newEmail - User's new email address
 * @returns {Promise} - Promise with email sending result
 */
export async function sendEmailChangeNotificationToOld(email, firstname, lastname, newEmail) {
  // Use the default sender
  const recipients = [new Recipient(email, `${firstname} ${lastname}`)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("แจ้งการเปลี่ยนอีเมลสำเร็จ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(getFTIEmailHtmlTemplate({
      title: "แจ้งการเปลี่ยนอีเมลสำเร็จ",
      bodyContent: `
        <p>เรียน ท่าน ${firstname} ${lastname}</p>
        <p>อีเมลของท่านในระบบสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยได้ถูกเปลี่ยนจาก <strong>${email}</strong> เป็น <strong>${newEmail}</strong> เรียบร้อยแล้ว</p>
        <p>หากท่านไม่ได้ทำรายการนี้ โปรดติดต่อเจ้าหน้าที่ผู้ดูแลระบบทันที</p>
      `
    }));

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send email notification for successful email change (to new email)
 * @param {string} email - User's new email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendEmailChangeNotificationToNew(email, firstname, lastname) {
  // Use the default sender
  const recipients = [new Recipient(email, `${firstname} ${lastname}`)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("ยินดีต้อนรับ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(getFTIEmailHtmlTemplate({
      title: "ยินดีต้อนรับ",
      bodyContent: `
        <p>เรียน ท่าน ${firstname} ${lastname}</p>
        <p>อีเมลของท่านในระบบสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยได้ถูกเปลี่ยนเป็น <strong>${email}</strong> เรียบร้อยแล้ว</p>
        <p>ท่านสามารถใช้อีเมลนี้ในการเข้าสู่ระบบได้ทันที</p>
      `
    }));

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
