-- =====================================================
-- Migration: Create History Tables (Corrected Schema)
-- Description: Create history tables with correct column names matching original tables
-- Pattern: Industry standard History Tables Pattern
-- Date: 2025-01-24
-- =====================================================

-- =====================================================
-- OC (Organization - Factory) History Tables
-- =====================================================

CREATE TABLE MemberRegist_Reject_OC_Main_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  original_id INT NOT NULL COMMENT 'FK to MemberRegist_Reject_OC_Main.id',
  user_id INT NOT NULL,
  member_code VARCHAR(50),
  company_name_th VARCHAR(255),
  company_name_en VARCHAR(255),
  tax_id VARCHAR(20),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_phone_extension VARCHAR(10),
  status TINYINT,
  factory_type VARCHAR(50),
  number_of_employees VARCHAR(50),
  registered_capital DECIMAL(15,2),
  production_capacity_value DECIMAL(15,2),
  production_capacity_unit VARCHAR(50),
  sales_domestic DECIMAL(15,2),
  sales_export DECIMAL(15,2),
  shareholder_thai_percent DECIMAL(5,2),
  shareholder_foreign_percent DECIMAL(5,2),
  revenue_last_year DECIMAL(15,2),
  revenue_previous_year DECIMAL(15,2),
  rejection_reason TEXT,
  admin_note TEXT,
  admin_note_by INT,
  admin_note_at TIMESTAMP NULL,
  
  snapshot_reason ENUM('rejection', 'resubmission', 'manual') DEFAULT 'rejection',
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_by INT,
  
  INDEX idx_original_id (original_id),
  INDEX idx_user_id (user_id),
  INDEX idx_snapshot_at (snapshot_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_Address_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  building VARCHAR(255),
  address_type ENUM('1','2','3'),
  address_number VARCHAR(50),
  moo VARCHAR(10),
  soi VARCHAR(255),
  street VARCHAR(255),
  sub_district VARCHAR(255),
  district VARCHAR(255),
  province VARCHAR(255),
  postal_code VARCHAR(5),
  phone VARCHAR(50),
  phone_extension VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_Representatives_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  name_th VARCHAR(255),
  name_en VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_IndustryGroups_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  industry_group_id VARCHAR(20),
  industry_group_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_ProvinceChapters_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  province_chapter_id VARCHAR(20),
  province_chapter_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_ContactPerson_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  type_contact_id INT,
  type_contact_name VARCHAR(255),
  type_contact_other_detail TEXT,
  phone_extension VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(50),
  file_name VARCHAR(255),
  file_path TEXT,
  file_size INT,
  mime_type VARCHAR(100),
  cloudinary_id TEXT,
  cloudinary_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_OC_Signature_Name_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(150),
  last_name_th VARCHAR(150),
  first_name_en VARCHAR(150),
  last_name_en VARCHAR(150),
  position_th VARCHAR(150),
  position_en VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AC (Associate Chapter) History Tables
-- =====================================================

CREATE TABLE MemberRegist_Reject_AC_Main_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  original_id INT NOT NULL,
  user_id INT NOT NULL,
  member_code VARCHAR(50),
  company_name_th VARCHAR(255),
  company_name_en VARCHAR(255),
  tax_id VARCHAR(20),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_phone_extension VARCHAR(10),
  status TINYINT,
  number_of_employees VARCHAR(50),
  registered_capital DECIMAL(15,2),
  sales_domestic DECIMAL(15,2),
  sales_export DECIMAL(15,2),
  shareholder_thai_percent DECIMAL(5,2),
  shareholder_foreign_percent DECIMAL(5,2),
  revenue_last_year DECIMAL(15,2),
  revenue_previous_year DECIMAL(15,2),
  rejection_reason TEXT,
  admin_note TEXT,
  
  snapshot_reason ENUM('rejection', 'resubmission', 'manual') DEFAULT 'rejection',
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_by INT,
  
  INDEX idx_original_id (original_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_Address_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  building VARCHAR(255),
  address_type ENUM('1','2','3'),
  address_number VARCHAR(50),
  moo VARCHAR(10),
  soi VARCHAR(255),
  street VARCHAR(255),
  sub_district VARCHAR(255),
  district VARCHAR(255),
  province VARCHAR(255),
  postal_code VARCHAR(5),
  phone VARCHAR(50),
  phone_extension VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_Representatives_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  name_th VARCHAR(255),
  name_en VARCHAR(255),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(50),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  detail TEXT,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_IndustryGroups_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  industry_group_id VARCHAR(20),
  industry_group_name VARCHAR(255),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_ProvinceChapters_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  province_chapter_id VARCHAR(20),
  province_chapter_name VARCHAR(255),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_ContactPerson_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  type_contact_id INT,
  type_contact_name VARCHAR(255),
  type_contact_other_detail TEXT,
  phone_extension VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(50),
  file_name VARCHAR(255),
  file_path TEXT,
  file_size INT,
  mime_type VARCHAR(100),
  cloudinary_id TEXT,
  cloudinary_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AC_Signature_Name_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(150),
  last_name_th VARCHAR(150),
  first_name_en VARCHAR(150),
  last_name_en VARCHAR(150),
  position_th VARCHAR(150),
  position_en VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AM (Associate Member) History Tables
-- =====================================================

CREATE TABLE MemberRegist_Reject_AM_Main_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  original_id INT NOT NULL,
  user_id INT NOT NULL,
  member_code VARCHAR(50),
  company_name_th VARCHAR(255),
  company_name_en VARCHAR(255),
  tax_id VARCHAR(20),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_phone_extension VARCHAR(10),
  status TINYINT,
  number_of_employees VARCHAR(50),
  registered_capital DECIMAL(15,2),
  rejection_reason TEXT,
  admin_note TEXT,
  
  snapshot_reason ENUM('rejection', 'resubmission', 'manual') DEFAULT 'rejection',
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_by INT,
  
  INDEX idx_original_id (original_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_Address_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  building VARCHAR(255),
  address_type ENUM('1','2','3'),
  address_number VARCHAR(50),
  moo VARCHAR(10),
  soi VARCHAR(255),
  street VARCHAR(255),
  sub_district VARCHAR(255),
  district VARCHAR(255),
  province VARCHAR(255),
  postal_code VARCHAR(5),
  phone VARCHAR(50),
  phone_extension VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_Representatives_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  name_th VARCHAR(255),
  name_en VARCHAR(255),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(50),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  detail TEXT,
  
  INDEX idx_main_history (main_history_id),COMPANY_NAME	MEMBER_CODE	COMP_PERSON_NAME_EN	MEMBER_TYPE_CODE	TAX_ID	ADDR_WEBSITE	TotalCount
ไทยยามาฮ่ามอเตอร์ จำกัด	สน121	Thai Yamaha Motor Co.,Ltd.	11	0105507000645	www.yamaha-motor.co.th	1
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_ContactPerson_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  type_contact_id INT,
  type_contact_name VARCHAR(255),
  type_contact_other_detail TEXT,
  phone_extension VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(50),
  file_name VARCHAR(255),
  file_path TEXT,
  file_size INT,
  mime_type VARCHAR(100),
  cloudinary_id TEXT,
  cloudinary_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_AM_Signature_Name_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_th VARCHAR(150),
  last_name_th VARCHAR(150),
  first_name_en VARCHAR(150),
  last_name_en VARCHAR(150),
  position_th VARCHAR(150),
  position_en VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- IC (Individual) History Tables
-- =====================================================

CREATE TABLE MemberRegist_Reject_IC_Main_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  original_id INT NOT NULL,
  user_id INT NOT NULL,
  member_code VARCHAR(50),
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  first_name_th VARCHAR(255),
  last_name_th VARCHAR(255),
  first_name_en VARCHAR(255),
  last_name_en VARCHAR(255),
  id_card_number VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(20),
  status TINYINT,
  rejection_reason TEXT,
  admin_note TEXT,
  
  snapshot_reason ENUM('rejection', 'resubmission', 'manual') DEFAULT 'rejection',
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_by INT,
  
  INDEX idx_original_id (original_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_IC_Address_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  building VARCHAR(255),
  address_type ENUM('1','2','3'),
  address_number VARCHAR(50),
  moo VARCHAR(10),
  soi VARCHAR(255),
  street VARCHAR(255),
  sub_district VARCHAR(255),
  district VARCHAR(255),
  province VARCHAR(255),
  postal_code VARCHAR(5),
  phone VARCHAR(50),
  phone_extension VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_IC_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  name_th VARCHAR(255),
  name_en VARCHAR(255),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_IC_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(50),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE MemberRegist_Reject_IC_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  detail TEXT,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
