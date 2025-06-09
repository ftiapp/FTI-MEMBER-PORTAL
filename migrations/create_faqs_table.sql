-- Create faqs table for FAQ Bot
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add some initial FAQ data
INSERT INTO faqs (question, answer, keywords, category) VALUES
('ฉันจะสมัครสมาชิกได้อย่างไร?', 'คุณสามารถสมัครสมาชิกได้โดยคลิกที่ปุ่ม "สมัครสมาชิก" ที่หน้าแรกของเว็บไซต์ แล้วกรอกข้อมูลตามที่ระบบร้องขอ', 'สมัคร,สมาชิก,ลงทะเบียน,register', 'การสมัครสมาชิก'),
('ฉันลืมรหัสผ่าน ต้องทำอย่างไร?', 'คุณสามารถรีเซ็ตรหัสผ่านได้โดยคลิกที่ลิงก์ "ลืมรหัสผ่าน" ที่หน้าล็อกอิน ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลที่คุณลงทะเบียนไว้', 'ลืม,รหัสผ่าน,password,reset,รีเซ็ต', 'บัญชีผู้ใช้'),
('ฉันจะแก้ไขข้อมูลส่วนตัวได้อย่างไร?', 'หลังจากล็อกอินเข้าสู่ระบบแล้ว คุณสามารถแก้ไขข้อมูลส่วนตัวได้โดยไปที่เมนู "โปรไฟล์" หรือ "ข้อมูลส่วนตัว" ในแดชบอร์ด', 'แก้ไข,ข้อมูล,โปรไฟล์,profile,ส่วนตัว', 'บัญชีผู้ใช้');
