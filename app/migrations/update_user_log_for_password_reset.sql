-- Add 'password_reset' to the action ENUM in Member_portal_User_log table
ALTER TABLE Member_portal_User_log 
MODIFY COLUMN action ENUM('member_verification','document_upload','profile_update','other','contact_message','profile_update_request','change_email','password_reset') DEFAULT 'other';
