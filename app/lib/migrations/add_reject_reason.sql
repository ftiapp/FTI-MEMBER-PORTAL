-- Add reject_reason field to companies_Member table
ALTER TABLE companies_Member ADD reject_reason TEXT;

-- Add reject_reason field to documents_Member table
ALTER TABLE documents_Member ADD reject_reason TEXT;
