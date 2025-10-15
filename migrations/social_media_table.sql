-- Create social_media table
CREATE TABLE IF NOT EXISTS `FTI_Original_Membership_Member_Social_Media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_code` varchar(20) NOT NULL COMMENT 'รหัสสมาชิก',
  `platform` varchar(50) NOT NULL COMMENT 'ชื่อแพลตฟอร์ม เช่น Facebook, Line, YouTube',
  `url` text NOT NULL COMMENT 'URL หรือ username ของโซเชียลมีเดีย',
  `display_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อที่แสดงของโซเชียลมีเดีย',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `member_code_idx` (`member_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add sample platforms if needed
INSERT INTO `FTI_Original_Membership_Member_Social_Media` (`member_code`, `platform`, `url`, `display_name`) VALUES
('DEMO001', 'Facebook', 'https://facebook.com/fti.or.th', 'FTI Thailand'),
('DEMO001', 'Line', '@ftiline', 'FTI Line Official'),
('DEMO001', 'YouTube', 'https://youtube.com/channel/UCxxxxxxxxxxx', 'FTI Channel');
