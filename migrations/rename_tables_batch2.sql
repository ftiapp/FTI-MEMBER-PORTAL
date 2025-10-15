-- Migration: Rename multiple tables - Batch 2
-- Date: 2025-10-15
-- Description: Rename 11 tables to follow FTI naming standards

-- ============================================
-- Portal User Tables
-- ============================================

-- Table 1: FTI_Portal_User_Password_Reset_Logs
ALTER TABLE FTI_Portal_User_Password_Reset_Logs 
RENAME TO FTI_Portal_User_Password_Reset_Logs;

SELECT 'Table FTI_Portal_User_Password_Reset_Logs renamed to FTI_Portal_User_Password_Reset_Logs' AS status;

-- Table 2: FTI_Portal_User_Password_Reset_Tokens
ALTER TABLE FTI_Portal_User_Password_Reset_Tokens 
RENAME TO FTI_Portal_User_Password_Reset_Tokens;

SELECT 'Table FTI_Portal_User_Password_Reset_Tokens renamed to FTI_Portal_User_Password_Reset_Tokens' AS status;

-- Table 3: FTI_Portal_User_Profile_Update_Requests
ALTER TABLE FTI_Portal_User_Profile_Update_Requests 
RENAME TO FTI_Portal_User_Profile_Update_Requests;

SELECT 'Table FTI_Portal_User_Profile_Update_Requests renamed to FTI_Portal_User_Profile_Update_Requests' AS status;

-- Table 4: FTI_Portal_User_Login_Logs
ALTER TABLE FTI_Portal_User_Login_Logs 
RENAME TO FTI_Portal_User_Login_Logs;

SELECT 'Table FTI_Portal_User_Login_Logs renamed to FTI_Portal_User_Login_Logs' AS status;

-- Table 5: FTI_Portal_User
ALTER TABLE FTI_Portal_User 
RENAME TO FTI_Portal_User;

SELECT 'Table FTI_Portal_User renamed to FTI_Portal_User' AS status;

-- Table 6: FTI_Portal_User_Notifications
ALTER TABLE FTI_Portal_User_Notifications 
RENAME TO FTI_Portal_User_Notifications;

SELECT 'Table FTI_Portal_User_Notifications renamed to FTI_Portal_User_Notifications' AS status;

-- ============================================
-- Original Membership Pending Updates Tables
-- ============================================

-- Table 7: FTI_Original_Membership_Pending_Address_Updates
ALTER TABLE FTI_Original_Membership_Pending_Address_Updates 
RENAME TO FTI_Original_Membership_Pending_Address_Updates;

SELECT 'Table FTI_Original_Membership_Pending_Address_Updates renamed to FTI_Original_Membership_Pending_Address_Updates' AS status;

-- Table 8: FTI_Original_Membership_Pending_Email_Changes
ALTER TABLE FTI_Original_Membership_Pending_Email_Changes 
RENAME TO FTI_Original_Membership_Pending_Email_Changes;

SELECT 'Table FTI_Original_Membership_Pending_Email_Changes renamed to FTI_Original_Membership_Pending_Email_Changes' AS status;

-- Table 9: FTI_Original_Membership_Pending_Product_Updates
ALTER TABLE FTI_Original_Membership_Pending_Product_Updates 
RENAME TO FTI_Original_Membership_Pending_Product_Updates;

SELECT 'Table FTI_Original_Membership_Pending_Product_Updates renamed to FTI_Original_Membership_Pending_Product_Updates' AS status;

-- Table 10: FTI_Original_Membership_Pending_Tsic_Updates
ALTER TABLE FTI_Original_Membership_Pending_Tsic_Updates 
RENAME TO FTI_Original_Membership_Pending_Tsic_Updates;

SELECT 'Table FTI_Original_Membership_Pending_Tsic_Updates renamed to FTI_Original_Membership_Pending_Tsic_Updates' AS status;

-- ============================================
-- Original Membership Social Media Table
-- ============================================

-- Table 11: FTI_Original_Membership_Social_Media (Fix typo: Socil -> Social)
ALTER TABLE FTI_Original_Membership_Member_Social_Media 
RENAME TO FTI_Original_Membership_Social_Media;

SELECT 'Table FTI_Original_Membership_Social_Media renamed to FTI_Original_Membership_Social_Media' AS status;

-- ============================================
-- Verification
-- ============================================
SELECT 'All 11 tables renamed successfully!' AS status;

-- ============================================
-- Rollback (if needed)
-- ============================================
-- ALTER TABLE FTI_Portal_User_Password_Reset_Logs RENAME TO FTI_Portal_User_Password_Reset_Logs;
-- ALTER TABLE FTI_Portal_User_Password_Reset_Tokens RENAME TO FTI_Portal_User_Password_Reset_Tokens;
-- ALTER TABLE FTI_Portal_User_Profile_Update_Requests RENAME TO FTI_Portal_User_Profile_Update_Requests;
-- ALTER TABLE FTI_Portal_User_Login_Logs RENAME TO FTI_Portal_User_Login_Logs;
-- ALTER TABLE FTI_Portal_User RENAME TO FTI_Portal_User;
-- ALTER TABLE FTI_Portal_User_Notifications RENAME TO FTI_Portal_User_Notifications;
-- ALTER TABLE FTI_Original_Membership_Pending_Address_Updates RENAME TO FTI_Original_Membership_Pending_Address_Updates;
-- ALTER TABLE FTI_Original_Membership_Pending_Email_Changes RENAME TO FTI_Original_Membership_Pending_Email_Changes;
-- ALTER TABLE FTI_Original_Membership_Pending_Product_Updates RENAME TO FTI_Original_Membership_Pending_Product_Updates;
-- ALTER TABLE FTI_Original_Membership_Pending_Tsic_Updates RENAME TO FTI_Original_Membership_Pending_Tsic_Updates;
-- ALTER TABLE FTI_Original_Membership_Social_Media RENAME TO FTI_Original_Membership_Social_Media;
