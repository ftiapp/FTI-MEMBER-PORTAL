-- Migration: Add phone_extension column to MemberRegist_AC_Address table
-- Date: 2025-08-08
-- Description: Add phone_extension column to support phone extension for AC addresses

-- Add phone_extension column to MemberRegist_AC_Address table
ALTER TABLE MemberRegist_AC_Address 
ADD COLUMN phone_extension VARCHAR(20) NULL AFTER phone;

-- Add comment to the column
ALTER TABLE MemberRegist_AC_Address 
MODIFY COLUMN phone_extension VARCHAR(20) NULL COMMENT 'Phone extension for address contact';

-- Add index for better performance (optional)
CREATE INDEX idx_ac_address_phone_extension ON MemberRegist_AC_Address(phone_extension);

-- Update existing records to have empty string instead of NULL (optional)
UPDATE MemberRegist_AC_Address 
SET phone_extension = '' 
WHERE phone_extension IS NULL;
