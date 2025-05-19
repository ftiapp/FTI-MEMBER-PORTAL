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

  // Use the default sender
  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("ยืนยันอีเมลของคุณ - FTI Portal")
.setHtml(getFTIEmailHtmlTemplate({
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
}))
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

  // Use the default sender
  const recipients = [new Recipient(newEmail, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("ยืนยันอีเมลใหม่ของคุณ - FTI Portal")
    .setHtml(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1a56db;">ยืนยันอีเมลใหม่ของคุณ</h1>
        </div>
        <div style="margin-bottom: 30px;">
          <p>สวัสดี ${name},</p>
          <p>คุณได้ขอเปลี่ยนอีเมลของคุณใน FTI Portal กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลใหม่ของคุณ:</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลใหม่ของฉัน</a>
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
    `);

  return await mailerSend.email.send(emailParams);
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

  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
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

/**
 * Send approval email to member
 * @param {string} email - Member's email address
 * @param {string} name - Member's name
 * @param {object} memberData - Member data including MEMBER_CODE and company_name
 * @param {string} comment - Admin's comment (optional)
 * @returns {Promise} - Promise with email sending result
 */
export async function sendApprovalEmail(email, firstname, lastname, memberCode, companyName, comment) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("การยืนยันตัวตนได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(`
      <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <link href='https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&display=swap' rel='stylesheet'>
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/FTI-MasterLogo_RGB_forLightBG.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px; margin-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin-top: 0;">แจ้งผลการอนุมัติยืนยันตัวตน</h1>
        </div>
        <div style="margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การยืนยันตัวตนของท่านได้รับการอนุมัติเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0;"><strong>ข้อมูลสมาชิก:</strong></p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <p>ท่านสามารถตรวจสอบข้อมูลสมาชิกได้ที่ <strong>"ข้อมูลสมาชิก"</strong> บนแดชบอร์ดของท่าน</p>
          
          ${comment ? `<div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;"><p style="margin: 0;"><strong>ความคิดเห็นจากผู้ดูแลระบบ:</strong></p><p style="margin: 10px 0 0;">${comment}</p></div>` : ''}
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 14px;">
          <p>หากต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ CALL CENTER: 1453 กด 2</p>
          <p>&copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    `)
    .setText(`
      การยืนยันตัวตนได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการยืนยันตัวตนของท่านได้รับการอนุมัติเรียบร้อยแล้ว
      
      ข้อมูลสมาชิก:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      ท่านสามารถตรวจสอบข้อมูลสมาชิกได้ที่ "ข้อมูลสมาชิก" บนแดชบอร์ดของท่าน
      
      ${comment ? `ความคิดเห็นจากผู้ดูแลระบบ: ${comment}` : ''}
      
      เข้าสู่ระบบได้ที่: ${loginLink}
      ไปที่แดชบอร์ด: ${dashboardLink}
      
      หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      โทรศัพท์: 02-345-1000
      อีเมล: member@fti.or.th
      
      &copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw error;
  }
}

/**
 * Send rejection email to member
 * @param {string} email - Member's email address
 * @param {string} name - Member's name
 * @param {object} memberData - Member data including MEMBER_CODE and company_name
 * @param {string} reason - Rejection reason
 * @returns {Promise} - Promise with email sending result
 */
export async function sendRejectionEmail(email, firstname, lastname, memberCode, companyName, rejectReason) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขที่อยู่ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(`
      <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <link href='https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&display=swap' rel='stylesheet'>
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/FTI-MasterLogo_RGB_forLightBG.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px; margin-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin-top: 0;">แจ้งผลการพิจารณาคำขอแก้ไขที่อยู่</h1>
        </div>
        <div style="margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขที่อยู่ของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0;"><strong>ข้อมูลที่ท่านยื่น:</strong></p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>เหตุผลที่ไม่ได้รับการอนุมัติ:</strong></p>
            <p style="margin: 10px 0 0;">${rejectReason || '-'}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขที่อยู่ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #4b5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 14px;">
          <p>หากต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ CALL CENTER: 1453 กด 2</p>
          <p>&copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    `)
    .setText(`
      คำขอแก้ไขที่อยู่ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขที่อยู่ของท่านไม่ได้รับการอนุมัติ
      
      ข้อมูลที่ท่านยื่น:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      เหตุผลที่ไม่ได้รับการอนุมัติ: ${rejectReason}
      
      ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขที่อยู่ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      
      เข้าสู่ระบบได้ที่: ${loginLink}
      ไปที่แดชบอร์ด: ${dashboardLink}
      
      หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      โทรศัพท์: 02-345-1000
      อีเมล: member@fti.or.th
      
      &copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
}

/**
 * Send address update approval email to member
 * @param {string} email - Member's email address
 * @param {string} firstname - Member's first name
 * @param {string} lastname - Member's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} comment - Admin comment
 * @returns {Promise} - Promise with email sending result
 */
export async function sendAddressApprovalEmail(email, firstname, lastname, memberCode, companyName, comment) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขที่อยู่ได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(`
      <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <link href='https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&display=swap' rel='stylesheet'>
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/FTI-MasterLogo_RGB_forLightBG.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px; margin-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin-top: 0;">แจ้งผลการพิจารณาคำขอแก้ไขที่อยู่</h1>
        </div>
        <div style="margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขที่อยู่ของท่านได้รับการอนุมัติแล้ว</strong></p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0;"><strong>ข้อมูลที่ท่านยื่น:</strong></p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0;"><strong>สถานะ:</strong> ได้รับการอนุมัติแล้ว</p>
            ${comment ? `<p style="margin: 10px 0 0;"><strong>ความคิดเห็นจากผู้ดูแลระบบ:</strong> ${comment}</p>` : ''}
          </div>
          
          <p>ข้อมูลที่อยู่ใหม่ของท่านได้ถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #4b5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 14px;">
          <p>หากต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ CALL CENTER: 1453 กด 2</p>
          <p>&copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    `)
    .setText(`
      คำขอแก้ไขที่อยู่ได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขที่อยู่ของท่านได้รับการอนุมัติแล้ว
      
      ข้อมูลที่ท่านยื่น:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      สถานะ: ได้รับการอนุมัติแล้ว
      ${comment ? `ความคิดเห็นจากผู้ดูแลระบบ: ${comment}` : ''}
      
      ข้อมูลที่อยู่ใหม่ของท่านได้ถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      
      เข้าสู่ระบบได้ที่: ${loginLink}
      ไปที่แดชบอร์ด: ${dashboardLink}
      
      หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      โทรศัพท์: 02-345-1000
      อีเมล: member@fti.or.th
      
      &copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending address approval email:", error);
    throw error;
  }
}

