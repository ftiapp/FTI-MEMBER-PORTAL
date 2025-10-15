-- Add email_verified column to FTI_Portal_User table
ALTER TABLE FTI_Portal_User ADD COLUMN email_verified BOOLEAN DEFAULT 0;

-- Create FTI_Portal_User_Verification_Tokens table
CREATE TABLE IF NOT EXISTS FTI_Portal_User_Verification_Tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE
);
