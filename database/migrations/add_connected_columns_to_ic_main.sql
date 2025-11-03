-- เพิ่มคอลัมน์สำหรับบันทึกการเชื่อมต่อ/อนุมัติโดยแอดมิน
-- Table: MemberRegist_IC_Main

-- เพิ่มคอลัมน์ connected_at - บันทึกวันที่ทำการเชื่อมต่อ/อนุมัติ
ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN connected_at TIMESTAMP NULL COMMENT 'วันที่เชื่อมต่อข้อมูลโดยแอดมิน' 
AFTER updated_at;

-- เพิ่มคอลัมน์ connected_by - บันทึกรหัสแอดมินที่ทำการเชื่อมต่อ/อนุมัติ
ALTER TABLE MemberRegist_IC_Main 
ADD COLUMN connected_by INT NULL COMMENT 'รหัสแอดมินที่เชื่อมต่อข้อมูล' 
AFTER connected_at;

-- เพิ่ม Index สำหรับการค้นหาที่เร็วขึ้น
ALTER TABLE MemberRegist_IC_Main 
ADD INDEX idx_connected_at (connected_at),
ADD INDEX idx_connected_by (connected_by);
