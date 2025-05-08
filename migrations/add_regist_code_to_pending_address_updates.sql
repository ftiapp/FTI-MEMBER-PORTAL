-- Migration: add_regist_code_to_pending_address_updates.sql
-- Description: Add REGIST_CODE column to pending_address_updates table
-- Date: 2025-05-08

-- Check if the pending_address_updates table exists
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'pending_address_updates';

-- If the table exists, add the REGIST_CODE column after comp_person_code
SET @alter_statement = IF(@table_exists > 0, 
  'ALTER TABLE pending_address_updates ADD COLUMN regist_code VARCHAR(100) AFTER comp_person_code',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the alter statement
PREPARE stmt FROM @alter_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update the existing records to set regist_code from companies_Member table
SET @update_statement = IF(@table_exists > 0,
  'UPDATE pending_address_updates pau
   LEFT JOIN companies_Member cm ON pau.member_code = cm.MEMBER_CODE
   SET pau.regist_code = cm.REGIST_CODE
   WHERE pau.regist_code IS NULL',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the update statement
PREPARE stmt FROM @update_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for faster lookups
SET @index_statement = IF(@table_exists > 0,
  'ALTER TABLE pending_address_updates ADD INDEX idx_regist_code (regist_code)',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the index statement
PREPARE stmt FROM @index_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
