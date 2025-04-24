-- สร้างตาราง pending_email_changes สำหรับเก็บข้อมูลการเปลี่ยนอีเมลที่รอการยืนยัน
CREATE TABLE IF NOT EXISTS pending_email_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  old_email VARCHAR(255),
  new_email VARCHAR(255) NOT NULL,
  token_id INT,
  otp VARCHAR(6),
  expires_at TIMESTAMP NULL,
  verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  admin_id INT,
  admin_note TEXT,
  status ENUM('pending', 'verified', 'cancelled', 'rejected') DEFAULT 'pending',
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (token_id) REFERENCES verification_tokens(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_id (token_id),
  INDEX idx_new_email (new_email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- อัปเดตตาราง verification_tokens เพื่อเพิ่มตัวเลือก 'new_email_verification' ในคอลัมน์ token_type
ALTER TABLE verification_tokens 
MODIFY COLUMN token_type ENUM('email_verification', 'password_reset', 'change_email', 'new_email_verification') DEFAULT 'email_verification';
