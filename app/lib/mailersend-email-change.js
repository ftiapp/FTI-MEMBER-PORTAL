import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

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
    .setHtml(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.fti.or.th/wp-content/uploads/2022/01/cropped-logo-fti-1.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px;">
        </div>
        <div style="border-top: 3px solid #1a56db; padding-top: 20px;">
          <h2 style="color: #1a56db; font-size: 20px;">รหัสยืนยันสำหรับการเปลี่ยนอีเมล</h2>
          <p style="color: #333; font-size: 16px;">เรียน ท่าน ${firstname} ${lastname}</p>
          <p style="color: #333; font-size: 16px;">ทางสภาอุตสาหกรรมแห่งประเทศไทยได้รับคำขอเปลี่ยนอีเมลในระบบสมาชิก</p>
          <p style="color: #333; font-size: 16px;">กรุณาใช้รหัสยืนยันด้านล่างนี้เพื่อดำเนินการต่อ:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 28px; letter-spacing: 6px; text-align: center; font-weight: bold; margin: 20px 0; color: #1a56db;">
            ${otp}
          </div>
          <p style="color: #333; font-size: 16px;">รหัสยืนยันนี้จะหมดอายุภายใน 15 นาที</p>
          <p style="color: #333; font-size: 16px;">หากท่านไม่ได้ทำรายการนี้ โปรดแจ้งเจ้าหน้าที่ผู้ดูแลระบบทันที</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 14px;">
            <p>ด้วยความเคารพ<br>สภาอุตสาหกรรมแห่งประเทศไทย<br>The Federation of Thai Industries</p>
          </div>
        </div>
      </div>
    `);

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
    .setHtml(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.fti.or.th/wp-content/uploads/2022/01/cropped-logo-fti-1.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px;">
        </div>
        <div style="border-top: 3px solid #1a56db; padding-top: 20px;">
          <h2 style="color: #1a56db; font-size: 20px;">แจ้งการเปลี่ยนอีเมลสำเร็จ</h2>
          <p style="color: #333; font-size: 16px;">เรียน ท่าน ${firstname} ${lastname}</p>
          <p style="color: #333; font-size: 16px;">อีเมลของท่านในระบบสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยได้ถูกเปลี่ยนจาก ${email} เป็น ${newEmail} เรียบร้อยแล้ว</p>
          <p style="color: #333; font-size: 16px;">หากท่านไม่ได้ทำรายการนี้ โปรดติดต่อเจ้าหน้าที่ผู้ดูแลระบบทันที</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 14px;">
            <p>ด้วยความเคารพ<br>สภาอุตสาหกรรมแห่งประเทศไทย<br>The Federation of Thai Industries</p>
          </div>
        </div>
      </div>
    `);

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
    .setHtml(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://www.fti.or.th/wp-content/uploads/2022/01/cropped-logo-fti-1.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px;">
        </div>
        <div style="border-top: 3px solid #1a56db; padding-top: 20px;">
          <h2 style="color: #1a56db; font-size: 20px;">ยินดีต้อนรับ</h2>
          <p style="color: #333; font-size: 16px;">เรียน ท่าน ${firstname} ${lastname}</p>
          <p style="color: #333; font-size: 16px;">อีเมลของท่านในระบบสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยได้ถูกเปลี่ยนเป็น ${email} เรียบร้อยแล้ว</p>
          <p style="color: #333; font-size: 16px;">ท่านสามารถใช้อีเมลนี้ในการเข้าสู่ระบบได้ทันที</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 14px;">
            <p>ด้วยความเคารพ<br>สภาอุตสาหกรรมแห่งประเทศไทย<br>The Federation of Thai Industries</p>
          </div>
        </div>
      </div>
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
