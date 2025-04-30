-- Add admin_id and admin_name columns to documents_Member table
ALTER TABLE documents_Member 
ADD COLUMN admin_id INT NULL,
ADD COLUMN admin_name VARCHAR(255) NULL,
ADD INDEX idx_admin_id (admin_id);

-- Add foreign key constraint to link admin_id to admin_users.id
ALTER TABLE documents_Member
ADD CONSTRAINT fk_documents_member_admin
FOREIGN KEY (admin_id) REFERENCES admin_users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;
