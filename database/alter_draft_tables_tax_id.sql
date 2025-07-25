-- ALTER TABLE scripts to add tax_id/idcard columns to draft tables
-- Run these SQL commands to update database schema

-- 1. Add tax_id column to OC draft table
ALTER TABLE MemberRegist_OC_Draft 
ADD COLUMN tax_id VARCHAR(20) NULL AFTER draft_data;

-- 2. Add tax_id column to AC draft table  
ALTER TABLE MemberRegist_AC_Draft 
ADD COLUMN tax_id VARCHAR(20) NULL AFTER draft_data;

-- 3. Add tax_id column to AM draft table
ALTER TABLE MemberRegist_AM_Draft 
ADD COLUMN tax_id VARCHAR(20) NULL AFTER draft_data;

-- 4. Add idcard column to IC draft table (IC uses ID card instead)
ALTER TABLE MemberRegist_IC_Draft 
ADD COLUMN idcard VARCHAR(20) NULL AFTER draft_data;

-- 5. Create indexes for better performance on deletion
CREATE INDEX idx_oc_draft_tax_id ON MemberRegist_OC_Draft(tax_id);
CREATE INDEX idx_ac_draft_tax_id ON MemberRegist_AC_Draft(tax_id);
CREATE INDEX idx_am_draft_tax_id ON MemberRegist_AM_Draft(tax_id);
CREATE INDEX idx_ic_draft_idcard ON MemberRegist_IC_Draft(idcard);

-- 6. Update existing drafts to extract tax_id from JSON draft_data (optional)
-- สำหรับ OC
UPDATE MemberRegist_OC_Draft 
SET tax_id = JSON_UNQUOTE(JSON_EXTRACT(draft_data, '$.taxId')) 
WHERE tax_id IS NULL AND JSON_EXTRACT(draft_data, '$.taxId') IS NOT NULL;

-- สำหรับ AC  
UPDATE MemberRegist_AC_Draft 
SET tax_id = JSON_UNQUOTE(JSON_EXTRACT(draft_data, '$.taxId')) 
WHERE tax_id IS NULL AND JSON_EXTRACT(draft_data, '$.taxId') IS NOT NULL;

-- สำหรับ AM
UPDATE MemberRegist_AM_Draft 
SET tax_id = JSON_UNQUOTE(JSON_EXTRACT(draft_data, '$.taxId')) 
WHERE tax_id IS NULL AND JSON_EXTRACT(draft_data, '$.taxId') IS NOT NULL;

-- สำหรับ IC (ใช้ idcard แทน)
UPDATE MemberRegist_IC_Draft 
SET idcard = JSON_UNQUOTE(JSON_EXTRACT(draft_data, '$.idcard')) 
WHERE idcard IS NULL AND JSON_EXTRACT(draft_data, '$.idcard') IS NOT NULL;
