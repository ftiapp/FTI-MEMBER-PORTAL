-- Migration: Add 'switch_membership_type' action type to admin_actions_log
-- Created: 2025-10-07
-- Purpose: Support membership type switching feature (OC ↔ AC)

-- Add new ENUM value to action_type column
ALTER TABLE `admin_actions_log` 
MODIFY COLUMN `action_type` ENUM(
  'approve',
  'reject',
  'edit',
  'delete',
  'create',
  'update',
  'view',
  'login',
  'logout',
  'save_note',
  'connect_member_code',
  'switch_membership_type'
) NOT NULL COMMENT 'ประเภทการกระทำ';

-- Add index for better query performance
CREATE INDEX idx_action_type ON admin_actions_log(action_type);

-- Add comment explaining the new action type
ALTER TABLE `admin_actions_log` 
COMMENT = 'บันทึกการกระทำของแอดมิน รวมถึงการเปลี่ยนประเภทสมาชิก (switch_membership_type)';
