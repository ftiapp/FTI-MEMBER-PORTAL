-- Add prename fields to MemberRegist_IC_Main for IC applicant
ALTER TABLE `MemberRegist_IC_Main`
  ADD COLUMN `prename_th` VARCHAR(50) NULL AFTER `id_card_number`,
  ADD COLUMN `prename_en` VARCHAR(50) NULL AFTER `prename_th`,
  ADD COLUMN `prename_other` VARCHAR(100) NULL AFTER `prename_en`;
