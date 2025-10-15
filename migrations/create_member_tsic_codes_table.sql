-- Create FTI_Original_Membership_Member_Tsic_Codes table
CREATE TABLE IF NOT EXISTS `FTI_Original_Membership_Member_Tsic_Codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `member_code` varchar(20) NOT NULL,
  `category_code` varchar(10) NOT NULL,
  `tsic_code` varchar(10) NOT NULL,
  `status` tinyint(1) DEFAULT 1 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_member_tsic_user` (`user_id`),
  KEY `idx_member_tsic_member` (`member_code`),
  KEY `idx_member_tsic_category` (`category_code`),
  KEY `idx_member_tsic_code` (`tsic_code`),
  CONSTRAINT `fk_member_tsic_user` FOREIGN KEY (`user_id`) REFERENCES `FTI_Portal_User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add 'tsic_code_update' to the action enum in FTI_Portal_User_Logs table if it doesn't exist
ALTER TABLE `FTI_Portal_User_Logs` 
MODIFY COLUMN `action` enum('member_verification','document_upload','profile_update','other','contact_message','profile_update_request','change_email','password_reset','address_update_request','tsic_update_request','tsic_code_update') NOT NULL;
