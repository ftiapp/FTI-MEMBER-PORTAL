-- Migration: add_addr_lang_to_pending_address_updates.sql
-- Description: Add ADDR_LANG column to pending_address_updates table to track which language was used
-- Date: 2025-05-08

-- Check if the pending_address_updates table exists
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'pending_address_updates';

-- If the table exists, add the ADDR_LANG column after addr_code
SET @alter_statement = IF(@table_exists > 0, 
  'ALTER TABLE pending_address_updates ADD COLUMN addr_lang VARCHAR(2) DEFAULT "th" AFTER addr_code',
  'SELECT "Table pending_address_updates does not exist"'
);

-- Execute the alter statement
PREPARE stmt FROM @alter_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
