-- Migration to increase draft_data column size for all membership types
-- This fixes the issue where draft data gets truncated due to size limitations

-- Increase draft_data column size for OC draft table
ALTER TABLE MemberRegist_OC_Draft 
MODIFY COLUMN draft_data LONGTEXT COMMENT 'ข้อมูลร่างการสมัครสมาชิก (JSON format)';

-- Increase draft_data column size for AC draft table  
ALTER TABLE MemberRegist_AC_Draft 
MODIFY COLUMN draft_data LONGTEXT COMMENT 'ข้อมูลร่างการสมัครสมาชิก (JSON format)';

-- Increase draft_data column size for AM draft table
ALTER TABLE MemberRegist_AM_Draft 
MODIFY COLUMN draft_data LONGTEXT COMMENT 'ข้อมูลร่างการสมัครสมาชิก (JSON format)';

-- Increase draft_data column size for IC draft table
ALTER TABLE MemberRegist_IC_Draft 
MODIFY COLUMN draft_data LONGTEXT COMMENT 'ข้อมูลร่างการสมัครสมาชิก (JSON format)';

-- Add proper indexes for better performance with larger text fields
CREATE INDEX idx_oc_draft_status ON MemberRegist_OC_Draft(status);
CREATE INDEX idx_ac_draft_status ON MemberRegist_AC_Draft(status);
CREATE INDEX idx_am_draft_status ON MemberRegist_AM_Draft(status);
CREATE INDEX idx_ic_draft_status ON MemberRegist_IC_Draft(status);
