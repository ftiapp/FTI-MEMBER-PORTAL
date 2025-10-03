-- Add English 'Other' prename field for representatives across membership types (AM/OC/AC)
-- Column: prename_other_en VARCHAR(100) NULL

-- ===== OC =====
ALTER TABLE `MemberRegist_OC_Representatives`
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;

-- ===== AC =====
ALTER TABLE `MemberRegist_AC_Representatives`
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;

-- ===== AM =====
ALTER TABLE `MemberRegist_AM_Representatives`
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;
