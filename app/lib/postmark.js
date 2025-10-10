import * as postmark from "postmark";
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
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
        `,
      }),
      TextBody: `
        ยืนยันอีเมลของคุณ - FTI Portal
        
        สวัสดี ${name},
        
        ขอบคุณที่ลงทะเบียนกับ FTI Portal กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:
        
        ${verificationLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
        
        © 2025 FTI Portal. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
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
        `,
      }),
      TextBody: `
        คำเชิญเป็นผู้ดูแลระบบ FTI Portal

        ท่านได้รับคำเชิญให้เป็นผู้ดูแลระบบ (Admin Level ${adminLevel})
        โปรดเปิดลิงก์เพื่อตั้งรหัสผ่าน: ${acceptLink}

        ลิงก์นี้มีอายุ 24 ชั่วโมง
      `,
      MessageStream: "outbound",
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
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
        `,
      }),
      TextBody: `
        ยืนยันอีเมลใหม่ของคุณ - FTI Portal
        
        สวัสดี ${name},
        
        คุณได้ขอเปลี่ยนอีเมลของคุณใน FTI Portal กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลใหม่ของคุณ:
        
        ${verificationLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
      `,
      MessageStream: "outbound",
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
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
        `,
      }),
      TextBody: `
        รีเซ็ตรหัสผ่านของคุณ - FTI Portal
        
        สวัสดี ${name},
        
        เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
        
        ${resetLink}
        
        หากคุณไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้
        
        ลิงก์นี้จะหมดอายุใน 15 นาที
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

/**
 * Send membership application confirmation email
 * @param {string} email - Applicant's email address
 * @param {string} name - Applicant's name
 * @param {string} membershipType - Type of membership (OC, AC, IC, AM)
 * @param {string} companyName - Company/Association name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendMembershipConfirmationEmail(email, name, membershipType, companyName) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const statusUrl = `${baseUrl}/member/dashboard`;

  // Map membership type to Thai name
  const membershipTypeMap = {
    OC: "สามัญ (นิติบุคคล)",
    AC: "สมทบ (นิติบุคคล)",
    IC: "สามัญ (บุคคลธรรมดา)",
    AM: "สมาคม",
  };

  const membershipTypeThai = membershipTypeMap[membershipType] || membershipType;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: `แจ้งการสมัครสมาชิก${membershipTypeThai} - FTI Portal`,
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "แจ้งการสมัครสมาชิกสำเร็จ",
        bodyContent: `
          <p>เรียน ${name},</p>
          <p>ขอบคุณที่ท่านได้ทำการสมัครสมาชิกกับสภาอุตสาหกรรมแห่งประเทศไทย</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #1a56db; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0;"><strong>ประเภทสมาชิก:</strong> ${membershipTypeThai}</p>
            <p style="margin: 0;"><strong>ชื่อบริษัท/สมาคม:</strong> ${companyName}</p>
          </div>

          <p><strong>ท่านจะได้รับการพิจารณาอนุมัติภายใน 3-5 วันทำการ</strong></p>
          
          <p>ท่านสามารถติดตามความคืบหน้าได้ที่:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${statusUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">ติดตามสถานะดำเนินการ</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">หรือเข้าไปที่เมนู <strong>"สถานะดำเนินการ"</strong> ในเมนู <strong>"จัดการสมาชิก"</strong></p>
          
          <p style="margin-top: 32px;">หากมีข้อสงสัยประการใด กรุณาติดต่อ:</p>
          <p style="margin: 8px 0;">
            📞 CALL CENTER: <strong>1453 กด 2</strong><br/>
            📧 E-MAIL: <strong>member@fti.or.th</strong>
          </p>
        `,
      }),
      TextBody: `
        แจ้งการสมัครสมาชิกสำเร็จ - FTI Portal
        
        เรียน ${name},
        
        ขอบคุณที่ท่านได้ทำการสมัครสมาชิกกับสภาอุตสาหกรรมแห่งประเทศไทย
        
        ประเภทสมาชิก: ${membershipTypeThai}
        ชื่อบริษัท/สมาคม: ${companyName}
        
        ท่านจะได้รับการพิจารณาอนุมัติภายใน 3-5 วันทำการ
        
        ท่านสามารถติดตามความคืบหน้าได้ที่: ${statusUrl}
        หรือเข้าไปที่เมนู "สถานะดำเนินการ" ในเมนู "จัดการสมาชิก"
        
        หากมีข้อสงสัยประการใด กรุณาติดต่อ:
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 FTI Portal. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending membership confirmation email:", error);
    throw error;
  }
}

/**
 * Send address update request confirmation email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} addrType - Address type (001, 002, 003)
 * @param {string} addrLang - Address language (th, en)
 * @returns {Promise} - Promise with email sending result
 */
export async function sendAddressUpdateRequestEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  addrType,
  addrLang,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard`;

  // Map address type to Thai name
  const addrTypeMap = {
    "001": "ที่อยู่สำหรับติดต่อ",
    "002": "ที่อยู่สำหรับจัดส่งเอกสาร",
    "003": "ที่อยู่สำหรับออกใบกำกับภาษี",
  };
  const addrTypeName = addrTypeMap[addrType] || "ที่อยู่";
  const langName = addrLang === "en" ? "ภาษาอังกฤษ" : "ภาษาไทย";

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "ยืนยันการส่งคำขอแก้ไขที่อยู่ - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันการส่งคำขอแก้ไขที่อยู่",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขที่อยู่ของท่านได้รับการบันทึกเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
              รายละเอียดคำขอ:
            </p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>ประเภทที่อยู่:</strong> ${addrTypeName} (${langName})</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 14px 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 15px;">
              <strong>⏱️ ระยะเวลาในการพิจารณา:</strong> เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา <strong>1-2 วันทำการ</strong>
            </p>
          </div>
          
          <p>ท่านสามารถตรวจสอบสถานะคำขอได้ที่หน้า <strong>"ข้อมูลสมาชิก"</strong> ในแดชบอร์ดของท่าน</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ไปที่แดชบอร์ด
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        ยืนยันการส่งคำขอแก้ไขที่อยู่ - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขที่อยู่ของท่านได้รับการบันทึกเรียบร้อยแล้ว
        
        รายละเอียดคำขอ:
        หมายเลขสมาชิก: ${memberCode}
        ชื่อบริษัท: ${companyName}
        ประเภทที่อยู่: ${addrTypeName} (${langName})
        
        ระยะเวลาในการพิจารณา: เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา 1-2 วันทำการ
        
        ท่านสามารถตรวจสอบสถานะคำขอได้ที่หน้า "ข้อมูลสมาชิก" ในแดชบอร์ดของท่าน
        
        ไปที่แดชบอร์ด: ${dashboardLink}
        
        หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending address update request email:", error);
    throw error;
  }
}

/**
 * Send existing member verification confirmation email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {Array} companies - Array of company objects with memberCode and companyName
 * @returns {Promise} - Promise with email sending result
 */
export async function sendExistingMemberVerificationEmail(
  email,
  firstname,
  lastname,
  companies = [],
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const loginLink = `${baseUrl}/login`;
  const dashboardLink = `${baseUrl}/dashboard?tab=wasmember`;

  // Create company list HTML
  const companyListHtml = companies
    .map(
      (company, index) => `
    <div style="background-color: #f9fafb; padding: 12px 16px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #1a56db;">
      <p style="margin: 0 0 5px 0; font-weight: 600; color: #1f2937;">
        ${index + 1}. ${company.companyName || "ไม่ระบุชื่อบริษัท"}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        หมายเลขสมาชิก: <strong>${company.memberCode || "ไม่ระบุ"}</strong>
      </p>
    </div>
  `,
    )
    .join("");

  // Create company list plain text
  const companyListText = companies
    .map(
      (company, index) =>
        `${index + 1}. ${company.companyName || "ไม่ระบุชื่อบริษัท"} (หมายเลขสมาชิก: ${company.memberCode || "ไม่ระบุ"})`,
    )
    .join("\n");

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "ยืนยันการส่งข้อมูลยืนยันสมาชิกเดิม - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันการส่งข้อมูลยืนยันสมาชิกเดิม",
        bodyContent: `
        <p>เรียน คุณ${fullName}</p>
        
        <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>ท่านได้ทำการยืนยันสมาชิกเดิมภายในบัญชีของท่านเรียบร้อยแล้ว</strong></p>
        
        <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
            รายชื่อสมาชิกที่ยื่นขอยืนยัน:
          </p>
          ${companyListHtml}
        </div>
        
        <div style="background-color: #fef3c7; padding: 14px 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 15px;">
            <strong>⏱️ ระยะเวลาในการพิจารณา:</strong> เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา <strong>1-2 วันทำการ</strong>
          </p>
        </div>
        
        <p>ท่านสามารถตรวจสอบสถานะการยืนยันได้ที่เมนู <strong>"ยืนยันสมาชิกเดิม"</strong> ในแดชบอร์ดของท่าน</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
            ตรวจสอบสถานะ
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        </p>
      `,
      }),
      TextBody: `
      ยืนยันการส่งข้อมูลยืนยันสมาชิกเดิม - สภาอุตสาหกรรมแห่งประเทศไทย
      
      เรียน คุณ${fullName}
      
      สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าท่านได้ทำการยืนยันสมาชิกเดิมภายในบัญชีของท่านเรียบร้อยแล้ว
      
      รายชื่อสมาชิกที่ยื่นขอยืนยัน:
      ${companyListText}
      
      ระยะเวลาในการพิจารณา: เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา 1-2 วันทำการ
      
      ท่านสามารถตรวจสอบสถานะการยืนยันได้ที่เมนู "ยืนยันสมาชิกเดิม" ในแดชบอร์ดของท่าน
      
      ตรวจสอบสถานะได้ที่: ${dashboardLink}
      เข้าสู่ระบบได้ที่: ${loginLink}
      
      หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
      CALL CENTER: 1453 กด 2
      E-MAIL: member@fti.or.th
      
      © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
    `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending existing member verification email:", error);
    throw error;
  }
}

/**
 * Send existing member verification approval email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendExistingMemberApprovalEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=member`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "การยืนยันสมาชิกเดิมได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "การยืนยันสมาชิกเดิมได้รับการอนุมัติแล้ว",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การยืนยันสมาชิกเดิมของท่านได้รับการอนุมัติเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #16a34a; font-size: 16px;">
              ข้อมูลสมาชิก:
            </p>
            <p style="margin: 5px 0;"><strong>บริษัท:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          </div>
          
          <p>ท่านสามารถตรวจสอบข้อมูลสมาชิกได้ที่ เมนู <strong>จัดการสมาชิก → ข้อมูลสมาชิก</strong> บนเว็บไซต์</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ตรวจสอบข้อมูลสมาชิก
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        การยืนยันสมาชิกเดิมได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการยืนยันสมาชิกเดิมของท่านได้รับการอนุมัติเรียบร้อยแล้ว
        
        ข้อมูลสมาชิก:
        บริษัท: ${companyName}
        หมายเลขสมาชิก: ${memberCode}
        
        ท่านสามารถตรวจสอบข้อมูลสมาชิกได้ที่ เมนู จัดการสมาชิก → ข้อมูลสมาชิก บนเว็บไซต์
        
        ตรวจสอบข้อมูลสมาชิก: ${dashboardLink}
        
        หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending existing member approval email:", error);
    throw error;
  }
}

