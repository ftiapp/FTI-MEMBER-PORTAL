import * as postmark from 'postmark';
import { getFTIEmailHtmlTemplate } from "./fti-email-template";

// Initialize Postmark client with API key
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

/**
 * Common sender for all emails
 */
const defaultSender = "noreply@fti.or.th";

/**
 * Send verification email for admin email change
 * @param {string} newEmail - New email address
 * @param {string} token - Verification token
 * @returns {Promise} - Promise with email sending result
 */
export async function sendAdminEmailChangeVerification(newEmail, token) {
  // Create base URL for verification link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const verificationLink = `${baseUrl}/admin/verify-email-change?token=${token}`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: newEmail,
      Subject: "ยืนยันการเปลี่ยนอีเมลผู้ดูแลระบบ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันการเปลี่ยนอีเมลผู้ดูแลระบบ",
        bodyContent: `
          <p>สวัสดี,</p>
          <p>มีการขอเปลี่ยนอีเมลผู้ดูแลระบบเป็น <strong>${newEmail}</strong> กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลใหม่:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลใหม่</a>
          </div>
          <p>หากคุณไม่สามารถคลิกที่ปุ่มได้ กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
          <p style="color: #d97706; margin-top: 32px;">หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
        `
      }),
      TextBody: `
        ยืนยันการเปลี่ยนอีเมลผู้ดูแลระบบ - FTI Portal
        
        สวัสดี,
        
        มีการขอเปลี่ยนอีเมลผู้ดูแลระบบเป็น ${newEmail} กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลใหม่:
        
        ${verificationLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending admin email change verification:", error);
    throw error;
  }
}

/**
 * Send notification about admin email change
 * @param {string} oldEmail - Old email address
 * @param {string} newEmail - New email address
 * @returns {Promise} - Promise with email sending result
 */
export async function sendAdminEmailChangeNotification(oldEmail, newEmail) {
  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: oldEmail,
      Subject: "การเปลี่ยนแปลงอีเมลผู้ดูแลระบบสำเร็จ - FTI Portal",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "การเปลี่ยนแปลงอีเมลผู้ดูแลระบบสำเร็จ",
        bodyContent: `
          <p>สวัสดี,</p>
          <p>อีเมลผู้ดูแลระบบของคุณได้ถูกเปลี่ยนจาก <strong>${oldEmail}</strong> เป็น <strong>${newEmail}</strong> เรียบร้อยแล้ว</p>
          <p>คุณสามารถใช้อีเมลใหม่ในการเข้าสู่ระบบได้ทันที</p>
          <div style="margin-top: 32px; padding: 16px; background-color: #fff8f1; border-left: 4px solid #f97316; border-radius: 4px;">
            <p style="margin: 0; color: #9a3412; font-weight: bold;">หมายเหตุ:</p>
            <p style="margin-top: 8px; color: #9a3412;">นี่เป็นอีเมลแจ้งเตือนที่ส่งไปยังอีเมลเก่าของคุณ คุณจะไม่สามารถใช้อีเมลนี้ในการเข้าสู่ระบบได้อีกต่อไป</p>
          </div>
          <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อผู้ดูแลระบบระดับสูงโดยด่วน</p>
        `
      }),
      TextBody: `
        การเปลี่ยนแปลงอีเมลผู้ดูแลระบบสำเร็จ - FTI Portal
        
        สวัสดี,
        
        อีเมลผู้ดูแลระบบของคุณได้ถูกเปลี่ยนจาก ${oldEmail} เป็น ${newEmail} เรียบร้อยแล้ว
        
        คุณสามารถใช้อีเมลใหม่ในการเข้าสู่ระบบได้ทันที
        
        หมายเหตุ: นี่เป็นอีเมลแจ้งเตือนที่ส่งไปยังอีเมลเก่าของคุณ คุณจะไม่สามารถใช้อีเมลนี้ในการเข้าสู่ระบบได้อีกต่อไป
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อผู้ดูแลระบบระดับสูงโดยด่วน
      `,
      MessageStream: "outbound"
    });
    return response;
  } catch (error) {
    console.error("Error sending admin email change notification:", error);
    throw error;
  }
}