export async function sendAddressRejectionEmail(email, firstname, lastname, memberCode, companyName, rejectReason) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456';
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขที่อยู่ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(`
      <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <link href='https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&display=swap' rel='stylesheet'>
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/FTI-MasterLogo_RGB_forLightBG.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px; margin-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin-top: 0;">แจ้งผลการพิจารณาคำขอแก้ไขที่อยู่</h1>
        </div>
        <div style="margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขที่อยู่ของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0;"><strong>ข้อมูลที่ท่านยื่น:</strong></p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>เหตุผลที่ไม่ได้รับการอนุมัติ:</strong></p>
            <p style="margin: 10px 0 0;">${rejectReason || '-'}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขที่อยู่ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #4b5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 14px;">
          <p>หากต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ CALL CENTER: 1453 กด 2</p>
          <p>&copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    `)
    .setText(`
      คำขอแก้ไขที่อยู่ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขที่อยู่ของท่านไม่ได้รับการอนุมัติ
      
      ข้อมูลที่ท่านยื่น:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      เหตุผลที่ไม่ได้รับการอนุมัติ: ${rejectReason}
      
      ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขที่อยู่ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      
      เข้าสู่ระบบได้ที่: ${loginLink}
      ไปที่แดชบอร์ด: ${dashboardLink}
      
      หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      โทรศัพท์: 02-345-1000
      อีเมล: member@fti.or.th
      
      &copy; 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending address rejection email:", error);
    throw error;
  }
}

/**
 * Send TSIC update approval email to member
 * @param {string} email - Member's email address
 * @param {string} firstname - Member's first name
 * @param {string} lastname - Member's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} tsicDetails - TSIC code and description
 * @param {string} comment - Admin comment
 * @returns {Promise} - Promise with email sending result
 */
async function sendTsicApprovalEmail(email, firstname, lastname, memberCode, companyName, tsicDetails, comment = '') {
  if (!email || !memberCode) {
    throw new Error('Email and member code are required');
  }

  const fullName = `${firstname || ''} ${lastname || ''}`.trim();
  const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456'}/login`;
  const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456'}/member`;
  
  // Create sender
  const defaultSender = new Sender('noreply@fti.or.th', 'สภาอุตสาหกรรมแห่งประเทศไทย');
  
  // Create recipients
  const recipients = [
    new Recipient(email, fullName)
  ];

  // Create email params
  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขรหัส TSIC ได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(getFTIEmailHtmlTemplate({
      title: "คำขอแก้ไขรหัส TSIC ได้รับการอนุมัติแล้ว",
      bodyContent: `
        <p>เรียน คุณ${fullName || 'ผู้ใช้งาน'}</p>
        
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขรหัส TSIC ของท่านได้รับการอนุมัติเรียบร้อยแล้ว</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">รายละเอียดการอนุมัติ:</p>
          <p style="margin: 5px 0;">หมายเลขสมาชิก: <strong>${memberCode}</strong></p>
          <p style="margin: 5px 0;">ชื่อบริษัท: <strong>${companyName || 'ไม่ระบุ'}</strong></p>
          <p style="margin: 5px 0;">รหัส TSIC ที่อนุมัติ: <strong>${tsicDetails || 'ไม่ระบุ'}</strong></p>
          ${comment ? `<p style="margin: 5px 0;">ความคิดเห็นจากผู้ดูแลระบบ: <strong>${comment}</strong></p>` : ''}
        </div>
        
        <p>ท่านสามารถตรวจสอบข้อมูลรหัส TSIC ที่ได้รับการอนุมัติได้จากหน้ารายละเอียดสมาชิก</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${loginLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">เข้าสู่ระบบ</a>
        </div>
        
        <p>หรือเข้าสู่ระบบได้ที่: <a href="${loginLink}" style="color: #1a56db; text-decoration: underline;">${loginLink}</a></p>
        
        <p>หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <p>โทรศัพท์: 02-345-1000<br>
        อีเมล: <a href="mailto:member@fti.or.th" style="color: #1a56db; text-decoration: underline;">member@fti.or.th</a></p>
      `
    }));

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error('Error sending TSIC approval email:', error);
    throw error;
  }
}