/**
 * Send existing member rejection email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} rejectReason - Rejection reason
 * @returns {Promise} - Promise with email sending result
 */
export async function sendExistingMemberRejectionEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  rejectReason,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=wasmember`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "การยืนยันสมาชิกเดิมไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "การยืนยันสมาชิกเดิมไม่ได้รับการอนุมัติ",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การยืนยันสมาชิกเดิมของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
              ข้อมูลที่ท่านยื่น:
            </p>
            <p style="margin: 5px 0;"><strong>บริษัท:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc2626; font-size: 16px;">
              เหตุผลที่ไม่ได้รับการอนุมัติ:
            </p>
            <p style="margin: 0; color: #374151;">${rejectReason || "ไม่ระบุเหตุผล"}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ไปที่แดชบอร์ด
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        การยืนยันสมาชิกเดิมไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการยืนยันสมาชิกเดิมของท่านไม่ได้รับการอนุมัติ
        
        ข้อมูลที่ท่านยื่น:
        บริษัท: ${companyName}
        หมายเลขสมาชิก: ${memberCode}
        
        เหตุผลที่ไม่ได้รับการอนุมัติ: ${rejectReason || "ไม่ระบุเหตุผล"}
        
        ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        
        ไปที่แดชบอร์ด: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending existing member rejection email:", error);
    throw error;
  }
}

/**
 * Send profile update request confirmation email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendProfileUpdateRequestEmail(email, firstname, lastname) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=updatemember`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "ยืนยันการส่งคำขอแก้ไขข้อมูลส่วนตัว - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันการส่งคำขอแก้ไขข้อมูลส่วนตัว",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>ท่านได้ทำการขอแก้ไขข้อมูลส่วนตัว (ชื่อ-นามสกุล) เรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #fef3c7; padding: 14px 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 15px;">
              <strong>⏱️ ระยะเวลาในการพิจารณา:</strong> เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา <strong>1-2 วันทำการ</strong>
            </p>
          </div>
          
          <p>ท่านสามารถตรวจสอบสถานะคำขอได้ที่หน้า <strong>"แก้ไขข้อมูลส่วนตัว"</strong> ในแดชบอร์ดของท่าน</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ตรวจสอบสถานะ
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        ยืนยันการส่งคำขอแก้ไขข้อมูลส่วนตัว - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าท่านได้ทำการขอแก้ไขข้อมูลส่วนตัว (ชื่อ-นามสกุล) เรียบร้อยแล้ว
        
        ระยะเวลาในการพิจารณา: เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา 1-2 วันทำการ
        
        ท่านสามารถตรวจสอบสถานะคำขอได้ที่หน้า "แก้ไขข้อมูลส่วนตัว" ในแดชบอร์ดของท่าน
        
        ตรวจสอบสถานะ: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending profile update request email:", error);
    throw error;
  }
}

