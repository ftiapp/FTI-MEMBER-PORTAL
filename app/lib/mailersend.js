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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

  // Use the default sender
  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("ยืนยันอีเมลของคุณ - FTI Portal")
    .setHtml(
      getFTIEmailHtmlTemplate({
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
      `,
      }),
    ).setText(`
      ยืนยันอีเมลของคุณ - FTI Portal
      
      สวัสดี ${name},
      
      ขอบคุณที่ลงทะเบียนกับ FTI Portal กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:
      
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
 * Send admin invitation email
 * @param {string} email - Recipient email (new admin)
 * @param {string} token - Invitation token
 * @param {Object} options - Optional details
 * @param {number} [options.adminLevel=1] - Admin level in the invite
 * @returns {Promise}
 */
export async function sendAdminInviteEmail(email, token, options = {}) {
  const adminLevel = options.adminLevel ?? 1;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const acceptLink = `${baseUrl}/admin/invite/accept?token=${token}`;

  const recipients = [new Recipient(email, email)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำเชิญเป็นผู้ดูแลระบบ FTI Portal")
    .setHtml(
      getFTIEmailHtmlTemplate({
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
      `,
      }),
    ).setText(`
      คำเชิญเป็นผู้ดูแลระบบ FTI Portal\n\n
      ท่านได้รับคำเชิญให้เป็นผู้ดูแลระบบ (Admin Level ${adminLevel})\n
      โปรดเปิดลิงก์เพื่อตั้งรหัสผ่าน: ${acceptLink}\n\n
      ลิงก์นี้มีอายุ 24 ชั่วโมง
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
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
        <p>คุณได้ขอเปลี่ยนอีเมลของคุณใน FTI Portal กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลใหม่ของคุณ:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verificationLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ยืนยันอีเมลใหม่ของฉัน</a>
        </div>
        <p>หากคลิกปุ่มไม่ได้ ให้คัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์ของคุณ:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
      `,
      }),
    );

  return await mailerSend.email.send(emailParams);
}

/**
 * Send member connection notification email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name or company name
 * @param {Object} memberData - Member data object
 * @param {string} memberData.company_name - Company name
 * @param {string} memberData.tax_id - Tax ID or personal ID
 * @param {string} memberData.member_code - Member code
 * @param {string} memberData.member_type - Member type (OC, IC, AM, AC)
 * @returns {Promise} - Promise with email sending result
 */
export async function sendMemberConnectionEmail(email, name, memberData) {
  // Use the default sender
  const recipients = [new Recipient(email, name)];

  // Create member search link
  const memberSearchUrl = `https://membersearch.fti.or.th/member/${memberData.member_code}`;

  // Get member type description
  let idTypeText = "หมายเลขทะเบียนนิติบุคคล";
  if (memberData.member_type === "IC") {
    idTypeText = "หมายเลขบัตรประชาชน";
  }

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("ข้อมูลสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "ข้อมูลสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย",
        bodyContent: `
        <p>เรียน คุณ${name},</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #1a56db; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin-top: 0;"><strong>บริษัท ${memberData.company_name}</strong></p>
          <p>${idTypeText} ${memberData.tax_id}</p>
          <p>ได้เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยเรียบร้อยแล้ว</p>
          <p><strong>หมายเลขสมาชิก: ${memberData.member_code}</strong></p>
        </div>
        <p>ท่านสามารถตรวจสอบข้อมูลได้ที่ เมนู จัดการสมาชิก -> ข้อมูลสมาชิก บนเว็บไซต์</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://ftimemberportal-529sy.kinsta.app/" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 12px;">เข้าสู่ระบบ</a>
        </div>
        <p>หรือตรวจสอบข้อมูลสมาชิกได้ที่:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
          <a href="${memberSearchUrl}" style="color: #1a56db; text-decoration: none;">${memberSearchUrl}</a>
        </p>
        <p style="margin-top: 32px;">ขอขอบคุณท่านที่เข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย</p>
      `,
      }),
    ).setText(`
      ข้อมูลสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${name},
      
      บริษัท ${memberData.company_name}
      ${idTypeText} ${memberData.tax_id}
      ได้เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยเรียบร้อยแล้ว
      หมายเลขสมาชิก: ${memberData.member_code}
      
      ท่านสามารถตรวจสอบข้อมูลได้ที่ เมนู จัดการสมาชิก -> ข้อมูลสมาชิก บนเว็บไซต์
      https://ftimemberportal-529sy.kinsta.app/
      
      หรือตรวจสอบข้อมูลสมาชิกได้ที่:
      ${memberSearchUrl}
      
      ขอขอบคุณท่านที่เข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending member connection email:", error);
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("รีเซ็ตรหัสผ่านของคุณ - FTI Portal")
    .setHtml(
      getFTIEmailHtmlTemplate({
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
      `,
      }),
    ).setText(`
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
export async function sendApprovalEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  comment,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("การยืนยันตัวตนได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "แจ้งผลการอนุมัติยืนยันตัวตน",
        bodyContent: `
        <p>เรียน คุณ${fullName}</p>
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การยืนยันตัวตนของท่านได้รับการอนุมัติเรียบร้อยแล้ว</strong></p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
          <p style="margin: 0 0 10px 0;"><strong>ข้อมูลสมาชิก:</strong></p>
          <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
        </div>
        <p>ท่านสามารถตรวจสอบข้อมูลสมาชิกได้ที่ <strong>"ข้อมูลสมาชิก"</strong> บนแดชบอร์ดของท่าน</p>
        ${comment ? `<div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;"><p style="margin: 0;"><strong>ความคิดเห็นจากผู้ดูแลระบบ:</strong></p><p style=\"margin: 10px 0 0;\">${comment}</p></div>` : ""}
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
      `,
      }),
    ).setText(`
      การยืนยันตัวตนได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการยืนยันตัวตนของท่านได้รับการอนุมัติเรียบร้อยแล้ว
      
      ข้อมูลสมาชิก:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      ท่านสามารถตรวจสอบข้อมูลสมาชิกได้ที่ "ข้อมูลสมาชิก" บนแดชบอร์ดของท่าน
      
      ${comment ? `ความคิดเห็นจากผู้ดูแลระบบ: ${comment}` : ""}
      
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
export async function sendRejectionEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  rejectReason,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("แจ้งผลการพิจารณาการสมัครสมาชิก - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "แจ้งผลการพิจารณาการสมัครสมาชิก",
        bodyContent: `
        <p>เรียน คุณ${fullName}</p>
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การสมัครสมาชิกของท่านไม่ได้รับการอนุมัติ</strong></p>
        <div style=\"background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;\">
          <p style=\"margin: 0 0 10px 0;\"><strong>ข้อมูลการสมัครของท่าน:</strong></p>
          <p style=\"margin: 5px 0;\"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          <p style=\"margin: 5px 0;\"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
        </div>
        <div style=\"background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;\">
          <p style=\"margin: 0;\"><strong>เหตุผลที่ไม่ได้รับการอนุมัติ:</strong></p>
          <p style=\"margin: 10px 0 0;\">${rejectReason || "-"}</p>
        </div>
        <p>ท่านสามารถแก้ไขข้อมูลและส่งใบสมัครใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #4b5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
      `,
      }),
    ).setText(`
      แจ้งผลการพิจารณาการสมัครสมาชิก - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการสมัครสมาชิกของท่านไม่ได้รับการอนุมัติ
      
      ข้อมูลการสมัครของท่าน:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      เหตุผลที่ไม่ได้รับการอนุมัติ: ${rejectReason}
      
      ท่านสามารถแก้ไขข้อมูลและส่งใบสมัครใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      
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
export async function sendAddressApprovalEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  comment,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขที่อยู่ได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "แจ้งผลการพิจารณาคำขอแก้ไขที่อยู่",
        bodyContent: `
        <p>เรียน คุณ${fullName}</p>
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขที่อยู่ของท่านได้รับการอนุมัติแล้ว</strong></p>
        <div style=\"background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;\">
          <p style=\"margin: 0 0 10px 0;\"><strong>ข้อมูลที่ท่านยื่น:</strong></p>
          <p style=\"margin: 5px 0;\"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          <p style=\"margin: 5px 0;\"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
        </div>
        <div style=\"background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;\">
          <p style=\"margin: 0;\"><strong>สถานะ:</strong> ได้รับการอนุมัติแล้ว</p>
          ${comment ? `<p style=\"margin: 10px 0 0;\"><strong>ความคิดเห็นจากผู้ดูแลระบบ:</strong> ${comment}</p>` : ""}
        </div>
        <p>ข้อมูลที่อยู่ใหม่ของท่านได้ถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #4b5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
      `,
      }),
    ).setText(`
      คำขอแก้ไขที่อยู่ได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขที่อยู่ของท่านได้รับการอนุมัติแล้ว
      
      ข้อมูลที่ท่านยื่น:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      สถานะ: ได้รับการอนุมัติแล้ว
      ${comment ? `ความคิดเห็นจากผู้ดูแลระบบ: ${comment}` : ""}
      
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

export async function sendAddressRejectionEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  rejectReason,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  // Create base URL for login
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard`;

  // Use fullName for recipient
  const recipients = [new Recipient(email, fullName)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขที่อยู่ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "แจ้งผลการพิจารณาคำขอแก้ไขที่อยู่",
        bodyContent: `
        <p>เรียน คุณ${fullName}</p>
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขที่อยู่ของท่านไม่ได้รับการอนุมัติ</strong></p>
        <div style=\"background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;\">
          <p style=\"margin: 0 0 10px 0;\"><strong>ข้อมูลที่ท่านยื่น:</strong></p>
          <p style=\"margin: 5px 0;\"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          <p style=\"margin: 5px 0;\"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
        </div>
        <div style=\"background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;\">
          <p style=\"margin: 0;\"><strong>เหตุผลที่ไม่ได้รับการอนุมัติ:</strong></p>
          <p style=\"margin: 10px 0 0;\">${rejectReason || "-"}</p>
        </div>
        <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขที่อยู่ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">เข้าสู่ระบบ</a>
          <a href="${dashboardLink}" style="background-color: #4b5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ไปที่แดชบอร์ด</a>
        </div>
      `,
      }),
    ).setText(`
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
async function sendTsicApprovalEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  tsicDetails,
  comment = "",
) {
  if (!email || !memberCode) {
    throw new Error("Email and member code are required");
  }

  const fullName = `${firstname || ""} ${lastname || ""}`.trim();
  const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456"}/login`;
  const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456"}/member`;

  // Create sender
  const defaultSender = new Sender("noreply@fti.or.th", "สภาอุตสาหกรรมแห่งประเทศไทย");

  // Create recipients
  const recipients = [new Recipient(email, fullName)];

  // Create email params
  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขรหัส TSIC ได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "คำขอแก้ไขรหัส TSIC ได้รับการอนุมัติแล้ว",
        bodyContent: `
        <p>เรียน คุณ${fullName || "ผู้ใช้งาน"}</p>
        
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขรหัส TSIC ของท่านได้รับการอนุมัติเรียบร้อยแล้ว</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">รายละเอียดการอนุมัติ:</p>
          <p style="margin: 5px 0;">หมายเลขสมาชิก: <strong>${memberCode}</strong></p>
          <p style="margin: 5px 0;">ชื่อบริษัท: <strong>${companyName || "ไม่ระบุ"}</strong></p>
          <p style="margin: 5px 0;">รหัส TSIC ที่อนุมัติ: <strong>${tsicDetails || "ไม่ระบุ"}</strong></p>
          ${comment ? `<p style="margin: 5px 0;">ความคิดเห็นจากผู้ดูแลระบบ: <strong>${comment}</strong></p>` : ""}
        </div>
        
        <p>ท่านสามารถตรวจสอบข้อมูลรหัส TSIC ที่ได้รับการอนุมัติได้จากหน้ารายละเอียดสมาชิก</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${loginLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">เข้าสู่ระบบ</a>
        </div>
        
        <p>หรือเข้าสู่ระบบได้ที่: <a href="${loginLink}" style="color: #1a56db; text-decoration: underline;">${loginLink}</a></p>
        
        <p>หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <p>โทรศัพท์: 02-345-1000<br>
        อีเมล: <a href="mailto:member@fti.or.th" style="color: #1a56db; text-decoration: underline;">member@fti.or.th</a></p>
      `,
      }),
    );

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending TSIC approval email:", error);
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
async function sendTsicRejectionEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  tsicDetails,
  rejectReason,
) {
  if (!email || !memberCode || !rejectReason) {
    throw new Error("Email, member code, and rejection reason are required");
  }

  const fullName = `${firstname || ""} ${lastname || ""}`.trim();
  const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456"}/login`;
  const dashboardLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456"}/member`;

  // Create sender
  const defaultSender = new Sender("noreply@fti.or.th", "สภาอุตสาหกรรมแห่งประเทศไทย");

  // Create recipients
  const recipients = [new Recipient(email, fullName)];

  // Create email params
  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("คำขอแก้ไขรหัส TSIC ไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(
      getFTIEmailHtmlTemplate({
        title: "คำขอแก้ไขรหัส TSIC ไม่ได้รับการอนุมัติ",
        bodyContent: `
        <p>เรียน คุณ${fullName || "ผู้ใช้งาน"}</p>
        
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขรหัส TSIC ของท่านไม่ได้รับการอนุมัติ เนื่องจาก:</p>
        
        <div style="background-color: #fef2f2; border-right: 4px solid #f87171; padding: 12px 15px; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0; color: #dc2626; font-weight: bold;">${rejectReason || "ไม่ระบุเหตุผล"}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">รายละเอียดคำขอ:</p>
          <p style="margin: 5px 0;">หมายเลขสมาชิก: <strong>${memberCode}</strong></p>
          <p style="margin: 5px 0;">ชื่อบริษัท: <strong>${companyName || "ไม่ระบุ"}</strong></p>
          <p style="margin: 5px 0;">รหัส TSIC ที่ขอแก้ไข: <strong>${tsicDetails || "ไม่ระบุ"}</strong></p>
        </div>
        
        <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอแก้ไขรหัส TSIC ใหม่ได้จากหน้ารายละเอียดสมาชิก หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่เพื่อขอทราบเหตุผลและแนวทางแก้ไข</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${loginLink}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">เข้าสู่ระบบ</a>
        </div>
        
        <p>หรือเข้าสู่ระบบได้ที่: <a href="${loginLink}" style="color: #1a56db; text-decoration: underline;">${loginLink}</a></p>
        
        <p>หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
        <p>โทรศัพท์: 02-345-1000<br>
        อีเมล: <a href="mailto:member@fti.or.th" style="color: #1a56db; text-decoration: underline;">member@fti.or.th</a></p>
      `,
      }),
    );

  try {
    const response = await mailerSend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error("Error sending TSIC rejection email:", error);
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
  sendTsicRejectionEmail,
};
