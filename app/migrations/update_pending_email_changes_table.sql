-- อัปเดตตาราง FTI_Original_Membership_Pending_Email_Changes เพื่อรองรับการเปลี่ยนอีเมลโดยผู้ดูแลระบบ

-- เพิ่มคอลัมน์ old_email หากยังไม่มี
ALTER TABLE FTI_Original_Membership_Pending_Email_Changes ADD COLUMN IF NOT EXISTS old_email VARCHAR(255) AFTER user_id;

-- เพิ่มคอลัมน์ admin_id หากยังไม่มี
ALTER TABLE FTI_Original_Membership_Pending_Email_Changes ADD COLUMN IF NOT EXISTS admin_id INT AFTER verified_at;

-- เพิ่มคอลัมน์ admin_note หากยังไม่มี
ALTER TABLE FTI_Original_Membership_Pending_Email_Changes ADD COLUMN IF NOT EXISTS admin_note TEXT AFTER admin_id;

-- เพิ่มคอลัมน์ status หากยังไม่มี
ALTER TABLE FTI_Original_Membership_Pending_Email_Changes ADD COLUMN IF NOT EXISTS status ENUM('pending', 'verified', 'cancelled', 'rejected') DEFAULT 'pending' AFTER admin_note;

-- เพิ่มคอลัมน์ updated_at หากยังไม่มี
ALTER TABLE FTI_Original_Membership_Pending_Email_Changes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER status;

-- เพิ่ม index สำหรับ status หากยังไม่มี
CREATE INDEX IF NOT EXISTS idx_status ON FTI_Original_Membership_Pending_Email_Changes (status);

-- อัปเดตข้อมูลที่มีอยู่เดิมให้มีค่า status = 'verified' สำหรับรายการที่ verified = 1
UPDATE FTI_Original_Membership_Pending_Email_Changes SET status = 'verified' WHERE verified = 1 AND status IS NULL;

-- อัปเดตข้อมูลที่มีอยู่เดิมให้มีค่า status = 'pending' สำหรับรายการที่ verified = 0
UPDATE FTI_Original_Membership_Pending_Email_Changes SET status = 'pending' WHERE verified = 0 AND status IS NULL;
