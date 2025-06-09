-- Update contact_messages table to add 'user_replied' status
ALTER TABLE contact_messages 
MODIFY COLUMN status ENUM('unread', 'read', 'replied', 'user_replied') DEFAULT 'unread';
