-- Add profile_update_request to Member_portal_User_log action ENUM
ALTER TABLE Member_portal_User_log 
MODIFY COLUMN action ENUM('member_verification', 'document_upload', 'profile_update', 'other', 'contact_message', 'profile_update_request') NOT NULL;

-- Add approve_profile_update and reject_profile_update to admin_actions_log action_type ENUM
ALTER TABLE admin_actions_log 
MODIFY COLUMN action_type ENUM('login', 'approve_member', 'reject_member', 'create_admin', 'update_admin', 'other', 'contact_message_response', 'approve_profile_update', 'reject_profile_update') NOT NULL;

-- Create profile_update_requests table
CREATE TABLE IF NOT EXISTS profile_update_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  new_firstname VARCHAR(255) NOT NULL,
  new_lastname VARCHAR(255) NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  new_phone VARCHAR(20) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reject_reason TEXT NULL,
  admin_id INT NULL,
  admin_comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_profile_update_user_id ON profile_update_requests(user_id);
CREATE INDEX idx_profile_update_status ON profile_update_requests(status);
