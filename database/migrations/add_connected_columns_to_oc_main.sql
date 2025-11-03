-- เพิ่มคอลัมน์สำหรับบันทึกการเชื่อมต่อ/อนุมัติโดยแอดมิน
-- Table: MemberRegist_OC_Main

-- เพิ่มคอลัมน์ connected_at - บันทึกวันที่ทำการเชื่อมต่อ/อนุมัติ
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN connected_at TIMESTAMP NULL COMMENT 'วันที่เชื่อมต่อข้อมูลโดยแอดมิน' 
AFTER approved_by;

-- เพิ่มคอลัมน์ connected_by - บันทึกรหัสแอดมินที่ทำการเชื่อมต่อ/อนุมัติ
ALTER TABLE MemberRegist_OC_Main 
ADD COLUMN connected_by INT NULL COMMENT 'รหัสแอดมินที่เชื่อมต่อข้อมูล' 
AFTER connected_at;

-- เพิ่ม Index สำหรับการค้นหาที่เร็วขึ้น
ALTER TABLE MemberRegist_OC_Main 
ADD INDEX idx_connected_at (connected_at),
ADD INDEX idx_connected_by (connected_by);

-- คำอธิบายสถานะที่เกี่ยวข้อง:
-- status: 0=รอพิจารณา, 1=อนุมัติ, 2=ปฏิเสธ
-- connected_at: วันที่แอดมินทำการเชื่อมต่อข้อมูลสมาชิก (เก็บเมื่อ status = 1)
-- connected_by: รหัสแอดมินที่ทำการเชื่อมต่อข้อมูล (เก็บเมื่อ status = 1)
-- approved_at: วันที่อนุมัติ (อาจใช้ร่วมกับ connected_at หรือแยกกันขึ้นอยู่กับ workflow)
-- approved_by: รหัสแอดมินที่อนุมัติ (อาจใช้ร่วมกับ connected_by หรือแยกกันขึ้นอยู่กับ workflow)
