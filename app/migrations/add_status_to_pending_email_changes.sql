-- Check if status column exists and add it if it doesn't
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'pending_email_changes' AND column_name = 'status';

SET @query = IF(@exists = 0, 
    'ALTER TABLE pending_email_changes ADD COLUMN status ENUM(\'pending\', \'verified\', \'cancelled\', \'rejected\') DEFAULT \'pending\' AFTER created_at', 
    'SELECT "Status column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if old_email column exists and add it if it doesn't
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'pending_email_changes' AND column_name = 'old_email';

SET @query = IF(@exists = 0, 
    'ALTER TABLE pending_email_changes ADD COLUMN old_email VARCHAR(255) AFTER user_id', 
    'SELECT "old_email column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if admin_id column exists and add it if it doesn't
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'pending_email_changes' AND column_name = 'admin_id';

SET @query = IF(@exists = 0, 
    'ALTER TABLE pending_email_changes ADD COLUMN admin_id INT AFTER created_at', 
    'SELECT "admin_id column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if admin_note column exists and add it if it doesn't
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'pending_email_changes' AND column_name = 'admin_note';

SET @query = IF(@exists = 0, 
    'ALTER TABLE pending_email_changes ADD COLUMN admin_note TEXT AFTER admin_id', 
    'SELECT "admin_note column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if updated_at column exists and add it if it doesn't
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'pending_email_changes' AND column_name = 'updated_at';

SET @query = IF(@exists = 0, 
    'ALTER TABLE pending_email_changes ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER admin_note', 
    'SELECT "updated_at column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if status index exists and add it if it doesn't
SET @exists = 0;
SELECT COUNT(*) INTO @exists FROM information_schema.statistics 
WHERE table_schema = DATABASE() AND table_name = 'pending_email_changes' AND index_name = 'idx_status';

SET @query = IF(@exists = 0, 
    'CREATE INDEX idx_status ON pending_email_changes (status)', 
    'SELECT "idx_status index already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Set all existing records to 'pending' status if they don't have a status
UPDATE pending_email_changes SET status = 'pending' WHERE status IS NULL OR status = '';
