-- Create FTI_Portal_User_Login_Logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS FTI_Portal_User_Login_Logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type ENUM('login', 'logout', 'timeout') NOT NULL DEFAULT 'login',
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  login_time DATETIME NOT NULL,
  logout_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_login_time (login_time),
  CONSTRAINT fk_user_login_logs_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES FTI_Portal_User(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If the table already exists with wrong foreign key, drop and recreate the constraint
-- First, check if the constraint exists and drop it
SET @constraint_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'FTI_Portal_User_Login_Logs'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

-- Drop existing foreign key if it exists
SET @drop_fk = IF(@constraint_exists > 0,
  'ALTER TABLE FTI_Portal_User_Login_Logs DROP FOREIGN KEY fk_user_login_logs_user_id',
  'SELECT "No foreign key to drop"');
PREPARE stmt FROM @drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add the correct foreign key constraint
SET @add_fk = 'ALTER TABLE FTI_Portal_User_Login_Logs 
  ADD CONSTRAINT fk_user_login_logs_user_id 
  FOREIGN KEY (user_id) 
  REFERENCES FTI_Portal_User(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE';
  
-- Only add if table exists
SET @table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'FTI_Portal_User_Login_Logs'
);

SET @add_fk_final = IF(@table_exists > 0, @add_fk, 'SELECT "Table does not exist yet"');
PREPARE stmt2 FROM @add_fk_final;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
