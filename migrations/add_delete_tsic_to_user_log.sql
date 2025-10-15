-- เพิ่ม delete_tsic เข้าไปในคอลัมน์ action ของตาราง FTI_Portal_User_Logs
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action ENUM(
  'member_verification',
  'document_upload',
  'profile_updatฟe',
  'other',
  'contact_message',
  'profile_update_request',
  'change_email',
  'password_reset',
  'address_update_request',
  'tsic_update_request',
  'tsic_code_update',
  'delete_tsic'
);
