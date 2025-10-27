-- ตรวจสอบว่า user_id = 24 มีอยู่ในตาราง FTI_Portal_User หรือไม่
SELECT id, name, email, role, status 
FROM FTI_Portal_User 
WHERE id = 24;

-- ตรวจสอบ Foreign Key Constraint ทั้งหมดของตาราง FTI_Portal_User_Login_Logs
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

-- ตรวจสอบว่าตาราง FTI_Portal_User มีอยู่จริง
SHOW TABLES LIKE 'FTI_Portal_User';

-- ตรวจสอบว่ามีตาราง 'users' หรือไม่
SHOW TABLES LIKE 'users';

-- ดูโครงสร้างตาราง FTI_Portal_User_Login_Logs
SHOW CREATE TABLE FTI_Portal_User_Login_Logs;
