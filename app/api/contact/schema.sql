-- Create FTI_Portal_User_Contact_Messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS FTI_Portal_User_Contact_Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster queries
CREATE INDEX idx_contact_messages_user_id ON FTI_Portal_User_Contact_Messages(user_id);
CREATE INDEX idx_contact_messages_status ON FTI_Portal_User_Contact_Messages(status);
