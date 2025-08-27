
ALTER TABLE MemberRegist_Reject_DATA DROP KEY unique_active_rejection;

-
CREATE UNIQUE INDEX unique_active_rejection_idx 
ON MemberRegist_Reject_DATA(membership_type, membership_id, (CASE WHEN is_active = 1 THEN 1 ELSE NULL END));
