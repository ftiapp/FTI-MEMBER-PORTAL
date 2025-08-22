-- Add MEMBER_DATE column to companies_Member to store the official member-since date
ALTER TABLE companies_Member
  ADD COLUMN MEMBER_DATE DATE NULL AFTER REGIST_CODE;

-- Optional index for lookups by date
CREATE INDEX idx_companies_member_date ON companies_Member (MEMBER_DATE);
