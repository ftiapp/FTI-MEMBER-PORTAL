-- Create FTI_Portal_Admin_Settings table
CREATE TABLE IF NOT EXISTS FTI_Portal_Admin_Settings (
  id INT NOT NULL PRIMARY KEY,
  password_policy JSON,
  session_timeout INT DEFAULT 60,
  max_login_attempts INT DEFAULT 5,
  two_factor_auth TINYINT(1) DEFAULT 0,
  email_notifications TINYINT(1) DEFAULT 1,
  admin_alerts TINYINT(1) DEFAULT 1,
  daily_digest TINYINT(1) DEFAULT 0,
  notification_types JSON,
  maintenance_mode TINYINT(1) DEFAULT 0,
  maintenance_message VARCHAR(255),
  system_language VARCHAR(10) DEFAULT 'th',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format VARCHAR(20) DEFAULT 'HH:mm',
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  debug_mode TINYINT(1) DEFAULT 0,
  log_level VARCHAR(20) DEFAULT 'error',
  enable_api TINYINT(1) DEFAULT 0,
  api_rate_limit INT DEFAULT 100,
  api_key_expiration INT DEFAULT 30,
  api_whitelist JSON,
  mailersend_api_key VARCHAR(255),
  mailersend_sender VARCHAR(255) DEFAULT 'noreply@fti.or.th',
  auto_backup TINYINT(1) DEFAULT 0,
  backup_frequency VARCHAR(20) DEFAULT 'daily',
  backup_time VARCHAR(10) DEFAULT '03:00',
  retention_period INT DEFAULT 30,
  backup_location VARCHAR(50) DEFAULT 'local',
  include_uploads TINYINT(1) DEFAULT 1,
  backup_notification TINYINT(1) DEFAULT 1,
  created_by INT,
  created_at DATETIME,
  updated_by INT,
  updated_at DATETIME,
  FOREIGN KEY (created_by) REFERENCES FTI_Portal_Admin_Users(id),
  FOREIGN KEY (updated_by) REFERENCES FTI_Portal_Admin_Users(id)
);

-- Insert default settings if not exists
INSERT IGNORE INTO FTI_Portal_Admin_Settings (
  id, 
  password_policy, 
  notification_types,
  maintenance_message,
  api_whitelist,
  created_at
) VALUES (
  1, 
  '{"minLength": 8, "requireUppercase": true, "requireNumbers": true, "requireSpecialChars": false}',
  '{"newMembers": true, "verificationRequests": true, "profileUpdates": false, "addressUpdates": true, "productUpdates": true, "contactMessages": true}',
  'ระบบอยู่ระหว่างการปรับปรุง กรุณากลับมาใหม่ในภายหลัง',
  '[]',
  NOW()
);

-- Note: The action_type 'update_settings' needs to be added to the enum in FTI_Portal_Admin_Actions_Logs table
-- This requires an ALTER TABLE statement which should be executed separately:
-- ALTER TABLE FTI_Portal_Admin_Actions_Logs MODIFY COLUMN action_type ENUM('login','approve_member','reject_member','create_admin','update_admin','other','contact_message_response','approve_profile_update','reject_profile_update','approve_address_update','reject_address_update','approve_tsic_update','reject_tsic_update','contact_message_direct_reply','contact_message_read','approve_product_update','reject_product_update','update_settings');
