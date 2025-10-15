-- แก้ไขคอลัมน์ admin_response ให้เป็น boolean
ALTER TABLE FTI_Portal_User_Contact_Messages 
MODIFY COLUMN admin_response BOOLEAN DEFAULT FALSE;

-- เพิ่ม ENUM 'contact_message_response' ในตาราง FTI_Portal_Admin_Actions_Logs
ALTER TABLE FTI_Portal_Admin_Actions_Logs 
MODIFY COLUMN action_type ENUM('login', 'approve_member', 'reject_member', 'create_admin', 'update_admin', 'other', 'contact_message_response');
