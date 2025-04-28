-- Add columns to track which admin read or replied to messages
ALTER TABLE contact_messages 
ADD COLUMN read_by_admin_id INT NULL,
ADD COLUMN replied_by_admin_id INT NULL,
ADD COLUMN read_at TIMESTAMP NULL,
ADD COLUMN replied_at TIMESTAMP NULL;

-- Add foreign key constraints
ALTER TABLE contact_messages
ADD CONSTRAINT fk_read_by_admin
FOREIGN KEY (read_by_admin_id) REFERENCES admin_users(id)
ON DELETE SET NULL;

ALTER TABLE contact_messages
ADD CONSTRAINT fk_replied_by_admin
FOREIGN KEY (replied_by_admin_id) REFERENCES admin_users(id)
ON DELETE SET NULL;
