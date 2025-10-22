-- Migration: Add Soft Delete columns to all Main tables
-- Created: 2025-01-22
-- Purpose: Support resubmission workflow with version tracking

-- Add columns to OC Main
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 COMMENT 'Version number for tracking resubmissions',
ADD COLUMN IF NOT EXISTS parent_id INT NULL COMMENT 'Reference to previous version (if resubmitted)',
ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0 COMMENT '1 = archived (replaced by newer version)',
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP NULL COMMENT 'When this was resubmitted',
ADD INDEX idx_parent_id (parent_id),
ADD INDEX idx_version (version),
ADD INDEX idx_archived (is_archived);

-- Add columns to AC Main
ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 COMMENT 'Version number for tracking resubmissions',
ADD COLUMN IF NOT EXISTS parent_id INT NULL COMMENT 'Reference to previous version (if resubmitted)',
ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0 COMMENT '1 = archived (replaced by newer version)',
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP NULL COMMENT 'When this was resubmitted',
ADD INDEX idx_parent_id (parent_id),
ADD INDEX idx_version (version),
ADD INDEX idx_archived (is_archived);

-- Add columns to AM Main
ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 COMMENT 'Version number for tracking resubmissions',
ADD COLUMN IF NOT EXISTS parent_id INT NULL COMMENT 'Reference to previous version (if resubmitted)',
ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0 COMMENT '1 = archived (replaced by newer version)',
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP NULL COMMENT 'When this was resubmitted',
ADD INDEX idx_parent_id (parent_id),
ADD INDEX idx_version (version),
ADD INDEX idx_archived (is_archived);

-- Add columns to IC Main
ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 COMMENT 'Version number for tracking resubmissions',
ADD COLUMN IF NOT EXISTS parent_id INT NULL COMMENT 'Reference to previous version (if resubmitted)',
ADD COLUMN IF NOT EXISTS is_archived TINYINT(1) DEFAULT 0 COMMENT '1 = archived (replaced by newer version)',
ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP NULL COMMENT 'When this was resubmitted',
ADD INDEX idx_parent_id (parent_id),
ADD INDEX idx_version (version),
ADD INDEX idx_archived (is_archived);

-- Add comment to explain the workflow
-- Workflow:
-- 1. User submits application (version=1, parent_id=NULL, is_archived=0)
-- 2. Admin rejects (status=2)
-- 3. User resubmits -> Create NEW application (version=2, parent_id=old_id, is_archived=0)
-- 4. Mark old application (is_archived=1, resubmitted_at=NOW())
