-- =====================================================
-- Migration: Rejections Tracking Table
-- Description: Central table to track all rejection events
-- Date: 2025-01-24
-- =====================================================

CREATE TABLE MemberRegist_Rejections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  membership_type ENUM('oc', 'ac', 'am', 'ic') NOT NULL,
  membership_id INT NOT NULL COMMENT 'FK to Main table (OC/AC/AM/IC)',
  history_snapshot_id INT NOT NULL COMMENT 'FK to History table',
  
  -- Admin who rejected
  rejected_by INT NOT NULL,
  rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rejection_reason TEXT NOT NULL,
  
  -- Status tracking
  status ENUM('pending_fix', 'resolved', 'cancelled') DEFAULT 'pending_fix',
  resubmission_count INT DEFAULT 0,
  
  -- Resolution tracking
  resolved_by INT NULL,
  resolved_at TIMESTAMP NULL,
  resolution_note TEXT NULL,
  
  -- Conversation tracking
  last_conversation_at TIMESTAMP NULL,
  unread_admin_count INT DEFAULT 0 COMMENT 'Unread messages for admin',
  unread_member_count INT DEFAULT 0 COMMENT 'Unread messages for member',
  
  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_membership (membership_type, membership_id),
  INDEX idx_status (status),
  INDEX idx_rejected_at (rejected_at),
  INDEX idx_last_conversation (last_conversation_at),
  
  -- Composite index for common queries
  INDEX idx_user_status (user_id, status),
  INDEX idx_type_status (membership_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Conversations Table
-- =====================================================

CREATE TABLE IF NOT EXISTS MemberRegist_Rejection_Conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rejection_id INT NOT NULL,
  
  -- Sender info
  sender_type ENUM('admin', 'member') NOT NULL,
  sender_id INT NOT NULL,
  
  -- Message content
  message TEXT NOT NULL,
  attachments JSON DEFAULT NULL COMMENT 'Array of attachment URLs/metadata',
  
  -- Read status
  is_read TINYINT(1) DEFAULT 0,
  read_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_rejection_id (rejection_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_sender (sender_type, sender_id),
  
  -- Foreign key
  FOREIGN KEY (rejection_id) REFERENCES MemberRegist_Rejections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- View for easy querying
-- =====================================================

CREATE OR REPLACE VIEW v_rejections_with_details AS
SELECT 
  r.id as rejection_id,
  r.user_id,
  r.membership_type,
  r.membership_id,
  r.history_snapshot_id,
  r.rejected_by,
  r.rejected_at,
  r.rejection_reason,
  r.status,
  r.resubmission_count,
  r.resolved_by,
  r.resolved_at,
  r.last_conversation_at,
  r.unread_admin_count,
  r.unread_member_count,
  
  -- User info
  u.firstname as user_firstname,
  u.lastname as user_lastname,
  u.email as user_email,
  
  -- Admin info
  a.firstname as admin_firstname,
  a.lastname as admin_lastname,
  
  -- Application name based on type
  CASE 
    WHEN r.membership_type = 'oc' THEN oc.company_name_th
    WHEN r.membership_type = 'ac' THEN ac.company_name_th
    WHEN r.membership_type = 'am' THEN am.company_name_th
    WHEN r.membership_type = 'ic' THEN CONCAT(ic.first_name_th, ' ', ic.last_name_th)
  END as application_name,
  
  -- Identifier based on type
  CASE 
    WHEN r.membership_type = 'oc' THEN oc.tax_id
    WHEN r.membership_type = 'ac' THEN ac.tax_id
    WHEN r.membership_type = 'am' THEN am.tax_id
    WHEN r.membership_type = 'ic' THEN ic.id_card_number
  END as identifier,
  
  -- Current application status
  CASE 
    WHEN r.membership_type = 'oc' THEN oc.status
    WHEN r.membership_type = 'ac' THEN ac.status
    WHEN r.membership_type = 'am' THEN am.status
    WHEN r.membership_type = 'ic' THEN ic.status
  END as current_application_status,
  
  -- Conversation count
  (SELECT COUNT(*) FROM MemberRegist_Rejection_Conversations c WHERE c.rejection_id = r.id) as conversation_count
  
FROM MemberRegist_Rejections r
LEFT JOIN FTI_Portal_User u ON r.user_id = u.id
LEFT JOIN FTI_Portal_User a ON r.rejected_by = a.id
LEFT JOIN MemberRegist_OC_Main oc ON r.membership_type = 'oc' AND r.membership_id = oc.id
LEFT JOIN MemberRegist_AC_Main ac ON r.membership_type = 'ac' AND r.membership_id = ac.id
LEFT JOIN MemberRegist_AM_Main am ON r.membership_type = 'am' AND r.membership_id = am.id
LEFT JOIN MemberRegist_IC_Main ic ON r.membership_type = 'ic' AND r.membership_id = ic.id;
