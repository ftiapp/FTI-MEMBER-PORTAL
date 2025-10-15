-- สร้างตารางสำหรับเก็บประวัติความเห็นและการแก้ไขของการสมัครสมาชิก
CREATE TABLE IF NOT EXISTS MemberRegist_Comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    membership_type ENUM('oc', 'ac', 'am', 'ic') NOT NULL COMMENT 'ประเภทสมาชิก',
    membership_id INT NOT NULL COMMENT 'ID ของใบสมัครในตารางหลัก',
    user_id INT NULL COMMENT 'ID ของผู้ใช้ (สำหรับ comment จาก user)',
    admin_id INT NULL COMMENT 'ID ของ admin (สำหรับ comment จาก admin)',
    comment_type ENUM('admin_rejection', 'admin_note', 'user_resubmit', 'admin_approval', 'system_note') NOT NULL COMMENT 'ประเภทของ comment',
    comment_text TEXT NOT NULL COMMENT 'ข้อความ comment',
    rejection_reason TEXT NULL COMMENT 'เหตุผลการปฏิเสธ (สำหรับ admin_rejection)',
    data_changes JSON NULL COMMENT 'ข้อมูลที่เปลี่ยนแปลง (สำหรับ user_resubmit)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_membership (membership_type, membership_id),
    INDEX idx_user (user_id),
    INDEX idx_admin (admin_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES FTI_Portal_Admin_Users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติความเห็นและการแก้ไขการสมัครสมาชิก';

-- เพิ่ม enum ใหม่ใน FTI_Portal_Admin_Actions_Logs
ALTER TABLE FTI_Portal_Admin_Actions_Logs 
MODIFY COLUMN action_type ENUM(
    'approve_membership', 
    'reject_membership', 
    'approve_address_update', 
    'reject_address_update', 
    'approve_product_update', 
    'reject_product_update', 
    'approve_tsic_update', 
    'reject_tsic_update', 
    'connect_member_code',
    'review_resubmission',
    'approve_resubmission',
    'reject_resubmission'
) NOT NULL;

-- เพิ่ม enum ใหม่ใน FTI_Portal_User_Logs
ALTER TABLE FTI_Portal_User_Logs 
MODIFY COLUMN action_type ENUM(
    'login', 
    'logout', 
    'register', 
    'update_profile', 
    'submit_membership', 
    'request_address_update', 
    'request_product_update', 
    'request_tsic_update',
    'resubmit_membership',
    'edit_rejected_application'
) NOT NULL;
