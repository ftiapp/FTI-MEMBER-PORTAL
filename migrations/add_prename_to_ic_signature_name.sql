-- Add prename fields to MemberRegist_IC_Signature_Name
ALTER TABLE `MemberRegist_IC_Signature_Name`
  ADD COLUMN IF NOT EXISTS `prename_th` VARCHAR(50) NULL AFTER `main_id`,
  ADD COLUMN IF NOT EXISTS `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN IF NOT EXISTS `prename_other` VARCHAR(150) NULL AFTER `prename_en`,
  ADD COLUMN IF NOT EXISTS `prename_other_en` VARCHAR(150) NULL AFTER `prename_other`;
