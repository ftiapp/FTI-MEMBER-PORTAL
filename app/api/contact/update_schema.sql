-- แก้ไขคอลัมน์ admin_response ให้เป็น boolean
ALTER TABLE contact_messages 
MODIFY COLUMN admin_response BOOLEAN DEFAULT FALSE;

-- เพิ่ม ENUM 'contact_message_response' ในตาราง admin_actions_log
ALTER TABLE admin_actions_log 
MODIFY COLUMN action_type ENUM('login', 'approve_member', 'reject_member', 'create_admin', 'update_admin', 'other', 'contact_message_response');
