-- เพิ่ม column admin_id, admin_name, admin_comment และ reject_reason ในตาราง companies_Member
ALTER TABLE companies_Member 
ADD COLUMN admin_id INT NULL,
ADD COLUMN admin_name VARCHAR(255) NULL,
ADD COLUMN admin_comment TEXT NULL,
ADD COLUMN reject_reason TEXT NULL,
ADD FOREIGN KEY (admin_id) REFERENCES admin_users(id);

-- เพิ่ม index เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX idx_companies_member_admin_id ON companies_Member(admin_id);

-- ตรวจสอบว่ามี column admin_comment แล้วหรือไม่ ถ้ายังไม่มีให้เพิ่ม
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'companies_Member' 
               AND COLUMN_NAME = 'admin_comment' 
               AND TABLE_SCHEMA = DATABASE());
               
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE companies_Member ADD COLUMN admin_comment TEXT NULL', 'SELECT "Column admin_comment already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ตรวจสอบว่ามี column reject_reason แล้วหรือไม่ ถ้ายังไม่มีให้เพิ่ม
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'companies_Member' 
               AND COLUMN_NAME = 'reject_reason' 
               AND TABLE_SCHEMA = DATABASE());
               
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE companies_Member ADD COLUMN reject_reason TEXT NULL', 'SELECT "Column reject_reason already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
