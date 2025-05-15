-- Migration: create_pending_tsic_updates_table.sql
-- Description: Create pending_tsic_updates table and update log tables with new ENUM values
-- Date: 2025-05-14

-- Create pending_tsic_updates table
CREATE TABLE IF NOT EXISTS pending_tsic_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  member_code VARCHAR(20) NOT NULL,
  tsic_data JSON NOT NULL,  -- Store array of {category_code, category_name, tsic_code, description, category_order}
  request_date DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_id INT DEFAULT NULL,
  admin_comment TEXT,
  processed_date DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add new action to Member_portal_User_log
ALTER TABLE Member_portal_User_log 
MODIFY COLUMN action ENUM(
  'member_verification',
  'document_upload',
  'profile_update',
  'other',
  'contact_message',
  'profile_update_request',
  'change_email',
  'password_reset',
  'address_update_request',
  'tsic_update_request'
);

-- Add new action types to admin_actions_log
ALTER TABLE admin_actions_log 
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
  'reject_tsic_update'
);
