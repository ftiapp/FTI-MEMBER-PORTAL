-- Modify the action_type column to include all existing values plus the new FAQ-related values
ALTER TABLE FTI_Portal_Admin_Actions_Logs 
MODIFY COLUMN action_type ENUM(
  'login', 
  'logout',
  'create_admin', 
  'update_admin', 
  'deactivate_admin',
  'activate_admin', 
  'approve_member', 
  'reject_member', 
  'contact_message_read',
  'contact_message_direct_reply', 
  'contact_message_response',
  'approve_address_update', 
  'reject_address_update',
  'approve_profile_update',
  'reject_profile_update',
  'approve_tsic_update',
  'other',
  'faq_create', 
  'faq_update', 
  'faq_delete'
);
