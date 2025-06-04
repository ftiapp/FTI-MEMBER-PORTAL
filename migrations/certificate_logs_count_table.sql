-- Create certificate_logs table with count field
CREATE TABLE IF NOT EXISTS certificate_logs_count (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  member_code VARCHAR(20) NOT NULL,
  action_type VARCHAR(20) NOT NULL COMMENT 'print or download',
  language VARCHAR(10) NOT NULL DEFAULT 'thai' COMMENT 'thai or english',
  count INT NOT NULL DEFAULT 1 COMMENT 'Number of times this action was performed',
  first_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When this action was first performed',
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When this action was last performed',
  
  INDEX idx_user_id (user_id),
  INDEX idx_member_code (member_code),
  INDEX idx_action_type (action_type),
  INDEX idx_last_updated (last_updated_at),
  
  -- Unique constraint to ensure we only have one record per user-member-action-language combination
  UNIQUE KEY unique_log_entry (user_id, member_code, action_type, language)
);
