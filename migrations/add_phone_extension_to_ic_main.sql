-- Add phone_extension column to MemberRegist_IC_Main table
-- This allows storing phone extensions for IC membership applications

ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN phone_extension VARCHAR(20) NULL AFTER phone;

-- Add index for performance if needed for searches
CREATE INDEX idx_ic_main_phone_extension ON MemberRegist_IC_Main(phone_extension);

-- Update any existing records to have NULL phone_extension (already default)
-- No data migration needed as this is a new optional field
