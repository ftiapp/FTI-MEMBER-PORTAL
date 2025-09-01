-- Migration: Add position fields to authorized signatory name tables for all membership types

-- OC
ALTER TABLE MemberRegist_OC_Signature_Name
  ADD COLUMN IF NOT EXISTS position_th VARCHAR(150) NULL AFTER last_name_en,
  ADD COLUMN IF NOT EXISTS position_en VARCHAR(150) NULL AFTER position_th;

-- AC
ALTER TABLE MemberRegist_AC_Signature_Name
  ADD COLUMN IF NOT EXISTS position_th VARCHAR(150) NULL AFTER last_name_en,
  ADD COLUMN IF NOT EXISTS position_en VARCHAR(150) NULL AFTER position_th;

-- AM
ALTER TABLE MemberRegist_AM_Signature_Name
  ADD COLUMN IF NOT EXISTS position_th VARCHAR(150) NULL AFTER last_name_en,
  ADD COLUMN IF NOT EXISTS position_en VARCHAR(150) NULL AFTER position_th;

-- IC
ALTER TABLE MemberRegist_IC_Signature_Name
  ADD COLUMN IF NOT EXISTS position_th VARCHAR(150) NULL AFTER last_name_en,
  ADD COLUMN IF NOT EXISTS position_en VARCHAR(150) NULL AFTER position_th;