/**
 * Send profile update approval email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendProfileUpdateApprovalEmail(email, firstname, lastname) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=updatemember`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "คำขอแก้ไขข้อมูลส่วนตัวได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "คำขอแก้ไขข้อมูลส่วนตัวได้รับการอนุมัติแล้ว",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขข้อมูลส่วนตัวของท่านได้รับการอนุมัติเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0; font-weight: 600; color: #16a34a; font-size: 16px;">
              ✓ ข้อมูลของท่านได้รับการอัปเดตเรียบร้อยแล้ว
            </p>
          </div>
          
          <p>ท่านสามารถตรวจสอบข้อมูลที่อัปเดตได้ที่หน้า <strong>"แก้ไขข้อมูลส่วนตัว"</strong> ในแดชบอร์ดของท่าน</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ดูข้อมูลที่อัปเดต
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        คำขอแก้ไขข้อมูลส่วนตัวได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขข้อมูลส่วนตัวของท่านได้รับการอนุมัติเรียบร้อยแล้ว
        
        ข้อมูลของท่านได้รับการอัปเดตเรียบร้อยแล้ว
        
        ท่านสามารถตรวจสอบข้อมูลที่อัปเดตได้ที่หน้า "แก้ไขข้อมูลส่วนตัว" ในแดชบอร์ดของท่าน
        
        ดูข้อมูลที่อัปเดต: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending profile update approval email:", error);
    throw error;
  }
}

/**
 * Send profile update rejection email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} rejectReason - Rejection reason
 * @returns {Promise} - Promise with email sending result
 */
export async function sendProfileUpdateRejectionEmail(email, firstname, lastname, rejectReason) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=updatemember`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "คำขอแก้ไขข้อมูลส่วนตัวไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "คำขอแก้ไขข้อมูลส่วนตัวไม่ได้รับการอนุมัติ",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขข้อมูลส่วนตัวของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc2626; font-size: 16px;">
              เหตุผลที่ไม่ได้รับการอนุมัติ:
            </p>
            <p style="margin: 0; color: #374151;">${rejectReason || "ไม่ระบุเหตุผล"}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ไปที่แดชบอร์ด
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        คำขอแก้ไขข้อมูลส่วนตัวไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขข้อมูลส่วนตัวของท่านไม่ได้รับการอนุมัติ
        
        เหตุผลที่ไม่ได้รับการอนุมัติ: ${rejectReason || "ไม่ระบุเหตุผล"}
        
        ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        
        ไปที่แดชบอร์ด: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending profile update rejection email:", error);
    throw error;
  }
}

/**
 * Send product update request confirmation email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendProductUpdateRequestEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=status`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "ยืนยันการส่งคำขอแก้ไขข้อมูลสินค้า - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "ยืนยันการส่งคำขอแก้ไขข้อมูลสินค้า",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขข้อมูลสินค้าของท่านได้รับการบันทึกเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
              รายละเอียดคำขอ:
            </p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 14px 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 15px;">
              <strong>⏱️ ระยะเวลาในการพิจารณา:</strong> เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา <strong>1-2 วันทำการ</strong>
            </p>
          </div>
          
          <p>ท่านสามารถตรวจสอบสถานะคำขอได้ที่หน้า <strong>"ตรวจสอบสถานะการดำเนินการ"</strong> ในแดชบอร์ดของท่าน</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ตรวจสอบสถานะ
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        ยืนยันการส่งคำขอแก้ไขข้อมูลสินค้า - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขข้อมูลสินค้าของท่านได้รับการบันทึกเรียบร้อยแล้ว
        
        รายละเอียดคำขอ:
        หมายเลขสมาชิก: ${memberCode}
        ชื่อบริษัท: ${companyName}
        
        ระยะเวลาในการพิจารณา: เจ้าหน้าที่จะใช้เวลาในการตรวจสอบและพิจารณา 1-2 วันทำการ
        
        ท่านสามารถตรวจสอบสถานะคำขอได้ที่หน้า "ตรวจสอบสถานะการดำเนินการ" ในแดชบอร์ดของท่าน
        
        ตรวจสอบสถานะ: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending product update request email:", error);
    throw error;
  }
}

