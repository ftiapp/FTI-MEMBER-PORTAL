-- Add prename_other_en to IC Main and Representatives
ALTER TABLE `MemberRegist_IC_Main`
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;

ALTER TABLE `MemberRegist_IC_Representatives`
  ADD COLUMN `prename_other_en` VARCHAR(100) NULL AFTER `prename_other`;
