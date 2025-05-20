-- Add document_url column to pending_address_updates table
ALTER TABLE pending_address_updates ADD COLUMN document_url VARCHAR(255) DEFAULT NULL AFTER admin_notes;
