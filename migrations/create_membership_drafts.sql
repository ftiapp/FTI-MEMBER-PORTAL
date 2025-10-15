-- Migration สำหรับระบบบันทึก Draft การสมัครสมาชิก
-- สร้างตารางสำหรับเก็บข้อมูล draft ของแต่ละประเภทสมาชิก

-- ตาราง OC Draft
CREATE TABLE IF NOT EXISTS MemberRegist_OC_Draft (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draft_data JSON NOT NULL,
    current_step INT DEFAULT 1,
    status INT DEFAULT 3, -- 3 = draft
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_updated (updated_at)
);

-- ตาราง IC Draft
CREATE TABLE IF NOT EXISTS MemberRegist_IC_Draft (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draft_data JSON NOT NULL,
    current_step INT DEFAULT 1,
    status INT DEFAULT 3, -- 3 = draft
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_updated (updated_at)
);

-- ตาราง AM Draft
CREATE TABLE IF NOT EXISTS MemberRegist_AM_Draft (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draft_data JSON NOT NULL,
    current_step INT DEFAULT 1,
    status INT DEFAULT 3, -- 3 = draft
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_updated (updated_at)
);

-- ตาราง AC Draft
CREATE TABLE IF NOT EXISTS MemberRegist_AC_Draft (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draft_data JSON NOT NULL,
    current_step INT DEFAULT 1,
    status INT DEFAULT 3, -- 3 = draft
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES FTI_Portal_User(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_updated (updated_at)
);
