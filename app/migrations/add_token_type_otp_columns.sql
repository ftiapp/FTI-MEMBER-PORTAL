-- เพิ่มคอลัมน์ token_type และ otp ในตาราง FTI_Portal_User_Verification_Tokens
ALTER TABLE FTI_Portal_User_Verification_Tokens
ADD COLUMN token_type VARCHAR(50) DEFAULT 'email_verification' AFTER token,
ADD COLUMN otp VARCHAR(10) AFTER token_type,
ADD COLUMN otp_verified TINYINT(1) DEFAULT 0 AFTER otp;

-- อัปเดตข้อมูลเดิมให้มี token_type เป็น 'email_verification'
UPDATE FTI_Portal_User_Verification_Tokens SET token_type = 'email_verification' WHERE token_type IS NULL;

-- เพิ่ม index เพื่อให้การค้นหาเร็วขึ้น
CREATE INDEX idx_verification_tokens_token_type ON FTI_Portal_User_Verification_Tokens(token_type);
CREATE INDEX idx_verification_tokens_user_id_token_type ON FTI_Portal_User_Verification_Tokens(user_id, token_type);
