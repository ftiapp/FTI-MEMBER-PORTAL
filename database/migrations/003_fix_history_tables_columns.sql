-- =====================================================
-- Migration: Fix History Tables Column Names
-- Description: Rename columns to match original tables
-- Date: 2025-01-24
-- =====================================================

-- OC Representatives History
ALTER TABLE MemberRegist_OC_Representatives_History
CHANGE COLUMN first_name_thai first_name_th VARCHAR(255),
CHANGE COLUMN last_name_thai last_name_th VARCHAR(255),
CHANGE COLUMN first_name_english first_name_en VARCHAR(255),
CHANGE COLUMN last_name_english last_name_en VARCHAR(255),
MODIFY COLUMN phone VARCHAR(50);

-- OC Products History - Fix to match original table
ALTER TABLE MemberRegist_OC_Products_History
DROP COLUMN product_type,
DROP COLUMN hs_code,
CHANGE COLUMN product_name name_th VARCHAR(255),
ADD COLUMN name_en VARCHAR(255) AFTER name_th;

-- AC Representatives History
ALTER TABLE MemberRegist_AC_Representatives_History
CHANGE COLUMN first_name_thai first_name_th VARCHAR(255),
CHANGE COLUMN last_name_thai last_name_th VARCHAR(255),
CHANGE COLUMN first_name_english first_name_en VARCHAR(255),
CHANGE COLUMN last_name_english last_name_en VARCHAR(255);

-- AC Products History - Fix to match original table
ALTER TABLE MemberRegist_AC_Products_History
DROP COLUMN product_type,
DROP COLUMN hs_code,
CHANGE COLUMN product_name name_th VARCHAR(255),
ADD COLUMN name_en VARCHAR(255) AFTER name_th;

-- AM Representatives History
ALTER TABLE MemberRegist_AM_Representatives_History
CHANGE COLUMN first_name_thai first_name_th VARCHAR(255),
CHANGE COLUMN last_name_thai last_name_th VARCHAR(255);

-- AM Products History - Fix to match original table
ALTER TABLE MemberRegist_AM_Products_History
DROP COLUMN product_type,
CHANGE COLUMN product_name name_th VARCHAR(255),
ADD COLUMN name_en VARCHAR(255) AFTER name_th;

-- IC Products History - Fix to match original table
ALTER TABLE MemberRegist_IC_Products_History
DROP COLUMN product_type,
CHANGE COLUMN product_name name_th VARCHAR(255),
ADD COLUMN name_en VARCHAR(255) AFTER name_th;

-- OC BusinessTypeOther History - Fix to match original table
ALTER TABLE MemberRegist_OC_BusinessTypeOther_History
CHANGE COLUMN other_business_type_detail detail TEXT;

-- AC BusinessTypeOther History - Fix to match original table
ALTER TABLE MemberRegist_AC_BusinessTypeOther_History
CHANGE COLUMN other_business_type_detail detail TEXT;

-- AM BusinessTypeOther History - Fix to match original table
ALTER TABLE MemberRegist_AM_BusinessTypeOther_History
CHANGE COLUMN other_business_type_detail detail TEXT;

-- IC BusinessTypeOther History - Fix to match original table
ALTER TABLE MemberRegist_IC_BusinessTypeOther_History
CHANGE COLUMN other_business_type_detail detail TEXT;