/**
 * Send product update approval email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @returns {Promise} - Promise with email sending result
 */
export async function sendProductUpdateApprovalEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const memberDetailLink = `${baseUrl}/MemberDetail?memberCode=${encodeURIComponent(memberCode)}`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "คำขอแก้ไขข้อมูลสินค้าได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "คำขอแก้ไขข้อมูลสินค้าได้รับการอนุมัติแล้ว",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขข้อมูลสินค้าของท่านได้รับการอนุมัติเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #16a34a; font-size: 16px;">
              รายละเอียด:
            </p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0; font-weight: 600; color: #16a34a; font-size: 16px;">
              ✓ ข้อมูลสินค้าของท่านได้รับการอัปเดตเรียบร้อยแล้ว
            </p>
          </div>
          
          <p>ท่านสามารถตรวจสอบข้อมูลสินค้าที่อัปเดตได้ที่หน้า <strong>"ข้อมูลสมาชิก"</strong></p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${memberDetailLink}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ดูข้อมูลสินค้า
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        คำขอแก้ไขข้อมูลสินค้าได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขข้อมูลสินค้าของท่านได้รับการอนุมัติเรียบร้อยแล้ว
        
        รายละเอียด:
        หมายเลขสมาชิก: ${memberCode}
        ชื่อบริษัท: ${companyName}
        
        ข้อมูลสินค้าของท่านได้รับการอัปเดตเรียบร้อยแล้ว
        
        ท่านสามารถตรวจสอบข้อมูลสินค้าที่อัปเดตได้ที่หน้า "ข้อมูลสมาชิก"
        
        ดูข้อมูลสินค้า: ${memberDetailLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending product update approval email:", error);
    throw error;
  }
}

/**
 * Send product update rejection email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} rejectReason - Rejection reason
 * @returns {Promise} - Promise with email sending result
 */
export async function sendProductUpdateRejectionEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  rejectReason,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=status`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "คำขอแก้ไขข้อมูลสินค้าไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "คำขอแก้ไขข้อมูลสินค้าไม่ได้รับการอนุมัติ",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>คำขอแก้ไขข้อมูลสินค้าของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
              รายละเอียด:
            </p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
            <p style="margin: 5px 0;"><strong>ชื่อบริษัท:</strong> ${companyName}</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc2626; font-size: 16px;">
              เหตุผลที่ไม่ได้รับการอนุมัติ:
            </p>
            <p style="margin: 0; color: #374151;">${rejectReason || "ไม่ระบุเหตุผล"}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ไปที่แดชบอร์ด
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        คำขอแก้ไขข้อมูลสินค้าไม่ได้รับการอนุมัติ - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าคำขอแก้ไขข้อมูลสินค้าของท่านไม่ได้รับการอนุมัติ
        
        รายละเอียด:
        หมายเลขสมาชิก: ${memberCode}
        ชื่อบริษัท: ${companyName}
        
        เหตุผลที่ไม่ได้รับการอนุมัติ: ${rejectReason || "ไม่ระบุเหตุผล"}
        
        ท่านสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        
        ไปที่แดชบอร์ด: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending product update rejection email:", error);
    throw error;
  }
}

/**
 * Send membership application approval email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code
 * @param {string} companyName - Company name
 * @param {string} comment - Admin comment (optional)
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard?tab=member`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "การสมัครสมาชิกได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "การสมัครสมาชิกได้รับการอนุมัติแล้ว",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การสมัครสมาชิกของท่านได้รับการอนุมัติเรียบร้อยแล้ว</strong></p>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #16a34a; font-size: 16px;">
              ข้อมูลสมาชิก:
            </p>
            <p style="margin: 5px 0;"><strong>บริษัท:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>
          </div>
          
          ${
            comment
              ? `
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
              ข้อความจากเจ้าหน้าที่:
            </p>
            <p style="margin: 0; color: #374151;">${comment}</p>
          </div>
          `
              : ""
          }
          
          <p>ท่านสามารถเข้าสู่ระบบและดูข้อมูลสมาชิกได้ที่แดชบอร์ดของท่าน</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ไปที่แดชบอร์ด
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            ขอบคุณที่เป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        การสมัครสมาชิกได้รับการอนุมัติแล้ว - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการสมัครสมาชิกของท่านได้รับการอนุมัติเรียบร้อยแล้ว
        
        ข้อมูลสมาชิก:
        บริษัท: ${companyName}
        หมายเลขสมาชิก: ${memberCode}
        
        ${comment ? `ข้อความจากเจ้าหน้าที่: ${comment}\n` : ""}
        ท่านสามารถเข้าสู่ระบบและดูข้อมูลสมาชิกได้ที่แดชบอร์ดของท่าน
        
        ไปที่แดชบอร์ด: ${dashboardLink}
        
        ขอบคุณที่เป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw error;
  }
}

