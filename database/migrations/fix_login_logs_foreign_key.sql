-- แก้ไข Foreign Key ของตาราง FTI_Portal_User_Login_Logs
-- เปลี่ยนจากอ้างอิง 'users' เป็น 'FTI_Portal_User'

-- ขั้นตอนที่ 1: ดูว่ามี foreign key อะไรบ้าง
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'ftimemberportal'
    AND TABLE_NAME = 'FTI_Portal_User_Login_Logs'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ขั้นตอนที่ 2: ลบ foreign key constraint ที่มีอยู่ (ถ้ามี)
-- *** ให้รันคำสั่งนี้หลังจากเห็นชื่อ constraint จากขั้นตอนที่ 1 ***
-- แทนที่ 'constraint_name_here' ด้วยชื่อจริงที่ได้จากการ query ข้างบน
-- ALTER TABLE FTI_Portal_User_Login_Logs DROP FOREIGN KEY constraint_name_here;

-- ขั้นตอนที่ 3: เพิ่ม foreign key constraint ใหม่ที่ถูกต้อง
-- *** รันคำสั่งนี้หลังจากลบ constraint เก่าแล้ว ***
-- ALTER TABLE FTI_Portal_User_Login_Logs
-- ADD CONSTRAINT fk_login_logs_user_id 
--     FOREIGN KEY (user_id) 
--     REFERENCES FTI_Portal_User(id) 
--     ON DELETE CASCADE 
--     ON UPDATE CASCADE;
