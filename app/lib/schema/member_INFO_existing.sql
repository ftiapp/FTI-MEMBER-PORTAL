-- สร้างตาราง member_INFO_existing เพื่อเก็บข้อมูลสมาชิกเดิมที่ยืนยันแล้ว
CREATE TABLE IF NOT EXISTS member_INFO_existing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  MEMBER_CODE VARCHAR(100) NOT NULL,
  REGIST_CODE VARCHAR(100),
  MEMBER_TYPE_CODE VARCHAR(50),
  MEMBER_STATUS_CODE VARCHAR(50),
  COMP_PERSON_CODE VARCHAR(100),
  TAX_ID VARCHAR(20),
  COMPANY_NAME VARCHAR(255),
  COMP_PERSON_NAME_EN VARCHAR(255),
  ProductDesc_TH TEXT,
  ProductDesc_EN TEXT,
  admin_id INT NOT NULL,
  admin_username VARCHAR(100),
  verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id),
  FOREIGN KEY (admin_id) REFERENCES FTI_Portal_Admin_Users(id)
);

-- สร้าง index เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX idx_member_info_user_id ON member_INFO_existing(user_id);
CREATE INDEX idx_member_info_member_code ON member_INFO_existing(MEMBER_CODE);
CREATE INDEX idx_member_info_admin_id ON member_INFO_existing(admin_id);
