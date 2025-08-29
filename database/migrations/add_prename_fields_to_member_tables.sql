-- Add prename fields for Contact Person and Representatives across membership types
-- IC has representatives only (no contact person)
-- Fields added:
--   prename_th VARCHAR(50) NULL           -- นาย / นาง / นางสาว / อื่นๆ
--   prename_en VARCHAR(50) NULL           -- Mr / Mrs / Ms / Other
--   prename_other VARCHAR(100) NULL       -- Free text when selecting 'อื่นๆ' / 'Other'

-- ===== OC =====
ALTER TABLE `MemberRegist_OC_ContactPerson`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;

ALTER TABLE `MemberRegist_OC_Representatives`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;

-- ===== AC =====
ALTER TABLE `MemberRegist_AC_ContactPerson`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;

ALTER TABLE `MemberRegist_AC_Representatives`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;

-- ===== AM =====
ALTER TABLE `MemberRegist_AM_ContactPerson`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;

ALTER TABLE `MemberRegist_AM_Representatives`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;

-- ===== IC =====
ALTER TABLE `MemberRegist_IC_Representatives`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;
