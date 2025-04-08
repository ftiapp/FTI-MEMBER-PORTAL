-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create password_reset_logs table to track reset password requests
CREATE TABLE IF NOT EXISTS password_reset_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  request_count INT DEFAULT 1,
  last_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  request_date DATE DEFAULT (CURRENT_DATE),
  INDEX (email, request_date)
);
