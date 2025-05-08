-- Migration: add_comp_person_code_to_pending_address_updates.sql
-- Description: Add COMP_PERSON_CODE column to pending_address_updates table
-- Date: 2025-05-08

-- Check if the pending_address_updates table exists
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'pending_address_updates';

-- If the table exists, add the COMP_PERSON_CODE column after member_code
SET @alter_statement = IF(@table_exists > 0, 
  'ALTER TABLE pending_address_updates ADD COLUMN comp_person_code VARCHAR(100) AFTER member_code',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the alter statement
PREPARE stmt FROM @alter_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update the existing records to set comp_person_code from companies_Member table
SET @update_statement = IF(@table_exists > 0,
  'UPDATE pending_address_updates pau
   LEFT JOIN companies_Member cm ON pau.member_code = cm.MEMBER_CODE
   SET pau.comp_person_code = cm.COMP_PERSON_CODE
   WHERE pau.comp_person_code IS NULL',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the update statement
PREPARE stmt FROM @update_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for faster lookups
SET @index_statement = IF(@table_exists > 0,
  'ALTER TABLE pending_address_updates ADD INDEX idx_comp_person_code (comp_person_code)',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the index statement
PREPARE stmt FROM @index_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
