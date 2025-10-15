-- Update existing FTI_Portal_User with approved companies to have 'member' role
UPDATE FTI_Portal_User u
JOIN FTI_Original_Membership cm ON u.id = cm.user_id
SET u.role = 'member'
WHERE cm.Admin_Submit = 1 AND u.role = 'member';

-- Update existing FTI_Portal_User without approved companies to have 'default_user' role
UPDATE FTI_Portal_User u
LEFT JOIN FTI_Original_Membership cm ON u.id = cm.user_id AND cm.Admin_Submit = 1
SET u.role = 'default_user'
WHERE u.role = 'member' AND cm.id IS NULL AND u.role != 'admin';

-- Keep admin FTI_Portal_User as they are
-- This ensures that admin FTI_Portal_User are not affected by the migration
