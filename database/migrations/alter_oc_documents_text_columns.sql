ALTER TABLE `MemberRegist_OC_Documents` 
CHANGE COLUMN `file_path` `file_path` TEXT NULL DEFAULT NULL,
CHANGE COLUMN `cloudinary_id` `cloudinary_id` TEXT NULL DEFAULT NULL,
CHANGE COLUMN `cloudinary_url` `cloudinary_url` TEXT NULL DEFAULT NULL;
