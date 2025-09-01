-- Migration: Rename 'road' column to 'street' in MemberRegist_AC_Address if it exists
-- Purpose: Standardize address field naming across membership types
-- Safe conditional migration using INFORMATION_SCHEMA

SET @db := DATABASE();
SELECT COUNT(*) INTO @colExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = @db
  AND TABLE_NAME = 'MemberRegist_AC_Address'
  AND COLUMN_NAME = 'road';

SET @sql := IF(@colExists > 0,
  'ALTER TABLE MemberRegist_AC_Address CHANGE COLUMN `road` `street` VARCHAR(100) NULL;',
  'SELECT "MemberRegist_AC_Address.road does not exist - no change";'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
