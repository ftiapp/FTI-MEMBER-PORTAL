-- Add 'password_reset' to the action ENUM in FTI_Portal_User_Logs table
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action ENUM('member_verification','document_upload','profile_update','other','contact_message','profile_update_request','change_email','password_reset') DEFAULT 'other';
