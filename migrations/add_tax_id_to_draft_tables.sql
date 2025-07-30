-- Migration to add tax_id column to draft tables for OC, AC, AM membership types
-- This enables tax ID based draft identification instead of user_id only

-- Add tax_id column to OC draft table
ALTER TABLE MemberRegist_OC_Draft 
ADD COLUMN tax_id VARCHAR(20) NOT NULL COMMENT 'เลขประจำตัวผู้เสียภาษีสำหรับระบุ draft แต่ละงาน';

-- Add tax_id column to AC draft table  
ALTER TABLE MemberRegist_AC_Draft 
ADD COLUMN tax_id VARCHAR(20) NOT NULL COMMENT 'เลขประจำตัวผู้เสียภาษีสำหรับระบุ draft แต่ละงาน';

-- Add tax_id column to AM draft table
ALTER TABLE MemberRegist_AM_Draft 
ADD COLUMN tax_id VARCHAR(20) NOT NULL COMMENT 'เลขประจำตัวผู้เสียภาษีสำหรับระบุ draft แต่ละงาน';

-- Add tax_id column to IC draft table
ALTER TABLE MemberRegist_IC_Draft 
ADD COLUMN tax_id VARCHAR(20) NOT NULL COMMENT 'เลขบัตรประชาชนสำหรับระบุ draft แต่ละงาน';

-- Create indexes for tax_id to improve query performance
CREATE INDEX idx_oc_draft_tax_id ON MemberRegist_OC_Draft(tax_id);
CREATE INDEX idx_ac_draft_tax_id ON MemberRegist_AC_Draft(tax_id);
CREATE INDEX idx_am_draft_tax_id ON MemberRegist_AM_Draft(tax_id);
CREATE INDEX idx_ic_draft_tax_id ON MemberRegist_IC_Draft(tax_id);

-- Update existing draft records to use a default tax_id (will need to be updated manually)
-- These will need to be updated with actual tax IDs when users save new drafts
