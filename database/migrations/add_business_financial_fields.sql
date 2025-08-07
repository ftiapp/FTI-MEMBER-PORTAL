-- Add business and financial fields to OC, AC, and AM membership tables
-- These fields are optional and not required for form submission

-- Add fields to OC (Ordinary Company) table
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN registered_capital DECIMAL(15,2) NULL COMMENT 'ทุนจดทะเบียน',
ADD COLUMN production_capacity_value DECIMAL(15,2) NULL COMMENT 'กำลังการผลิต (ค่า)',
ADD COLUMN production_capacity_unit VARCHAR(100) NULL COMMENT 'กำลังการผลิต (หน่วย)',
ADD COLUMN sales_domestic DECIMAL(15,2) NULL COMMENT 'ยอดจำหน่ายในประเทศ',
ADD COLUMN sales_export DECIMAL(15,2) NULL COMMENT 'ยอดจำหน่ายส่งออก',
ADD COLUMN shareholder_thai_percent DECIMAL(5,2) NULL COMMENT 'สัดส่วนผู้ถือหุ้นไทย (%)',
ADD COLUMN shareholder_foreign_percent DECIMAL(5,2) NULL COMMENT 'สัดส่วนผู้ถือหุ้นต่างประเทศ (%)';

-- Add fields to AC (Associate Company) table
ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN registered_capital DECIMAL(15,2) NULL COMMENT 'ทุนจดทะเบียน',
ADD COLUMN production_capacity_value DECIMAL(15,2) NULL COMMENT 'กำลังการผลิต (ค่า)',
ADD COLUMN production_capacity_unit VARCHAR(100) NULL COMMENT 'กำลังการผลิต (หน่วย)',
ADD COLUMN sales_domestic DECIMAL(15,2) NULL COMMENT 'ยอดจำหน่ายในประเทศ',
ADD COLUMN sales_export DECIMAL(15,2) NULL COMMENT 'ยอดจำหน่ายส่งออก',
ADD COLUMN shareholder_thai_percent DECIMAL(5,2) NULL COMMENT 'สัดส่วนผู้ถือหุ้นไทย (%)',
ADD COLUMN shareholder_foreign_percent DECIMAL(5,2) NULL COMMENT 'สัดส่วนผู้ถือหุ้นต่างประเทศ (%)';

-- Add fields to AM (Association Member) table
ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN registered_capital DECIMAL(15,2) NULL COMMENT 'ทุนจดทะเบียน',
ADD COLUMN production_capacity_value DECIMAL(15,2) NULL COMMENT 'กำลังการผลิต (ค่า)',
ADD COLUMN production_capacity_unit VARCHAR(100) NULL COMMENT 'กำลังการผลิต (หน่วย)',
ADD COLUMN sales_domestic DECIMAL(15,2) NULL COMMENT 'ยอดจำหน่ายในประเทศ',
ADD COLUMN sales_export DECIMAL(15,2) NULL COMMENT 'ยอดจำหน่ายส่งออก',
ADD COLUMN shareholder_thai_percent DECIMAL(5,2) NULL COMMENT 'สัดส่วนผู้ถือหุ้นไทย (%)',
ADD COLUMN shareholder_foreign_percent DECIMAL(5,2) NULL COMMENT 'สัดส่วนผู้ถือหุ้นต่างประเทศ (%)';

-- Add indexes for better performance on financial data queries
CREATE INDEX idx_oc_registered_capital ON MemberRegist_OC_Main(registered_capital);
CREATE INDEX idx_oc_sales_total ON MemberRegist_OC_Main(sales_domestic, sales_export);

CREATE INDEX idx_ac_registered_capital ON MemberRegist_AC_Main(registered_capital);
CREATE INDEX idx_ac_sales_total ON MemberRegist_AC_Main(sales_domestic, sales_export);

CREATE INDEX idx_am_registered_capital ON MemberRegist_AM_Main(registered_capital);
CREATE INDEX idx_am_sales_total ON MemberRegist_AM_Main(sales_domestic, sales_export);
