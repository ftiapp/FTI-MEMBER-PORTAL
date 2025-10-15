-- เพิ่ม 'contact_message' เข้าไปใน ENUM ของคอลัมน์ action
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action ENUM('member_verification', 'document_upload', 'profile_update', 'other', 'contact_message');
