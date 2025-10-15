-- Migration: Rename FTI_Portal_User_Verification_Tokens table
-- Date: 2025-10-15
-- Description: Rename FTI_Portal_User_Verification_Tokens to FTI_Portal_User_Verification_Tokens

-- Rename the table
ALTER TABLE FTI_Portal_User_Verification_Tokens 
RENAME TO FTI_Portal_User_Verification_Tokens;

SELECT 'Table FTI_Portal_User_Verification_Tokens renamed to FTI_Portal_User_Verification_Tokens' AS status;

-- Rollback (if needed):
-- ALTER TABLE FTI_Portal_User_Verification_Tokens RENAME TO FTI_Portal_User_Verification_Tokens;
