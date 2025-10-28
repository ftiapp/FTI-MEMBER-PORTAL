-- Fix FTI_Portal_User_Login_Logs foreign key constraint
-- This script fixes the foreign key to reference FTI_Portal_User instead of 'users'

-- Step 1: Drop the existing foreign key constraint (if it exists)
-- First, let's check what foreign key constraints exist
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'ftimemberportal'
    AND TABLE_NAME = 'FTI_Portal_User_Login_Logs'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 2: Drop the table if it has incorrect foreign key
DROP TABLE IF EXISTS FTI_Portal_User_Login_Logs;

-- Step 3: Create the table with correct foreign key
CREATE TABLE FTI_Portal_User_Login_Logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type ENUM('login', 'logout', 'timeout') NOT NULL DEFAULT 'login',
  ip_address VARCHAR(45) COMMENT 'IP address of the user',
  user_agent TEXT COMMENT 'Browser user agent string',
  session_id VARCHAR(255) COMMENT 'Session identifier',
  login_time DATETIME NOT NULL COMMENT 'Time when user logged in',
  logout_time DATETIME NULL COMMENT 'Time when user logged out or session timed out',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_login_time (login_time),
  INDEX idx_event_type (event_type),
  
  -- Correct foreign key constraint referencing FTI_Portal_User
  CONSTRAINT fk_user_login_logs_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES FTI_Portal_User(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs user login, logout, and timeout events';

-- Verify the table was created correctly
SHOW CREATE TABLE FTI_Portal_User_Login_Logs;