/**
 * Send membership application rejection email
 * @param {string} email - User's email address
 * @param {string} firstname - User's first name
 * @param {string} lastname - User's last name
 * @param {string} memberCode - Member code (if available)
 * @param {string} companyName - Company name
 * @param {string} reason - Rejection reason
 * @returns {Promise} - Promise with email sending result
 */
export async function sendRejectionEmail(
  email,
  firstname,
  lastname,
  memberCode,
  companyName,
  reason,
) {
  const fullName = `${firstname} ${lastname}`.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3456";
  const dashboardLink = `${baseUrl}/dashboard`;

  try {
    const response = await client.sendEmail({
      From: defaultSender,
      To: email,
      Subject: "แจ้งผลการพิจารณาการสมัครสมาชิก - สภาอุตสาหกรรมแห่งประเทศไทย",
      HtmlBody: getFTIEmailHtmlTemplate({
        title: "แจ้งผลการพิจารณาการสมัครสมาชิก",
        bodyContent: `
          <p>เรียน คุณ${fullName}</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่า <strong>การสมัครสมาชิกของท่านไม่ได้รับการอนุมัติ</strong></p>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a; font-size: 16px;">
              ข้อมูลที่ท่านยื่น:
            </p>
            <p style="margin: 5px 0;"><strong>บริษัท:</strong> ${companyName}</p>
            ${memberCode ? `<p style="margin: 5px 0;"><strong>หมายเลขสมาชิก:</strong> ${memberCode}</p>` : ""}
          </div>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc2626; font-size: 16px;">
              เหตุผลที่ไม่ได้รับการอนุมัติ:
            </p>
            <p style="margin: 0; color: #374151;">${reason || "ไม่ระบุเหตุผล"}</p>
          </div>
          
          <p>ท่านสามารถแก้ไขข้อมูลและส่งใบสมัครใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${dashboardLink}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              ไปที่แดชบอร์ด
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        `,
      }),
      TextBody: `
        แจ้งผลการพิจารณาการสมัครสมาชิก - สภาอุตสาหกรรมแห่งประเทศไทย
        
        เรียน คุณ${fullName}
        
        สภาอุตสาหกรรมแห่งประเทศไทย ขอเรียนแจ้งให้ท่านทราบว่าการสมัครสมาชิกของท่านไม่ได้รับการอนุมัติ
        
        ข้อมูลที่ท่านยื่น:
        บริษัท: ${companyName}
        ${memberCode ? `หมายเลขสมาชิก: ${memberCode}` : ""}
        
        เหตุผลที่ไม่ได้รับการอนุมัติ: ${reason || "ไม่ระบุเหตุผล"}
        
        ท่านสามารถแก้ไขข้อมูลและส่งใบสมัครใหม่ได้ หากมีข้อสงสัยประการใด กรุณาติดต่อเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย
        
        ไปที่แดชบอร์ด: ${dashboardLink}
        
        CALL CENTER: 1453 กด 2
        E-MAIL: member@fti.or.th
        
        © 2025 สภาอุตสาหกรรมแห่งประเทศไทย. สงวนลิขสิทธิ์.
      `,
      MessageStream: "outbound",
    });
    return response;
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
}
