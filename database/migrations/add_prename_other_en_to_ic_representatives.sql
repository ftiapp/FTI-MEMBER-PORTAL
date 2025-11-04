-- Add English 'Other' prename field for IC representatives
-- Column: prename_other_en VARCHAR(100) NULL

-- ===== IC =====
ALTER TABLE `MemberRegist_IC_Representatives`
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;
