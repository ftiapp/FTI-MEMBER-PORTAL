-- Add reset_code column to FTI_Portal_User_Password_Reset_Tokens table
ALTER TABLE FTI_Portal_User_Password_Reset_Tokens ADD COLUMN reset_code VARCHAR(6) AFTER token;
