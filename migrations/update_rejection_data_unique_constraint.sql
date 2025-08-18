-- This migration updates the unique constraint on MemberRegist_Reject_DATA
-- to allow multiple inactive rejection records for the same application.
-- This fixes a bug where resubmitting a twice-rejected application would fail.

-- Step 1: Drop the old unique key that causes the duplicate entry error on inactive records.
ALTER TABLE MemberRegist_Reject_DATA DROP KEY unique_active_rejection;

-- Step 2: Create a new unique index that only enforces uniqueness for ACTIVE rejections (is_active = 1).
-- It allows multiple records where is_active = 0 for the same membership_type and membership_id.
CREATE UNIQUE INDEX unique_active_rejection_idx 
ON MemberRegist_Reject_DATA(membership_type, membership_id, (CASE WHEN is_active = 1 THEN 1 ELSE NULL END));
