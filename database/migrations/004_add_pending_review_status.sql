-- =====================================================
-- Migration: Add 'pending_review' status to rejections table
-- Description: Add new status to differentiate resubmitted applications
-- Date: 2025-01-27
-- =====================================================

-- Modify the status ENUM to include 'pending_review'
ALTER TABLE MemberRegist_Rejections 
MODIFY COLUMN status ENUM('pending_fix', 'pending_review', 'resolved', 'cancelled') DEFAULT 'pending_fix';

-- Add index for the new status
ALTER TABLE MemberRegist_Rejections 
ADD INDEX idx_pending_review (status);

-- Update existing records that have resubmission_count > 0 and status = 'pending_fix'
-- These should be marked as 'pending_review' since they've been resubmitted
UPDATE MemberRegist_Rejections 
SET status = 'pending_review' 
WHERE status = 'pending_fix' 
  AND resubmission_count > 0;

-- Update the view to handle the new status
DROP VIEW IF EXISTS v_rejections_with_details;

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
