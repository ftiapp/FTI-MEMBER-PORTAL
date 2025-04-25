-- เพิ่ม column admin_id และ admin_name ในตาราง companies_Member
ALTER TABLE companies_Member 
ADD COLUMN admin_id INT NULL,
ADD COLUMN admin_name VARCHAR(255) NULL,
ADD FOREIGN KEY (admin_id) REFERENCES admin_users(id);

-- เพิ่ม index เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX idx_companies_member_admin_id ON companies_Member(admin_id);
