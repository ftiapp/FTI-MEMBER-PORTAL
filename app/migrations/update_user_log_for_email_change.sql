-- อัปเดตคอลัมน์ action ในตาราง FTI_Portal_User_Logs เพื่อเพิ่มตัวเลือก 'change_email'
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action ENUM('member_verification', 'document_upload', 'profile_update', 'other', 'contact_message', 'profile_update_request', 'change_email') NOT NULL;

-- เพิ่มคอลัมน์ old_value และ new_value เพื่อเก็บข้อมูลค่าเก่าและค่าใหม่ (ตัวเลือกเพิ่มเติม)
-- ALTER TABLE FTI_Portal_User_Logs 
-- ADD COLUMN old_value VARCHAR(255) AFTER action,
-- ADD COLUMN new_value VARCHAR(255) AFTER old_value;

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
ALTER TABLE FTI_Portal_User_Logs
ADD INDEX idx_user_id_action (user_id, action);

-- อัปเดตคำอธิบายตาราง
ALTER TABLE FTI_Portal_User_Logs COMMENT 'เก็บประวัติการทำรายการต่างๆ ของผู้ใช้ รวมถึงการเปลี่ยนอีเมล';
