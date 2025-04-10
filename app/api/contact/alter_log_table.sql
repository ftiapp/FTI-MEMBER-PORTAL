-- เพิ่ม 'contact_message' เข้าไปใน ENUM ของคอลัมน์ action
ALTER TABLE Member_portal_User_log 
MODIFY COLUMN action ENUM('member_verification', 'document_upload', 'profile_update', 'other', 'contact_message');
