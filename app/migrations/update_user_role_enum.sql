-- Update the role ENUM in users table to include 'default_user'
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'member', 'default_user') DEFAULT 'default_user';

-- Update existing users with role 'member' to 'default_user' if they don't have an approved entry in companies_Member
UPDATE users u
LEFT JOIN companies_Member cm ON u.id = cm.user_id AND cm.Admin_Submit = 1
SET u.role = 'default_user'
WHERE u.role = 'member' AND cm.id IS NULL;

-- Update users to 'member' role if they have an approved entry in companies_Member
UPDATE users u
JOIN companies_Member cm ON u.id = cm.user_id
SET u.role = 'member'
WHERE cm.Admin_Submit = 1;
