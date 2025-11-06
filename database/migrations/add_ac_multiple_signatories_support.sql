-- Migration: Add multiple authorized signatories support for AC membership
-- This creates the Signature_Name table for AC to store multiple signatories
-- Similar to the existing OC structure

-- Create AC Signature Name table for multiple authorized signatories
CREATE TABLE `MemberRegist_AC_Signature_Name` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `main_id` int(11) NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก MemberRegist_AC_Main',
  `prename_th` varchar(50) DEFAULT NULL COMMENT 'คำนำหน้าชื่อภาษาไทย',
  `prename_en` varchar(50) DEFAULT NULL COMMENT 'คำนำหน้าชื่อภาษาอังกฤษ',
  `prename_other` varchar(100) DEFAULT NULL COMMENT 'คำนำหน้าอื่นๆภาษาไทย',
  `prename_other_en` varchar(100) DEFAULT NULL COMMENT 'คำนำหน้าอื่นๆภาษาอังกฤษ',
  `first_name_th` varchar(150) NOT NULL COMMENT 'ชื่อภาษาไทย',
  `last_name_th` varchar(150) NOT NULL COMMENT 'นามสกุลภาษาไทย',
  `first_name_en` varchar(150) DEFAULT NULL COMMENT 'ชื่อภาษาอังกฤษ',
  `last_name_en` varchar(150) DEFAULT NULL COMMENT 'นามสกุลภาษาอังกฤษ',
  `position_th` varchar(150) NOT NULL COMMENT 'ตำแหน่งภาษาไทย',
  `position_en` varchar(150) DEFAULT NULL COMMENT 'ตำแหน่งภาษาอังกฤษ',
  `signature_order` int(11) DEFAULT 1 COMMENT 'ลำดับการแสดงผล',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_main_id` (`main_id`),
  KEY `idx_signature_order` (`signature_order`),
  CONSTRAINT `fk_ac_signature_main` FOREIGN KEY (`main_id`) REFERENCES `MemberRegist_AC_Main` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บข้อมูลชื่อผู้มีอำนาจลงนามหลายคนสำหรับสมาชิก AC';

-- Create AC Signature Documents table for multiple signature files
CREATE TABLE `MemberRegist_AC_Signature_Documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `main_id` int(11) NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก MemberRegist_AC_Main',
  `signature_name_id` int(11) DEFAULT NULL COMMENT 'รหัสอ้างอิงตาราง Signature_Name (ถ้ามี)',
  `document_type` varchar(50) NOT NULL COMMENT 'ประเภทเอกสาร (authorizedSignature)',
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` text NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `cloudinary_id` varchar(255) DEFAULT NULL,
  `cloudinary_url` text DEFAULT NULL,
  `signature_order` int(11) DEFAULT 1 COMMENT 'ลำดับลายเซ็น',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_main_id` (`main_id`),
  KEY `idx_signature_name_id` (`signature_name_id`),
  KEY `idx_signature_order` (`signature_order`),
  CONSTRAINT `fk_ac_sig_doc_main` FOREIGN KEY (`main_id`) REFERENCES `MemberRegist_AC_Main` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ac_sig_doc_name` FOREIGN KEY (`signature_name_id`) REFERENCES `MemberRegist_AC_Signature_Name` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บเอกสารลายเซ็นผู้มีอำนาจลงนามหลายคนสำหรับสมาชิก AC';

-- Update existing AC history table to match new structure (if needed)
-- The history table already exists with the correct structure from add_prename_fields_to_signature_name_tables.sql

-- Add signature_name_id column to existing AC Documents table to link signature files to specific signatories
ALTER TABLE `MemberRegist_AC_Documents` 
ADD COLUMN `signature_name_id` INT NULL COMMENT 'รหัสอ้างอิงถึงผู้ลงนามใน MemberRegist_AC_Signature_Name';

-- Add foreign key constraint
ALTER TABLE `MemberRegist_AC_Documents` 
ADD CONSTRAINT `fk_ac_documents_signature_name` 
FOREIGN KEY (`signature_name_id`) REFERENCES `MemberRegist_AC_Signature_Name`(`id`) ON DELETE SET NULL;

-- Add indexes for better performance
ALTER TABLE `MemberRegist_AC_Signature_Name` ADD INDEX `idx_full_name` (`first_name_th`, `last_name_th`);
ALTER TABLE `MemberRegist_AC_Signature_Documents` ADD INDEX `idx_document_type` (`document_type`);
ALTER TABLE `MemberRegist_AC_Documents` ADD INDEX `idx_signature_name_id` (`signature_name_id`);
