-- Add MEMBER_DATE column to FTI_Original_Membership to store the official member-since date
ALTER TABLE FTI_Original_Membership
  ADD COLUMN MEMBER_DATE DATE NULL AFTER REGIST_CODE;

-- Optional index for lookups by date
CREATE INDEX idx_FTI_Original_Membership_date ON FTI_Original_Membership (MEMBER_DATE);
