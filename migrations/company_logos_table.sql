-- Create company_logos table for storing logo information
CREATE TABLE IF NOT EXISTS `company_logos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_code` varchar(20) NOT NULL COMMENT 'รหัสสมาชิก',
  `logo_url` text NOT NULL COMMENT 'URL ของโลโก้บน Cloudinary',
  `public_id` varchar(255) NOT NULL COMMENT 'Public ID ของไฟล์บน Cloudinary',
  `display_mode` enum('circle','square') NOT NULL DEFAULT 'circle' COMMENT 'รูปแบบการแสดงผล (วงกลม/สี่เหลี่ยม)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `member_code_unique` (`member_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
