-- Add profile_update_request to FTI_Portal_User_Logs action ENUM
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action ENUM('member_verification', 'document_upload', 'profile_update', 'other', 'contact_message', 'profile_update_request') NOT NULL;

-- Add approve_profile_update and reject_profile_update to FTI_Portal_Admin_Actions_Logs action_type ENUM
ALTER TABLE FTI_Portal_Admin_Actions_Logs 
MODIFY COLUMN action_type ENUM('login', 'approve_member', 'reject_member', 'create_admin', 'update_admin', 'other', 'contact_message_response', 'approve_profile_update', 'reject_profile_update') NOT NULL;

-- Create FTI_Portal_User_Profile_Update_Requests table
CREATE TABLE IF NOT EXISTS FTI_Portal_User_Profile_Update_Requests (
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
  FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_profile_update_user_id ON FTI_Portal_User_Profile_Update_Requests(user_id);
CREATE INDEX idx_profile_update_status ON FTI_Portal_User_Profile_Update_Requests(status);
