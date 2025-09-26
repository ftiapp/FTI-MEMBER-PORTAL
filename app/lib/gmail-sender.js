import nodemailer from 'nodemailer';

// สร้าง transporter สำหรับส่งอีเมลผ่าน Gmail
const createTransporter = () => {
  const emailSettings = {
    from: process.env.EMAIL_FROM || "noreply@gs1thailand.org",
    password: process.env.EMAIL_PASSWORD || "bywi dica focf asqx",
    senderName: process.env.EMAIL_SENDER_NAME || "GS1 Thailand",
    smtpServer: process.env.EMAIL_SMTP_SERVER || "smtp.gmail.com",
    smtpPort: process.env.EMAIL_SMTP_PORT || "587"
  };

  return nodemailer.createTransport({
    host: emailSettings.smtpServer,
    port: parseInt(emailSettings.smtpPort),
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailSettings.from,
      pass: emailSettings.password,
    },
    tls: {
      rejectUnauthorized: false // อนุญาตให้เชื่อมต่อกับเซิร์ฟเวอร์ที่ใช้ self-signed certificates
    }
  });
};

/**
 * ส่งอีเมลยืนยันการลงทะเบียน
 * @param {string} to - อีเมลผู้รับ
 * @param {string} name - ชื่อผู้รับ
 * @param {string} verificationLink - ลิงก์สำหรับยืนยันอีเมล
 * @returns {Promise<boolean>} ผลการส่งอีเมล
 */
export async function sendVerificationEmail(to, name, verificationLink) {
  try {
    const transporter = createTransporter();
    
    const emailSettings = {
      from: process.env.EMAIL_FROM || "noreply@gs1thailand.org",
      senderName: process.env.EMAIL_SENDER_NAME || "GS1 Thailand"
    };

    const info = await transporter.sendMail({
      from: `"${emailSettings.senderName}" <${emailSettings.from}>`,
      to: to,
      subject: "ยืนยันการลงทะเบียน",
      text: `สวัสดีคุณ ${name},\n\nกรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:\n${verificationLink}\n\nลิงก์นี้จะหมดอายุใน 15 นาที\n\nขอบคุณ,\n${emailSettings.senderName}`,
      html: `
        <div style="font-family: 'Sarabun', 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">ยืนยันการลงทะเบียน</h2>
          </div>
          <p>สวัสดีคุณ ${name},</p>
          <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">ยืนยันอีเมล</a>
          </div>
          <p>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์ของคุณ:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${verificationLink}
          </p>
          <p><strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุใน 15 นาที</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #777; font-size: 0.9em; text-align: center;">
            อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
          </p>
          <p style="color: #777; font-size: 0.9em; text-align: center;">
            &copy; ${new Date().getFullYear()} ${emailSettings.senderName}
          </p>
        </div>
      `
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * ส่งอีเมลแจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่
 * @param {string} to - อีเมลผู้รับ
 * @param {string} name - ชื่อผู้รับ
 * @param {object} deviceInfo - ข้อมูลอุปกรณ์
 * @returns {Promise<boolean>} ผลการส่งอีเมล
 */
export async function sendLoginNotificationEmail(to, name, deviceInfo) {
  try {
    const transporter = createTransporter();
    
    const emailSettings = {
      from: process.env.EMAIL_FROM || "noreply@gs1thailand.org",
      senderName: process.env.EMAIL_SENDER_NAME || "GS1 Thailand"
    };

    const info = await transporter.sendMail({
      from: `"${emailSettings.senderName}" <${emailSettings.from}>`,
      to: to,
      subject: "การเข้าสู่ระบบจากอุปกรณ์ใหม่",
      text: `สวัสดีคุณ ${name},\n\nเราตรวจพบการเข้าสู่ระบบจากอุปกรณ์ใหม่:\n\nเวลา: ${deviceInfo.time}\nอุปกรณ์: ${deviceInfo.device}\nตำแหน่ง: ${deviceInfo.location}\n\nหากไม่ใช่คุณ กรุณาเปลี่ยนรหัสผ่านทันที\n\nขอบคุณ,\n${emailSettings.senderName}`,
      html: `
        <div style="font-family: 'Sarabun', 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">การเข้าสู่ระบบจากอุปกรณ์ใหม่</h2>
          </div>
          <p>สวัสดีคุณ ${name},</p>
          <p>เราตรวจพบการเข้าสู่ระบบจากอุปกรณ์ใหม่:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>เวลา:</strong> ${deviceInfo.time}</p>
            <p><strong>อุปกรณ์:</strong> ${deviceInfo.device}</p>
            <p><strong>ตำแหน่ง:</strong> ${deviceInfo.location}</p>
          </div>
          <p>หากไม่ใช่คุณ กรุณา<a href="#" style="color: #4CAF50; font-weight: bold;">เปลี่ยนรหัสผ่านทันที</a></p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #777; font-size: 0.9em; text-align: center;">
            อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ
          </p>
          <p style="color: #777; font-size: 0.9em; text-align: center;">
            &copy; ${new Date().getFullYear()} ${emailSettings.senderName}
          </p>
        </div>
      `
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export default {
  sendVerificationEmail,
  sendLoginNotificationEmail
};
