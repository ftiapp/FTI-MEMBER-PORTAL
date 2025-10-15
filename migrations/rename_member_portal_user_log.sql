-- Migration: Rename FTI_Portal_User_Logs table
-- Date: 2025-10-15
-- Description: Rename FTI_Portal_User_Logs to FTI_Portal_User_Logs

-- Rename the table
ALTER TABLE FTI_Portal_User_Logs 
RENAME TO FTI_Portal_User_Logs;

SELECT 'Table FTI_Portal_User_Logs renamed to FTI_Portal_User_Logs' AS status;

-- Rollback (if needed):
-- ALTER TABLE FTI_Portal_User_Logs RENAME TO FTI_Portal_User_Logs;
