-- Run all necessary migrations to fix contact message system

-- 1. Update contact_messages table to add 'user_replied' status
ALTER TABLE contact_messages 
MODIFY COLUMN status ENUM('unread', 'read', 'replied', 'user_replied') DEFAULT 'unread';

-- 2. Add 'contact_message_reply' to the action ENUM in Member_portal_User_log table
ALTER TABLE Member_portal_User_log 
MODIFY COLUMN action ENUM(
    'member_verification',
    'document_upload',
    'profile_update',
    'other',
    'contact_message',
    'contact_message_reply',
    'profile_update_request',
    'change_email',
    'password_reset',
    'address_update_request',
    'tsic_update_request',
    'tsic_code_update',
    'delete_tsic',
    'social_media_update',
    'social_media_add',
    'social_media_delete',
    'logo_add',
    'logo_update',
    'logo_delete'
);

-- 3. Update contact_message_replies table schema
-- Instead of trying to drop a specific foreign key by name, we'll modify the table structure directly

-- First, disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Add reply_type column
ALTER TABLE contact_message_replies
ADD COLUMN reply_type ENUM('admin', 'user') NOT NULL DEFAULT 'admin' AFTER message_id;

-- Add regular_user_id column
ALTER TABLE contact_message_replies
ADD COLUMN regular_user_id INT NULL AFTER user_id;

-- Add foreign key constraint for regular_user_id
ALTER TABLE contact_message_replies
ADD CONSTRAINT fk_regular_user_id FOREIGN KEY (regular_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add back the foreign key constraint for admin users
ALTER TABLE contact_message_replies
ADD CONSTRAINT fk_admin_user_id FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;