/**
 * Send TSIC update rejection email to member
 * @param {string} email - Member's email address
 * @param {string} firstname - Member's first name
 * @param {string} lastname - Member's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} tsicDetails - TSIC code and description
 * @param {string} rejectReason - Rejection reason
 * @returns {Promise} - Promise with email sending result
 */
async function sendTsicRejectionEmail(email, firstname, lastname, memberCode, companyName, tsicDetails, rejectReason) {
  if (!email || !memberCode || !rejectReason) {
    throw new Error('Email, member code, and rejection reason are required');
  }

  const fullName = `${firstname || ''} ${lastname || ''}`.trim();
  const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456'}/login`;
  const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3456'}/member`;
  
  // Create sender
  const defaultSender = new Sender('noreply@fti.or.th', 'สภาอุตสาหกรรมแห่งประเทศไทย');
  
  // Create recipients
  const recipients = [
    new Recipient(email, fullName)
  ];

  // Create email params
  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขรหัส TSIC ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(getFTIEmailHtmlTemplate({
      title: "คำขอแก้ไขรหัส TSIC ไม่ได้รับการอนุมัติ",
      bodyContent: `
        <p>เรียน คุณ${fullName || 'ผู้ใช้งาน'}</p>
        
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขรหัส TSIC ของท่านไม่ได้รับการอนุมัติ เนื่องจาก:</p>
        
        <div style="background-color: #fef2f2; border-right: 4px solid #f87171; padding: 12px 15px; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0; color: #dc2626; font-weight: bold;">${rejectReason || 'ไม่ระบุเหตุผล'}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">รายละเอียดคำขอ:</p>
          <p style="margin: 5px 0;">หมายเลขสมาชิก: <strong>${memberCode}</strong></p>
          <p style="margin: 5px 0;">ชื่อบริษัท: <strong>${companyName || 'ไม่ระบุ'}</strong></p>
          <p style="margin: 5px 0;">รหัส TSIC ที่ขอแก้ไข: <strong>${tsicDetails || 'ไม่ระบุ'}</strong></p>
        </div>
        
        <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขรหัส TSIC ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่เพื่อขอทราบเหตุผลและแนวทางแก้ไข</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${loginLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">เข้าสู่ระบบ</a>
        </div>
        
        <p>หรือเข้าสู่ระบบได้ที่: <a href="${loginLink}" style="color: #1a56db; text-decoration: underline;">${loginLink}</a></p>
        
        <p>หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <p>โทรศัพท์: 02-345-1000<br>
        อีเมล: <a href="mailto:member@fti.or.th" style="color: #1a56db; text-decoration: underline;">member@fti.or.th</a></p>
      `
    }));

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error('Error sending TSIC rejection email:', error);
    throw error;
  }
}

// Add the new functions to the service
const mailerSendService = {
  sendVerificationEmail,
  sendNewEmailVerification,
  sendPasswordResetEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendAddressApprovalEmail,
  sendAddressRejectionEmail,
  sendTsicApprovalEmail,
  sendTsicRejectionEmail
};
