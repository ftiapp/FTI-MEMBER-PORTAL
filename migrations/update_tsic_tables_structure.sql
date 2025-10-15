-- Migration: update_tsic_tables_structure.sql
-- Description: Update FTI_Original_Membership_Pending_Tsic_Updates to store TSIC codes directly
-- Date: 2025-05-16

-- Update the FTI_Original_Membership_Pending_Tsic_Updates table to store TSIC codes directly
-- First, modify the tsic_data column if it exists
ALTER TABLE FTI_Original_Membership_Pending_Tsic_Updates 
MODIFY COLUMN tsic_data JSON NULL;

-- Add columns only if they don't exist
SET @dbname = DATABASE();
SET @tablename = 'FTI_Original_Membership_Pending_Tsic_Updates';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @dbname 
   AND TABLE_NAME = @tablename 
   AND COLUMN_NAME = 'category_code') = 0,
  'ALTER TABLE FTI_Original_Membership_Pending_Tsic_Updates ADD COLUMN category_code CHAR(1) AFTER member_code',
  'SELECT 1'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add other columns in the same way
CALL add_column_if_not_exists(@dbname, @tablename, 'category_name', 'TEXT AFTER category_code');
CALL add_column_if_not_exists(@dbname, @tablename, 'tsic_code', 'VARCHAR(20) AFTER category_name');
CALL add_column_if_not_exists(@dbname, @tablename, 'tsic_description', 'TEXT AFTER tsic_code');
CALL add_column_if_not_exists(@dbname, @tablename, 'category_order', 'CHAR(1) AFTER tsic_description');
CALL add_column_if_not_exists(@dbname, @tablename, 'positive_list', "ENUM('Yes', 'No') DEFAULT 'No' AFTER category_order");

-- Create a stored procedure to add columns if they don't exist
DELIMITER //
CREATE PROCEDURE add_column_if_not_exists(
    IN db_name VARCHAR(100),
    IN table_name VARCHAR(100),
    IN col_name VARCHAR(100),
    IN col_definition VARCHAR(1000)
)
BEGIN
    SET @dbname = db_name;
    SET @tablename = table_name;
    SET @columnname = col_name;
    SET @preparedStatement = (SELECT IF(
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = @dbname 
         AND TABLE_NAME = @tablename 
         AND COLUMN_NAME = @columnname) = 0,
        CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ', col_definition),
        'SELECT 1'
    ));
    
    PREPARE alterIfNotExists FROM @preparedStatement;
    EXECUTE alterIfNotExists;
    DEALLOCATE PREPARE alterIfNotExists;
END //
DELIMITER ;

-- Add foreign key to tsic_categories
ALTER TABLE FTI_Original_Membership_Pending_Tsic_Updates
ADD CONSTRAINT fk_tsic_category 
FOREIGN KEY (tsic_code) REFERENCES tsic_categories(tsic_code);

-- Add index for better query performance
CREATE INDEX idx_pending_tsic_member ON FTI_Original_Membership_Pending_Tsic_Updates(member_code);
CREATE INDEX idx_pending_tsic_code ON FTI_Original_Membership_Pending_Tsic_Updates(tsic_code);

-- Add comment to explain the changes
ALTER TABLE FTI_Original_Membership_Pending_Tsic_Updates 
COMMENT 'Stores TSIC code update requests. Each row represents one TSIC code for a member.';

-- Create a view to get member's approved TSIC codes with explicit collation
CREATE OR REPLACE VIEW member_approved_tsic AS
SELECT 
  p.member_code,
  p.tsic_code,
  c.category_order,
  c.description AS tsic_description,
  c.positive_list,
  d.category_name,
  p.created_at,
  p.updated_at
FROM FTI_Original_Membership_Pending_Tsic_Updates p
JOIN tsic_categories c ON p.tsic_code COLLATE utf8mb4_unicode_ci = c.tsic_code COLLATE utf8mb4_unicode_ci
JOIN tsic_description d ON c.category_order COLLATE utf8mb4_unicode_ci = d.category_code COLLATE utf8mb4_unicode_ci
WHERE p.status = 'approved';

-- Add comment to the view
ALTER VIEW member_approved_tsic 
COMMENT 'View showing all approved TSIC codes for members with category information';
