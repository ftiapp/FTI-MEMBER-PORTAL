-- Create separate table for rejection data to store complete application data for resubmission
-- This allows users to edit and resubmit rejected applications

CREATE TABLE MemberRegist_Reject_DATA (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membership_type ENUM('oc', 'ac', 'am', 'ic') NOT NULL COMMENT 'Type of membership application',
  membership_id INT NOT NULL COMMENT 'ID from the respective membership table',
  user_id INT NOT NULL COMMENT 'User who submitted the application',
  rejection_data LONGTEXT NOT NULL COMMENT 'Complete JSON data of rejected application for resubmission',
  admin_note TEXT NULL COMMENT 'Admin note/comment explaining rejection',
  admin_note_by INT NULL COMMENT 'Admin ID who rejected the application',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When rejection data was created',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When rejection data was last updated',
  resubmitted_at TIMESTAMP NULL COMMENT 'When user resubmitted the application',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this rejection data is still active (not resubmitted)',
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_note_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Indexes for better performance
  INDEX idx_membership_rejection_user_type (user_id, membership_type, is_active),
  INDEX idx_membership_rejection_membership (membership_type, membership_id),
  INDEX idx_membership_rejection_active (is_active, created_at),
  
  -- Unique constraint to prevent duplicate active rejections
  UNIQUE KEY unique_active_rejection (membership_type, membership_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores complete rejection data for membership applications to allow resubmission';

-- Add resubmission_count column to existing tables if not exists
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN IF NOT EXISTS resubmission_count INT DEFAULT 0 COMMENT 'Number of times resubmitted';

ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN IF NOT EXISTS resubmission_count INT DEFAULT 0 COMMENT 'Number of times resubmitted';

ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN IF NOT EXISTS resubmission_count INT DEFAULT 0 COMMENT 'Number of times resubmitted';

ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN IF NOT EXISTS resubmission_count INT DEFAULT 0 COMMENT 'Number of times resubmitted';

-- Add indexes for better performance on existing tables
CREATE INDEX IF NOT EXISTS idx_memberregist_oc_status_user ON MemberRegist_OC_Main(status, user_id);
CREATE INDEX IF NOT EXISTS idx_memberregist_ac_status_user ON MemberRegist_AC_Main(status, user_id);
CREATE INDEX IF NOT EXISTS idx_memberregist_am_status_user ON MemberRegist_AM_Main(status, user_id);
CREATE INDEX IF NOT EXISTS idx_memberregist_ic_status_user ON MemberRegist_IC_Main(status, user_id);
