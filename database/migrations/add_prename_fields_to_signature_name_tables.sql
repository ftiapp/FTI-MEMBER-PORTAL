-- Add prename fields to authorized signature name tables for AM/OC/AC
-- Columns to add (all NULLable):
--   prename_th VARCHAR(50)
--   prename_en VARCHAR(50)
--   prename_other VARCHAR(100)
--   prename_other_en VARCHAR(100)

-- ===== AM =====
ALTER TABLE `MemberRegist_AM_Signature_Name`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`,
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;

-- ===== OC =====
ALTER TABLE `MemberRegist_OC_Signature_Name`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`,
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;

-- ===== AC =====
ALTER TABLE `MemberRegist_AC_Signature_Name`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`,
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;
