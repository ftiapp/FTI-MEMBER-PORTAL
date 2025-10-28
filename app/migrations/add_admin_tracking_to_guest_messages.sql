-- Add admin tracking columns to FTI_Portal_Guest_Contact_Messages table
ALTER TABLE FTI_Portal_Guest_Contact_Messages 
ADD COLUMN IF NOT EXISTS read_by_admin_id INT NULL AFTER status,
ADD COLUMN IF NOT EXISTS replied_by_admin_id INT NULL AFTER read_by_admin_id,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL AFTER replied_by_admin_id,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP NULL AFTER read_at;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guest_messages_read_admin ON FTI_Portal_Guest_Contact_Messages(read_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_guest_messages_replied_admin ON FTI_Portal_Guest_Contact_Messages(replied_by_admin_id);

-- Add foreign key constraints if they don't exist
ALTER TABLE FTI_Portal_Guest_Contact_Messages 
ADD CONSTRAINT IF NOT EXISTS fk_guest_read_admin 
FOREIGN KEY (read_by_admin_id) REFERENCES FTI_Portal_Admin_Users(id);

ALTER TABLE FTI_Portal_Guest_Contact_Messages 
ADD CONSTRAINT IF NOT EXISTS fk_guest_replied_admin 
FOREIGN KEY (replied_by_admin_id) REFERENCES FTI_Portal_Admin_Users(id);
