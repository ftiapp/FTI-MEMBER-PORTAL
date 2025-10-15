-- Add 'save_note' to FTI_Portal_Admin_Actions_Logs action_type enum
-- This allows logging when admin saves notes on membership requests

ALTER TABLE FTI_Portal_Admin_Actions_Logs 
MODIFY COLUMN action_type ENUM(
  'login',
  'approve_member',
  'reject_member', 
  'create_admin',
  'update_admin',
  'other',
  'contact_message_response',
  'approve_profile_update',
  'reject_profile_update',
  'approve_address_update',
  'reject_address_update',
  'approve_tsic_update',
  'reject_tsic_update',
  'contact_message_direct_reply',
  'contact_message_read',
  'approve_product_update',
  'reject_product_update',
  'approve_membership',
  'reject_membership',
  'save_note_member_regist'
) NOT NULL;
