-- อัปเดตคอลัมน์ action ในตาราง Member_portal_User_log เพื่อเพิ่มตัวเลือก 'change_email'
ALTER TABLE Member_portal_User_log 
MODIFY COLUMN action ENUM('member_verification', 'document_upload', 'profile_update', 'other', 'contact_message', 'profile_update_request', 'change_email') NOT NULL;

-- เพิ่มคอลัมน์ old_value และ new_value เพื่อเก็บข้อมูลค่าเก่าและค่าใหม่ (ตัวเลือกเพิ่มเติม)
-- ALTER TABLE Member_portal_User_log 
-- ADD COLUMN old_value VARCHAR(255) AFTER action,
-- ADD COLUMN new_value VARCHAR(255) AFTER old_value;

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
ALTER TABLE Member_portal_User_log
ADD INDEX idx_user_id_action (user_id, action);

-- อัปเดตคำอธิบายตาราง
ALTER TABLE Member_portal_User_log COMMENT 'เก็บประวัติการทำรายการต่างๆ ของผู้ใช้ รวมถึงการเปลี่ยนอีเมล';
