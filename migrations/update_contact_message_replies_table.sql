-- Update FTI_Portal_User_Contact_Message_Replies table to support both admin and regular user replies
ALTER TABLE FTI_Portal_User_Contact_Message_Replies DROP FOREIGN KEY contact_message_replies_ibfk_2;
ALTER TABLE FTI_Portal_User_Contact_Message_Replies ADD COLUMN reply_type ENUM('admin', 'user') NOT NULL DEFAULT 'admin' AFTER user_id;
ALTER TABLE FTI_Portal_User_Contact_Message_Replies ADD COLUMN regular_user_id INT NULL AFTER reply_type;
ALTER TABLE FTI_Portal_User_Contact_Message_Replies ADD CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES FTI_Portal_Admin_Users(id) ON DELETE SET NULL;
ALTER TABLE FTI_Portal_User_Contact_Message_Replies ADD CONSTRAINT fk_regular_user FOREIGN KEY (regular_user_id) REFERENCES FTI_Portal_User(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_contact_message_replies_regular_user_id ON FTI_Portal_User_Contact_Message_Replies(regular_user_id);
