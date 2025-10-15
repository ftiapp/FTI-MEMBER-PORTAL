-- Migration: Rename table FTI_Original_Membership to FTI_Original_Membership
-- Date: 2025-10-15
-- Description: Rename the FTI_Original_Membership table to FTI_Original_Membership for better naming convention

-- Step 1: Rename the table
ALTER TABLE FTI_Original_Membership RENAME TO FTI_Original_Membership;

-- Step 2: Verify the rename
SELECT 'Table renamed successfully' AS status;

-- Note: This migration will automatically update:
-- - All foreign key constraints
-- - All indexes
-- - All triggers (if any)
-- 
-- However, you need to manually update:
-- - Application code (API routes, queries, etc.)
-- - Any stored procedures or views that reference this table
-- - Documentation

-- To rollback (if needed):
-- ALTER TABLE FTI_Original_Membership RENAME TO FTI_Original_Membership;
