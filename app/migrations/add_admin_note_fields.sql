-- Add admin_note and admin_note_by fields to MemberRegist_OC_Main
ALTER TABLE MemberRegist_OC_Main
ADD COLUMN admin_note TEXT NULL AFTER rejection_reason,
ADD COLUMN admin_note_by INT NULL AFTER admin_note,
ADD COLUMN admin_note_at TIMESTAMP NULL AFTER admin_note_by;

-- Add admin_note and admin_note_by fields to MemberRegist_AM_Main
ALTER TABLE MemberRegist_AM_Main
ADD COLUMN admin_note TEXT NULL AFTER rejection_reason,
ADD COLUMN admin_note_by INT NULL AFTER admin_note,
ADD COLUMN admin_note_at TIMESTAMP NULL AFTER admin_note_by;

-- Add admin_note and admin_note_by fields to MemberRegist_AC_Main
ALTER TABLE MemberRegist_AC_Main
ADD COLUMN admin_note TEXT NULL AFTER rejection_reason,
ADD COLUMN admin_note_by INT NULL AFTER admin_note,
ADD COLUMN admin_note_at TIMESTAMP NULL AFTER admin_note_by;

-- Add admin_note and admin_note_by fields to ICmember_Info
ALTER TABLE MemberRegist_IC_Main
ADD COLUMN admin_note TEXT NULL AFTER rejection_reason,
ADD COLUMN admin_note_by INT NULL AFTER admin_note,
ADD COLUMN admin_note_at TIMESTAMP NULL AFTER admin_note_by;
