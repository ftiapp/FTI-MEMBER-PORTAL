-- Add admin_notes column to pending_address_updates table
ALTER TABLE pending_address_updates ADD COLUMN admin_notes TEXT AFTER admin_comment;
