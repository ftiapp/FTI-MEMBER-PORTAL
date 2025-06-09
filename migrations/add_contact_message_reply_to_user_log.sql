-- Add 'contact_message_reply' to the action ENUM in Member_portal_User_log table
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
