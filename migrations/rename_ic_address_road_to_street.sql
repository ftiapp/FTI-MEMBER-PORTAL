-- Migration: Rename 'road' column to 'street' in MemberRegist_IC_Address
-- Purpose: Standardize address field naming across membership types
-- Notes: Ensure to run during a maintenance window. Backup recommended.

-- Rename column (MySQL 5.7/8.0 compatible using CHANGE COLUMN)
ALTER TABLE MemberRegist_IC_Address 
  CHANGE COLUMN `road` `street` VARCHAR(100) NULL;

-- Optional: Update any dependent views or triggers if they reference `road`.
