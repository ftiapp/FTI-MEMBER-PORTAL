-- Update contact_message_replies table to support both admin and regular user replies
ALTER TABLE contact_message_replies DROP FOREIGN KEY contact_message_replies_ibfk_2;
ALTER TABLE contact_message_replies ADD COLUMN reply_type ENUM('admin', 'user') NOT NULL DEFAULT 'admin' AFTER user_id;
ALTER TABLE contact_message_replies ADD COLUMN regular_user_id INT NULL AFTER reply_type;
ALTER TABLE contact_message_replies ADD CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL;
ALTER TABLE contact_message_replies ADD CONSTRAINT fk_regular_user FOREIGN KEY (regular_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_contact_message_replies_regular_user_id ON contact_message_replies(regular_user_id);
