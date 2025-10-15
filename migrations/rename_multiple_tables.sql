-- Migration: Rename multiple tables for better naming convention
-- Date: 2025-10-15
-- Description: Rename 4 tables to follow FTI naming standards

-- ============================================
-- Table 1: MemberRegist_Business_Categories
-- ============================================
ALTER TABLE MemberRegist_Business_Categories 
RENAME TO MemberRegist_MemberRegist_Business_Categories;

SELECT 'Table MemberRegist_Business_Categories renamed to MemberRegist_MemberRegist_Business_Categories' AS status;

-- ============================================
-- Table 2: FTI_Original_Membership_Documents_Member
-- ============================================
ALTER TABLE FTI_Original_Membership_Documents_Member 
RENAME TO FTI_Original_Membership_FTI_Original_Membership_Documents_Member;

SELECT 'Table FTI_Original_Membership_Documents_Member renamed to FTI_Original_Membership_FTI_Original_Membership_Documents_Member' AS status;

-- ============================================
-- Table 3: FTI_Original_Membership_Member_Tsic_Codes
-- ============================================
ALTER TABLE FTI_Original_Membership_Member_Tsic_Codes 
RENAME TO FTI_Original_Membership_FTI_Original_Membership_Member_Tsic_Codes;

SELECT 'Table FTI_Original_Membership_Member_Tsic_Codes renamed to FTI_Original_Membership_FTI_Original_Membership_Member_Tsic_Codes' AS status;

-- ============================================
-- Table 4: FTI_Original_Membership_Member_Social_Media
-- ============================================
ALTER TABLE FTI_Original_Membership_Member_Social_Media 
RENAME TO FTI_Original_Membership_FTI_Original_Membership_Member_Social_Media;

SELECT 'Table FTI_Original_Membership_Member_Social_Media renamed to FTI_Original_Membership_FTI_Original_Membership_Member_Social_Media' AS status;

-- ============================================
-- Verification
-- ============================================
SELECT 'All tables renamed successfully!' AS status;

-- ============================================
-- Rollback (if needed)
-- ============================================
-- ALTER TABLE MemberRegist_MemberRegist_Business_Categories RENAME TO MemberRegist_Business_Categories;
-- ALTER TABLE FTI_Original_Membership_FTI_Original_Membership_Documents_Member RENAME TO FTI_Original_Membership_Documents_Member;
-- ALTER TABLE FTI_Original_Membership_FTI_Original_Membership_Member_Tsic_Codes RENAME TO FTI_Original_Membership_Member_Tsic_Codes;
-- ALTER TABLE FTI_Original_Membership_FTI_Original_Membership_Member_Social_Media RENAME TO FTI_Original_Membership_Member_Social_Media;
