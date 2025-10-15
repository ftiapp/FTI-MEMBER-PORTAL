-- ALTER TABLE to add new membership submission actions to FTI_Portal_User_Logs
-- This script adds new action values for membership submissions

-- Add new action values for membership submissions
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action ENUM(
  'member_verification',
  'document_upload', 
  'profile_update',
  'other',
  'contact_message',
  'contact_message_reply',
  'profile_update_request',
  'change_email',
  'password_reset',
  'address_update_request',
  'tsic_update_request',
  'tsic_code_update',
  'delete_tsic',
  'social_media_update',
  'social_media_add',
  'social_media_delete',
  'logo_add',
  'logo_update',
  'logo_delete',
  'product_update_request',
  'ICmembership_Regist',
  'AM_membership_submit',
  'OC_membership_submit', 
  'AC_membership_submit',
  'IC_membership_submit'
) NOT NULL;

-- Create function to generate log details for membership submissions
DELIMITER //
CREATE FUNCTION generate_membership_log_details(
  member_type VARCHAR(10),
  tax_id VARCHAR(20),
  company_name VARCHAR(255),
  idcard VARCHAR(20),
  first_name_th VARCHAR(100),
  last_name_th VARCHAR(100)
) RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE details TEXT;
  
  IF member_type = 'IC' THEN
    SET details = CONCAT('ID CARD: ', idcard, ' - ', first_name_th, ' ', last_name_th, ' (TH)');
  ELSE
    SET details = CONCAT('TAX_ID: ', tax_id, ' - ', company_name);
  END IF;
  
  RETURN details;
END//
DELIMITER ;
