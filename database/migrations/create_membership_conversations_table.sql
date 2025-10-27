-- ========================================
-- Membership Application Conversation System
-- ========================================
-- Purpose: Track all conversations between Admin and User during rejection/resubmission process
-- Flow: Admin reject → User resubmit → Admin review → ... (repeat until approved)

-- ========================================
-- Table: MemberRegist_Conversations
-- ========================================
-- Stores all messages/comments exchanged between Admin and User
CREATE TABLE IF NOT EXISTS MemberRegist_Conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Reference to application
    membership_type ENUM('oc', 'am', 'ac', 'ic') NOT NULL COMMENT 'ประเภทสมาชิก',
    membership_id INT NOT NULL COMMENT 'ID ของใบสมัคร (main_id)',
    
    -- Message details
    message_type ENUM('rejection', 'resubmission', 'admin_comment', 'user_comment', 'approval', 'system') NOT NULL COMMENT 'ประเภทข้อความ',
    message TEXT NOT NULL COMMENT 'ข้อความ/เหตุผล',
    
    -- Author info
    author_type ENUM('admin', 'user', 'system') NOT NULL COMMENT 'ผู้เขียน',
    author_id INT NULL COMMENT 'ID ของผู้เขียน (admin_id หรือ user_id)',
    author_name VARCHAR(255) NULL COMMENT 'ชื่อผู้เขียน (สำหรับแสดงผล)',
    
    -- Related status change
    status_before TINYINT NULL COMMENT 'สถานะก่อนหน้า (0=pending, 1=approved, 2=rejected)',
    status_after TINYINT NULL COMMENT 'สถานะหลัง',
    
    -- Metadata
    is_internal BOOLEAN DEFAULT FALSE COMMENT 'เป็น admin note ภายใน (user ไม่เห็น)',
    attachments JSON NULL COMMENT 'ไฟล์แนบ (ถ้ามี)',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_membership (membership_type, membership_id),
    INDEX idx_created_at (created_at),
    INDEX idx_author (author_type, author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='บันทึกการสนทนาระหว่าง Admin และ User';

-- ========================================
-- Add rejection_details column if not exists
-- ========================================
-- Store structured rejection data (optional - for categorization)
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN IF NOT EXISTS rejection_details JSON NULL COMMENT 'รายละเอียดการปฏิเสธแบบ structured (optional)';

ALTER TABLE MemberRegist_AC_Main 
ADD COLUMN IF NOT EXISTS rejection_details JSON NULL COMMENT 'รายละเอียดการปฏิเสธแบบ structured (optional)';

ALTER TABLE MemberRegist_AM_Main 
ADD COLUMN IF NOT EXISTS rejection_details JSON NULL COMMENT 'รายละเอียดการปฏิเสธแบบ structured (optional)';

ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN IF NOT EXISTS rejection_details JSON NULL COMMENT 'รายละเอียดการปฏิเสธแบบ structured (optional)';

-- ========================================
-- Status Flow Reference
-- ========================================
-- status = 0: Pending (รอพิจารณา)
-- status = 1: Approved (อนุมัติ)
-- status = 2: Rejected (ปฏิเสธ - รอ user แก้ไข)
-- status = 3: Resubmitted (user ส่งใหม่แล้ว - รอ admin review)
-- status = 4: Archived (ถูกแทนที่ด้วย version ใหม่)

-- ========================================
-- Example Conversation Flow
-- ========================================
-- 1. Admin rejects:
--    INSERT INTO MemberRegist_Conversations 
--    (membership_type, membership_id, message_type, message, author_type, author_id, status_before, status_after)
--    VALUES ('oc', 123, 'rejection', 'เอกสารไม่ครบถ้วน กรุณาแนบสำเนาทะเบียนบ้าน', 'admin', 1, 0, 2);
--
-- 2. User resubmits:
--    INSERT INTO MemberRegist_Conversations 
--    (membership_type, membership_id, message_type, message, author_type, author_id, status_before, status_after)
--    VALUES ('oc', 123, 'resubmission', 'แนบเอกสารเพิ่มเติมแล้วครับ', 'user', 456, 2, 3);
--
-- 3. Admin comments (without status change):
--    INSERT INTO MemberRegist_Conversations 
--    (membership_type, membership_id, message_type, message, author_type, author_id)
--    VALUES ('oc', 123, 'admin_comment', 'กรุณาแนบเอกสารหน้า 3 ด้วย', 'admin', 1);
--
-- 4. Admin approves:
--    INSERT INTO MemberRegist_Conversations 
--    (membership_type, membership_id, message_type, message, author_type, author_id, status_before, status_after)
--    VALUES ('oc', 123, 'approval', 'อนุมัติแล้ว', 'admin', 1, 3, 1);
