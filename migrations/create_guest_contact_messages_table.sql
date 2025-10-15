-- Create FTI_Portal_Guest_Contact_Messages table
CREATE TABLE IF NOT EXISTS `FTI_Portal_Guest_Contact_Messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','replied','closed') NOT NULL DEFAULT 'unread',
  `assigned_to` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `replied_at` datetime DEFAULT NULL,
  `reply_message` text DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `read_by_admin_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `status_index` (`status`),
  KEY `created_at_index` (`created_at`),
  KEY `email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add contact_message_response to FTI_Portal_Admin_Actions_Logs action_type enum if not already present
-- Note: This is a bit tricky in MySQL as you need to modify the enum
-- First, check if the enum already has the value
SET @enum_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE 
    TABLE_SCHEMA = DATABASE() AND
    TABLE_NAME = 'FTI_Portal_Admin_Actions_Logs' AND
    COLUMN_NAME = 'action_type' AND
    COLUMN_TYPE LIKE '%contact_message_response%'
);

-- If the enum doesn't exist, alter the table to add it
SET @alter_statement = IF(
  @enum_exists = 0,
  "ALTER TABLE FTI_Portal_Admin_Actions_Logs MODIFY COLUMN action_type ENUM('login','approve_member','reject_member','create_admin','update_admin','other','contact_message_response','approve_profile_update','reject_profile_update') NOT NULL",
  "SELECT 'Enum value already exists' as message"
);

PREPARE stmt FROM @alter_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
