-- Add revenue fields (last 2 years) to OC, AC, and AM membership main tables
-- Fields are optional (NULL allowed)

-- OC
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN revenue_last_year DECIMAL(15,2) NULL COMMENT 'รายได้ปีล่าสุด',
ADD COLUMN revenue_previous_year DECIMAL(15,2) NULL COMMENT 'รายได้ปีก่อนหน้า';

-- AC
ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN revenue_last_year DECIMAL(15,2) NULL COMMENT 'รายได้ปีล่าสุด',
ADD COLUMN revenue_previous_year DECIMAL(15,2) NULL COMMENT 'รายได้ปีก่อนหน้า';

-- AM
ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN revenue_last_year DECIMAL(15,2) NULL COMMENT 'รายได้ปีล่าสุด',
ADD COLUMN revenue_previous_year DECIMAL(15,2) NULL COMMENT 'รายได้ปีก่อนหน้า';

-- Indexes (optional, uncomment if needed for reporting)
-- CREATE INDEX idx_oc_revenue ON MemberRegist_OC_Main(revenue_last_year, revenue_previous_year);
-- CREATE INDEX idx_ac_revenue ON MemberRegist_AC_Main(revenue_last_year, revenue_previous_year);
-- CREATE INDEX idx_am_revenue ON MemberRegist_AM_Main(revenue_last_year, revenue_previous_year);
