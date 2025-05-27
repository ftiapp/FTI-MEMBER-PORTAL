-- Update the action enum in Member_portal_User_log table to include social media actions
ALTER TABLE `Member_portal_User_log` 
MODIFY COLUMN `action` ENUM(
    'member_verification',
    'document_upload',
    'profile_update',
    'other',
    'contact_message',
    'profile_update_request',
    'change_email',
    'password_reset',
    'address_update_request',
    'tsic_update_request',
    'tsic_code_update',
    'delete_tsic',
    'social_media_update',
    'social_media_add',
    'social_media_delete'
) NOT NULL;
