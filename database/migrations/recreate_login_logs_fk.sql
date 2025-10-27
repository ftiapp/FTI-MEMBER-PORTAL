-- ลบและสร้าง Foreign Key ใหม่สำหรับตาราง FTI_Portal_User_Login_Logs
-- เพื่อแก้ปัญหา error "Table 'ftimemberportal.users' doesn't exist"

-- ขั้นตอนที่ 1: ลบ Foreign Key เก่า
ALTER TABLE FTI_Portal_User_Login_Logs 
DROP FOREIGN KEY fk_login_logs_user_id;

-- ขั้นตอนที่ 2: ลบ Index ที่เกี่ยวข้อง (ถ้ามี)
ALTER TABLE FTI_Portal_User_Login_Logs 
DROP INDEX IF EXISTS idx_user_id;

-- ขั้นตอนที่ 3: สร้าง Index ใหม่
ALTER TABLE FTI_Portal_User_Login_Logs 
ADD INDEX idx_user_id (user_id);

-- ขั้นตอนที่ 4: สร้าง Foreign Key ใหม่
ALTER TABLE FTI_Portal_User_Login_Logs
ADD CONSTRAINT fk_login_logs_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES FTI_Portal_User(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- ขั้นตอนที่ 5: ตรวจสอบว่าสร้างสำเร็จ
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'FTI_Portal_User_Login_Logs'
    AND REFERENCED_TABLE_NAME IS NOT NULL;
