-- Create admin_users table for storing admin credentials
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Will store hashed password
  admin_level INT NOT NULL DEFAULT 1, -- 1-5 admin level
  is_active BOOLEAN DEFAULT TRUE,
  can_create BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create admin_actions_log table for logging admin actions
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action_type ENUM('login', 'approve_member', 'reject_member', 'create_admin', 'update_admin', 'other') NOT NULL,
  target_id INT, -- ID of the record being modified (e.g., member_id, admin_id)
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create Member_portal_User_log for tracking member verification actions
CREATE TABLE IF NOT EXISTS Member_portal_User_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action ENUM('member_verification', 'document_upload', 'profile_update', 'other') NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default SuperAdmin user (password: 123456)
-- Note: In production, use a secure password and proper hashing
INSERT INTO admin_users (username, password, admin_level, is_active, can_create, can_update, created_at)
VALUES ('superadmin', '$2b$10$4QvMxP.cxgBCEcOhx2g5/.Nks16RFQGvNQ7ksVpbL65GmZVzUsHFe', 5, TRUE, TRUE, TRUE, NOW());
