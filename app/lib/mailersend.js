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

  
  

  const recipients = [new Recipient(email, name)];

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
      
      เรียน คุณ${name}
      
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

  
  

  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(defaultSender)
    .setTo(recipients)
    .setSubject("การยืนยันตัวตนไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย")
    .setHtml(`
      <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <link href='https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&display=swap' rel='stylesheet'>
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/FTI-MasterLogo_RGB_forLightBG.png" alt="สภาอุตสาหกรรมแห่งประเทศไทย" style="max-width: 200px; margin-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin-top: 0;">แจ้งผลการตรวจสอบยืนยันตัวตน</h1>
        </div>
        <div style="margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การยืนยันตัวตนของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0;"><strong>ข้อมูลที่ท่านยื่น:</strong></p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>เหตุผลที่ไม่ได้รับการอนุมัติ:</strong></p>
            <p style="margin: 10px 0 0;">${rejectReason || '-'}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอยืนยันตัวตนใหม่ได้จากแดชบอร์ดของท่าน หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
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
      การยืนยันตัวตนไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${name}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการยืนยันตัวตนของท่านไม่ได้รับการอนุมัติ
      
      ข้อมูลที่ท่านยื่น:
      หมายเลขสมาชิก: ${memberCode}
      ชื่อบริษัท: ${companyName}
      
      เหตุผลที่ไม่ได้รับการอนุมัติ: ${reason}
      
      ท่านสามารถแก้ไขข้อมูลและส่งคำขอยืนยันตัวตนใหม่ได้จากแดชบอร์ดของท่าน หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      
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
