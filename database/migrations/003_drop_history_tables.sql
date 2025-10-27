-- =====================================================
-- Migration: Drop All History Tables
-- Description: Clean up and prepare for fresh creation
-- Date: 2025-01-24
-- =====================================================

-- Drop OC History Tables
DROP TABLE IF EXISTS MemberRegist_Reject_OC_Signature_Name_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_Documents_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_ContactPerson_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_ProvinceChapters_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_IndustryGroups_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_BusinessTypeOther_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_BusinessTypes_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_Products_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_Representatives_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_Address_History;
DROP TABLE IF EXISTS MemberRegist_Reject_OC_Main_History;

-- Drop AC History Tables
DROP TABLE IF EXISTS MemberRegist_Reject_AC_Signature_Name_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_Documents_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_ContactPerson_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_ProvinceChapters_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_IndustryGroups_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_BusinessTypeOther_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_BusinessTypes_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_Products_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_Representatives_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_Address_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AC_Main_History;

-- Drop AM History Tables
DROP TABLE IF EXISTS MemberRegist_Reject_AM_Signature_Name_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_Documents_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_ContactPerson_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_BusinessTypeOther_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_BusinessTypes_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_Products_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_Representatives_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_Address_History;
DROP TABLE IF EXISTS MemberRegist_Reject_AM_Main_History;

-- Drop IC History Tables
DROP TABLE IF EXISTS MemberRegist_Reject_IC_BusinessTypeOther_History;
DROP TABLE IF EXISTS MemberRegist_Reject_IC_BusinessTypes_History;
DROP TABLE IF EXISTS MemberRegist_Reject_IC_Products_History;
DROP TABLE IF EXISTS MemberRegist_Reject_IC_Address_History;
DROP TABLE IF EXISTS MemberRegist_Reject_IC_Main_History;

-- Drop Rejection Tables
DROP TABLE IF EXISTS MemberRegist_Rejection_Conversations;
DROP TABLE IF EXISTS MemberRegist_Rejections;
DROP VIEW IF EXISTS v_rejections_with_details;
