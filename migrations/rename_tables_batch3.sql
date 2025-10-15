-- Migration: Rename multiple tables - Batch 3
-- Date: 2025-10-15
-- Description: Rename 10 tables to follow FTI naming standards

-- ============================================
-- Contact Message Tables
-- ============================================

-- Table 1: FTI_Portal_User_Contact_Message_Replies
ALTER TABLE FTI_Portal_User_Contact_Message_Replies 
RENAME TO FTI_Portal_User_Contact_Message_Replies;

SELECT 'Table FTI_Portal_User_Contact_Message_Replies renamed to FTI_Portal_User_Contact_Message_Replies' AS status;

-- Table 2: FTI_Portal_User_Contact_Message_Responses
ALTER TABLE FTI_Portal_User_Contact_Message_Responses 
RENAME TO FTI_Portal_User_Contact_Message_Responses;

SELECT 'Table FTI_Portal_User_Contact_Message_Responses renamed to FTI_Portal_User_Contact_Message_Responses' AS status;

-- Table 3: FTI_Portal_User_Contact_Messages
ALTER TABLE FTI_Portal_User_Contact_Messages 
RENAME TO FTI_Portal_User_Contact_Messages;

SELECT 'Table FTI_Portal_User_Contact_Messages renamed to FTI_Portal_User_Contact_Messages' AS status;

-- Table 4: FTI_Portal_Guest_Contact_Messages
ALTER TABLE FTI_Portal_Guest_Contact_Messages 
RENAME TO FTI_Portal_Guest_Contact_Messages;

SELECT 'Table FTI_Portal_Guest_Contact_Messages renamed to FTI_Portal_Guest_Contact_Messages' AS status;

-- ============================================
-- Company Logos Table
-- ============================================

-- Table 5: FTI_Original_Membership_Company_Logos
ALTER TABLE FTI_Original_Membership_Company_Logos 
RENAME TO FTI_Original_Membership_Company_Logos;

SELECT 'Table FTI_Original_Membership_Company_Logos renamed to FTI_Original_Membership_Company_Logos' AS status;

-- ============================================
-- Admin Tables
-- ============================================

-- Table 6: FTI_Portal_Admin_Actions_Logs
ALTER TABLE FTI_Portal_Admin_Actions_Logs 
RENAME TO FTI_Portal_Admin_Actions_Logs;

SELECT 'Table FTI_Portal_Admin_Actions_Logs renamed to FTI_Portal_Admin_Actions_Logs' AS status;

-- Table 7: FTI_Portal_Admin_Actions_Logs_Backup
ALTER TABLE FTI_Portal_Admin_Actions_Logs_Backup 
RENAME TO FTI_Portal_Admin_Actions_Logs_Backup;

SELECT 'Table FTI_Portal_Admin_Actions_Logs_Backup renamed to FTI_Portal_Admin_Actions_Logs_Backup' AS status;

-- Table 8: FTI_Portal_Admin_Invitation_Tokens
ALTER TABLE FTI_Portal_Admin_Invitation_Tokens 
RENAME TO FTI_Portal_Admin_Invitation_Tokens;

SELECT 'Table FTI_Portal_Admin_Invitation_Tokens renamed to FTI_Portal_Admin_Invitation_Tokens' AS status;

-- Table 9: FTI_Portal_Admin_Settings
ALTER TABLE FTI_Portal_Admin_Settings 
RENAME TO FTI_Portal_Admin_Settings;

SELECT 'Table FTI_Portal_Admin_Settings renamed to FTI_Portal_Admin_Settings' AS status;

-- Table 10: FTI_Portal_Admin_Users
ALTER TABLE FTI_Portal_Admin_Users 
RENAME TO FTI_Portal_Admin_Users;

SELECT 'Table FTI_Portal_Admin_Users renamed to FTI_Portal_Admin_Users' AS status;

-- ============================================
-- Verification
-- ============================================
SELECT 'All 10 tables renamed successfully!' AS status;

-- ============================================
-- Rollback (if needed)
-- ============================================
-- ALTER TABLE FTI_Portal_User_Contact_Message_Replies RENAME TO FTI_Portal_User_Contact_Message_Replies;
-- ALTER TABLE FTI_Portal_User_Contact_Message_Responses RENAME TO FTI_Portal_User_Contact_Message_Responses;
-- ALTER TABLE FTI_Portal_User_Contact_Messages RENAME TO FTI_Portal_User_Contact_Messages;
-- ALTER TABLE FTI_Portal_Guest_Contact_Messages RENAME TO FTI_Portal_Guest_Contact_Messages;
-- ALTER TABLE FTI_Original_Membership_Company_Logos RENAME TO FTI_Original_Membership_Company_Logos;
-- ALTER TABLE FTI_Portal_Admin_Actions_Logs RENAME TO FTI_Portal_Admin_Actions_Logs;
-- ALTER TABLE FTI_Portal_Admin_Actions_Logs_Backup RENAME TO FTI_Portal_Admin_Actions_Logs_Backup;
-- ALTER TABLE FTI_Portal_Admin_Invitation_Tokens RENAME TO FTI_Portal_Admin_Invitation_Tokens;
-- ALTER TABLE FTI_Portal_Admin_Settings RENAME TO FTI_Portal_Admin_Settings;
-- ALTER TABLE FTI_Portal_Admin_Users RENAME TO FTI_Portal_Admin_Users;
