-- Add member_group_code column to FTI_Original_Membership_Pending_Address_Updates table
ALTER TABLE FTI_Original_Membership_Pending_Address_Updates 
ADD COLUMN member_group_code VARCHAR(10) AFTER member_type;

-- Update existing records to have a default value if needed
-- UPDATE FTI_Original_Membership_Pending_Address_Updates SET member_group_code = '' WHERE member_group_code IS NULL;

-- Add an index for faster lookups
CREATE INDEX idx_member_group_code ON FTI_Original_Membership_Pending_Address_Updates (member_group_code);

-- Add a comment to explain the purpose of this column
ALTER TABLE FTI_Original_Membership_Pending_Address_Updates 
MODIFY COLUMN member_group_code VARCHAR(10) COMMENT 'The group code within the member type, e.g., specific industry group code';
