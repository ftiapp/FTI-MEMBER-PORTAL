-- Migration: Add rejection fields directly to Main tables
-- Purpose: Store rejection info in Main table instead of separate Reject_DATA table

-- Add to OC Main
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL COMMENT 'เหตุผลที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejection_details TEXT NULL COMMENT 'รายละเอียดเพิ่มเติม',
ADD COLUMN IF NOT EXISTS rejected_by INT NULL COMMENT 'Admin ID ที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL COMMENT 'วันที่ปฏิเสธ';

-- Add to AC Main
ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL COMMENT 'เหตุผลที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejection_details TEXT NULL COMMENT 'รายละเอียดเพิ่มเติม',
ADD COLUMN IF NOT EXISTS rejected_by INT NULL COMMENT 'Admin ID ที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL COMMENT 'วันที่ปฏิเสธ';

-- Add to AM Main
ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL COMMENT 'เหตุผลที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejection_details TEXT NULL COMMENT 'รายละเอียดเพิ่มเติม',
ADD COLUMN IF NOT EXISTS rejected_by INT NULL COMMENT 'Admin ID ที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL COMMENT 'วันที่ปฏิเสธ';

-- Add to IC Main
ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL COMMENT 'เหตุผลที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejection_details TEXT NULL COMMENT 'รายละเอียดเพิ่มเติม',
ADD COLUMN IF NOT EXISTS rejected_by INT NULL COMMENT 'Admin ID ที่ปฏิเสธ',
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL COMMENT 'วันที่ปฏิเสธ';

-- Status values:
-- 0 = Pending (รอพิจารณา)
-- 1 = Approved (อนุมัติ)
-- 2 = Rejected (ปฏิเสธ - สามารถแก้ไขส่งใหม่ได้)
-- 3 = Archived (ถูกแทนที่ด้วย version ใหม่)
