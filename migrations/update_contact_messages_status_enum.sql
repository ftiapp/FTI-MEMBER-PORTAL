-- Update FTI_Portal_User_Contact_Messages table to add 'user_replied' status
ALTER TABLE FTI_Portal_User_Contact_Messages 
MODIFY COLUMN status ENUM('unread', 'read', 'replied', 'user_replied') DEFAULT 'unread';
