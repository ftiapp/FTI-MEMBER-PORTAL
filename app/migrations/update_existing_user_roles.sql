-- Update existing users with approved companies to have 'member' role
UPDATE users u
JOIN companies_Member cm ON u.id = cm.user_id
SET u.role = 'member'
WHERE cm.Admin_Submit = 1 AND u.role = 'member';

-- Update existing users without approved companies to have 'default_user' role
UPDATE users u
LEFT JOIN companies_Member cm ON u.id = cm.user_id AND cm.Admin_Submit = 1
SET u.role = 'default_user'
WHERE u.role = 'member' AND cm.id IS NULL AND u.role != 'admin';

-- Keep admin users as they are
-- This ensures that admin users are not affected by the migration
