-- Add admin_id and admin_name columns to FTI_Original_Membership_Documents_Member table
ALTER TABLE FTI_Original_Membership_Documents_Member 
ADD COLUMN admin_id INT NULL,
ADD COLUMN admin_name VARCHAR(255) NULL,
ADD INDEX idx_admin_id (admin_id);

-- Add foreign key constraint to link admin_id to FTI_Portal_Admin_Users.id
ALTER TABLE FTI_Original_Membership_Documents_Member
ADD CONSTRAINT fk_FTI_Original_Membership_Documents_Member_admin
FOREIGN KEY (admin_id) REFERENCES FTI_Portal_Admin_Users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;
