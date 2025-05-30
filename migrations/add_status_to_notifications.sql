-- เพิ่ม column status ในตาราง notifications
ALTER TABLE notifications ADD COLUMN status VARCHAR(20) DEFAULT NULL COMMENT 'สถานะการแจ้งเตือน (approved, rejected, null)';

-- อัปเดตข้อมูลที่มีอยู่แล้ว
-- อัปเดตสถานะเป็น 'approved' สำหรับข้อความที่มีคำว่า 'ได้รับการอนุมัติแล้ว'
UPDATE notifications SET status = 'approved' WHERE message LIKE '%ได้รับการอนุมัติแล้ว%';

-- อัปเดตสถานะเป็น 'rejected' สำหรับข้อความที่มีคำว่า 'ถูกปฏิเสธ'
UPDATE notifications SET status = 'rejected' WHERE message LIKE '%ถูกปฏิเสธ%';
