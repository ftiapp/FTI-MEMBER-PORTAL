-- Add document_url column to FTI_Original_Membership_Pending_Address_Updates table
ALTER TABLE FTI_Original_Membership_Pending_Address_Updates ADD COLUMN document_url VARCHAR(255) DEFAULT NULL AFTER admin_notes;
