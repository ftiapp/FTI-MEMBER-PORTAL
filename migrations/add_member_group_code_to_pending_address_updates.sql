-- Add member_group_code column to pending_address_updates table
ALTER TABLE pending_address_updates 
ADD COLUMN member_group_code VARCHAR(10) AFTER member_type;

-- Update existing records to have a default value if needed
-- UPDATE pending_address_updates SET member_group_code = '' WHERE member_group_code IS NULL;

-- Add an index for faster lookups
CREATE INDEX idx_member_group_code ON pending_address_updates (member_group_code);

-- Add a comment to explain the purpose of this column
ALTER TABLE pending_address_updates 
MODIFY COLUMN member_group_code VARCHAR(10) COMMENT 'The group code within the member type, e.g., specific industry group code';
