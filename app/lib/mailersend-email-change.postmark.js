import * as postmark from 'postmark';
import { getFTIEmailHtmlTemplate } from "./fti-email-template";

// Initialize Postmark client with API key
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

/**
 * Common sender for all emails
 */
const defaultSender = "noreply@fti.or.th";

/**
 * Send OTP for email change verification
 * @param {string} email - User's current email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} otp - One-time password for verification
 * @returns {Promise} - Promise with email sending result
 */
export async function sendEmailChangeOTP(email, firstName, lastName, otp) {
  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "รหัส OTP สำหรับการเปลี่ยนอีเมล - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "รหัส OTP สำหรับการเปลี่ยนอีเมล",
        bodyContent: `
          <p>เรียน คุณ${firstName} ${lastName},</p>
          <p>นี่คือรหัส OTP สำหรับการเปลี่ยนอีเมลของคุณ:</p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f3f4f6; padding: 16px; border-radius: 8px; display: inline-block;">${otp}</div>
          </div>
          <p>รหัส OTP นี้จะหมดอายุใน 15 นาที</p>
          <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้และติดต่อเจ้าหน้าที่</p>
        `
      }),
      TextBody: `
        รหัส OTP สำหรับการเปลี่ยนอีเมล - FTI Portal
        
        เรียน คุณ${firstName} ${lastName},
        
        นี่คือรหัส OTP สำหรับการเปลี่ยนอีเมลของคุณ:
        
        ${otp}
        
        รหัส OTP นี้จะหมดอายุใน 15 นาที
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้และติดต่อเจ้าหน้าที่
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending email change OTP:", error);
    throw error;
  }
}

/**
 * Send notification to the old email address about email change
 * @param {string} oldEmail - User's old email address
 * @param {string} newEmail - User's new email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendEmailChangeNotificationToOld(oldEmail, newEmail, firstName, lastName) {
  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: oldEmail,
      Subject: "การเปลี่ยนแปลงอีเมลสำเร็จ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "การเปลี่ยนแปลงอีเมลสำเร็จ",
        bodyContent: `
          <p>เรียน คุณ${firstName} ${lastName},</p>
          <p>อีเมลของคุณได้ถูกเปลี่ยนจาก <strong>${oldEmail}</strong> เป็น <strong>${newEmail}</strong> เรียบร้อยแล้ว</p>
          <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อเจ้าหน้าที่โดยด่วน</p>
          <div style="margin-top: 32px; padding: 16px; background-color: #fff8f1; border-left: 4px solid #f97316; border-radius: 4px;">
            <p style="margin: 0; color: #9a3412; font-weight: bold;">หมายเหตุ:</p>
            <p style="margin-top: 8px; color: #9a3412;">นี่เป็นอีเมลแจ้งเตือนที่ส่งไปยังอีเมลเก่าของคุณ คุณจะไม่สามารถใช้อีเมลนี้ในการเข้าสู่ระบบได้อีกต่อไป</p>
          </div>
        `
      }),
      TextBody: `
        การเปลี่ยนแปลงอีเมลสำเร็จ - FTI Portal
        
        เรียน คุณ${firstName} ${lastName},
        
        อีเมลของคุณได้ถูกเปลี่ยนจาก ${oldEmail} เป็น ${newEmail} เรียบร้อยแล้ว
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อเจ้าหน้าที่โดยด่วน
        
        หมายเหตุ: นี่เป็นอีเมลแจ้งเตือนที่ส่งไปยังอีเมลเก่าของคุณ คุณจะไม่สามารถใช้อีเมลนี้ในการเข้าสู่ระบบได้อีกต่อไป
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending email change notification to old email:", error);
    throw error;
  }
}

/**
 * Send notification to the new email address about email change
 * @param {string} newEmail - User's new email address
 * @param {string} oldEmail - User's old email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendEmailChangeNotificationToNew(newEmail, oldEmail, firstName, lastName) {
  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: newEmail,
      Subject: "ยินดีต้อนรับ - การเปลี่ยนแปลงอีเมลสำเร็จ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "การเปลี่ยนแปลงอีเมลสำเร็จ",
        bodyContent: `
          <p>เรียน คุณ${firstName} ${lastName},</p>
          <p>ยินดีต้อนรับ! อีเมลของคุณได้ถูกเปลี่ยนจาก <strong>${oldEmail}</strong> เป็น <strong>${newEmail}</strong> เรียบร้อยแล้ว</p>
          <p>คุณสามารถใช้อีเมลใหม่นี้ในการเข้าสู่ระบบได้ทันที</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://ftimemberportal-529sy.kinsta.app/login" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">เข้าสู่ระบบ</a>
          </div>
          <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อเจ้าหน้าที่โดย��่วน</p>
        `
      }),
      TextBody: `
        ยินดีต้อนรับ - การเปลี่ยนแปลงอีเมลสำเร็จ - FTI Portal
        
        เรียน คุณ${firstName} ${lastName},
        
        ยินดีต้อนรับ! อีเมลของคุณได้ถูกเปลี่ยนจาก ${oldEmail} เป็น ${newEmail} เรียบร้อยแล้ว
        
        คุณสามารถใช้อีเมลใหม่นี้ในการเข้าสู่ระบบได้ทันที
        
        เข้าสู่ระบบ: https://ftimemberportal-529sy.kinsta.app/login
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อเจ้าหน้าที่โดยด่วน
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending email change notification to new email:", error);
    throw error;
  }
}
