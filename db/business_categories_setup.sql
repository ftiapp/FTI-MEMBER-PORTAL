-- สร้างตาราง MemberRegist_Business_Categories
CREATE TABLE IF NOT EXISTS MemberRegist_Business_Categories (
  id VARCHAR(50) PRIMARY KEY,
  name_thai VARCHAR(255) NOT NULL,
  name_english VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ลบข้อมูลเก่า (ถ้ามี)
TRUNCATE TABLE MemberRegist_Business_Categories;

-- เพิ่มข้อมูลประเภทธุรกิจ
INSERT INTO MemberRegist_Business_Categories (id, name_thai, name_english) VALUES
('manufacturer', 'ผู้ผลิต', 'Manufacturer'),
('distributor', 'ผู้จัดจำหน่าย', 'Distributor'),
('importer', 'ผู้นำเข้า', 'Importer'),
('exporter', 'ผู้ส่งออก', 'Exporter'),
('service', 'ผู้ให้บริการ', 'Service Provider'),
('other', 'อื่นๆ', 'Other');
