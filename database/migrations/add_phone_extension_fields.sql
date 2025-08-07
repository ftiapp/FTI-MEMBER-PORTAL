-- Migration: Add phone extension fields to all relevant tables
-- Date: 2025-01-07
-- Description: Add phone_extension fields to support phone numbers with extensions (ต่อ)
-- Applies to: ContactPerson, Representatives, and Main tables for OC, AC, AM

-- =============================================================================
-- 1. ContactPerson Tables (OC, AC, AM)
-- =============================================================================

-- Add phone_extension field to OC ContactPerson table
ALTER TABLE MemberRegist_OC_ContactPerson 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- Add phone_extension field to AC ContactPerson table  
ALTER TABLE MemberRegist_AC_ContactPerson 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- Add phone_extension field to AM ContactPerson table
ALTER TABLE MemberRegist_AM_ContactPerson 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- =============================================================================
-- 2. Representatives Tables (OC, AC, AM)
-- =============================================================================

-- Add phone_extension field to OC Representatives table
ALTER TABLE MemberRegist_OC_Representatives 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- Add phone_extension field to AC Representatives table
ALTER TABLE MemberRegist_AC_Representatives 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- Add phone_extension field to AM Representatives table
ALTER TABLE MemberRegist_AM_Representatives 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- =============================================================================
-- 3. Main Tables - Company Phone Extension (OC, AC, AM)
-- =============================================================================

-- Add company_phone_extension field to OC Main table
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN company_phone_extension VARCHAR(10) NULL COMMENT 'Company phone extension number (ต่อ)';

-- Add company_phone_extension field to AC Main table
ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN company_phone_extension VARCHAR(10) NULL COMMENT 'Company phone extension number (ต่อ)';

-- Add company_phone_extension field to AM Main table
ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN company_phone_extension VARCHAR(10) NULL COMMENT 'Company phone extension number (ต่อ)';

-- =============================================================================
-- 4. IC Tables - Main and Representatives (IC does not have ContactPerson)
-- =============================================================================

-- Add phone_extension field to IC Main table (for main phone)
ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Main phone extension number (ต่อ)';

-- Add phone_extension field to IC Representatives table
ALTER TABLE MemberRegist_IC_Representatives 
ADD COLUMN phone_extension VARCHAR(10) NULL COMMENT 'Phone extension number (ต่อ)';

-- =============================================================================
-- 5. Indexes for Performance (Optional)
-- =============================================================================

-- ContactPerson indexes
CREATE INDEX idx_oc_contact_phone_ext ON MemberRegist_OC_ContactPerson(phone_extension);
CREATE INDEX idx_ac_contact_phone_ext ON MemberRegist_AC_ContactPerson(phone_extension);  
CREATE INDEX idx_am_contact_phone_ext ON MemberRegist_AM_ContactPerson(phone_extension);

-- Representatives indexes
CREATE INDEX idx_oc_rep_phone_ext ON MemberRegist_OC_Representatives(phone_extension);
CREATE INDEX idx_ac_rep_phone_ext ON MemberRegist_AC_Representatives(phone_extension);
CREATE INDEX idx_am_rep_phone_ext ON MemberRegist_AM_Representatives(phone_extension);

-- Main tables indexes
CREATE INDEX idx_oc_main_company_phone_ext ON MemberRegist_OC_Main(company_phone_extension);
CREATE INDEX idx_ac_main_company_phone_ext ON MemberRegist_AC_Main(company_phone_extension);
CREATE INDEX idx_am_main_company_phone_ext ON MemberRegist_AM_Main(company_phone_extension);

-- IC tables indexes
CREATE INDEX idx_ic_main_phone_ext ON MemberRegist_IC_Main(phone_extension);
CREATE INDEX idx_ic_rep_phone_ext ON MemberRegist_IC_Representatives(phone_extension);

-- =============================================================================
-- Notes:
-- =============================================================================
-- - IC membership type does not have ContactPerson table
-- - IC only has Representatives and Main contact (if needed in future)
-- - All phone_extension fields are nullable (optional)
-- - Extension format: typically 3-4 digits (e.g., "1234", "101")
