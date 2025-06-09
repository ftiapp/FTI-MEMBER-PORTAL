-- Create contact_message_replies table
CREATE TABLE IF NOT EXISTS contact_message_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  user_id INT,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES contact_messages(id),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Add index for better performance
CREATE INDEX idx_contact_message_replies_message_id ON contact_message_replies(message_id);
CREATE INDEX idx_contact_message_replies_user_id ON contact_message_replies(user_id);
