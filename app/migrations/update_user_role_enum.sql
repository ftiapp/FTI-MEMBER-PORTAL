-- Update the role ENUM in FTI_Portal_User table to include 'default_user'
ALTER TABLE FTI_Portal_User MODIFY COLUMN role ENUM('admin', 'member', 'default_user') DEFAULT 'default_user';

-- Update existing FTI_Portal_User with role 'member' to 'default_user' if they don't have an approved entry in FTI_Original_Membership
UPDATE FTI_Portal_User u
LEFT JOIN FTI_Original_Membership cm ON u.id = cm.user_id AND cm.Admin_Submit = 1
SET u.role = 'default_user'
WHERE u.role = 'member' AND cm.id IS NULL;

-- Update FTI_Portal_User to 'member' role if they have an approved entry in FTI_Original_Membership
UPDATE FTI_Portal_User u
JOIN FTI_Original_Membership cm ON u.id = cm.user_id
SET u.role = 'member'
WHERE cm.Admin_Submit = 1;
