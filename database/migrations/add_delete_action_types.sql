-- Add deletion actions to FTI_Portal_Admin_Actions_Logs action_type enum
-- This allows logging when admins delete users, records, or other items

ALTER TABLE FTI_Portal_Admin_Actions_Logs
MODIFY COLUMN action_type ENUM(
  'login',
  'approve_member',
  'reject_member',
  'create_admin',
  'update_admin',
  'delete_user',
  'delete_admin',
  'delete_record',
  'delete_item',
  'other',
  'contact_message_response',
  'approve_profile_update',
  'reject_profile_update',
  'approve_membership',
  'reject_membership',
  'approve_address_update',
  'reject_address_update',
  'approve_product_update',
  'reject_product_update',
  'approve_tsic_update',
  'reject_tsic_update',
  'connect_member_code',
  'contact_message_direct_reply',
  'contact_message_read',
  'save_note_member_regist',
  'Admin_Update_MemberRegist',
  'review_resubmission',
  'approve_resubmission',
  'reject_resubmission',
  'request_document_revision',
  'approve_document',
  'reject_document',
  'switch_membership_type'
) NOT NULL;
