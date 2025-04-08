-- Add reset_code column to password_reset_tokens table
ALTER TABLE password_reset_tokens ADD COLUMN reset_code VARCHAR(6) AFTER token;
