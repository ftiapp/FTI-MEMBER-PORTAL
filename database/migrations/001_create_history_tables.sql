-- =====================================================
-- Migration: History Tables for Rejection System
-- Description: Create history tables to store snapshots of rejected applications
-- Pattern: Industry standard History Tables Pattern
-- Date: 2025-01-24
-- =====================================================

-- =====================================================
-- OC (Organization - Factory) History Tables
-- =====================================================

CREATE TABLE MemberRegist_OC_Main_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  original_id INT NOT NULL COMMENT 'FK to MemberRegist_OC_Main.id',
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
  
  -- History metadata
  snapshot_reason ENUM('rejection', 'resubmission', 'manual') DEFAULT 'rejection',
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_by INT,
  
  INDEX idx_original_id (original_id),
  INDEX idx_user_id (user_id),
  INDEX idx_snapshot_at (snapshot_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_Representatives_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL COMMENT 'FK to MemberRegist_OC_Main_History.history_id',
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_thai VARCHAR(255),
  last_name_thai VARCHAR(255),
  first_name_english VARCHAR(255),
  last_name_english VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  INDEX idx_original_main (original_main_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  product_name VARCHAR(255),
  product_type VARCHAR(100),
  hs_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  other_business_type_detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_IndustryGroups_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  industry_group VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_ProvinceChapters_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  province_chapter VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_ContactPerson_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  contact_person_name VARCHAR(255),
  contact_person_position VARCHAR(255),
  contact_person_email VARCHAR(255),
  contact_person_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(100),
  document_url VARCHAR(500),
  document_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_OC_Signature_Name_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  signature_name VARCHAR(255),
  signature_position VARCHAR(255),
  signature_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_OC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AC (Associate Chapter) History Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS MemberRegist_AC_Main_History (
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

CREATE TABLE IF NOT EXISTS MemberRegist_AC_Representatives_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  prename_other_en VARCHAR(100),
  first_name_thai VARCHAR(255),
  last_name_thai VARCHAR(255),
  first_name_english VARCHAR(255),
  last_name_english VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  product_name VARCHAR(255),
  product_type VARCHAR(100),
  hs_code VARCHAR(50),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  other_business_type_detail TEXT,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_IndustryGroups_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  industry_group VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_ProvinceChapters_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  province_chapter VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_ContactPerson_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  contact_person_name VARCHAR(255),
  contact_person_position VARCHAR(255),
  contact_person_email VARCHAR(255),
  contact_person_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(100),
  document_url VARCHAR(500),
  document_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AC_Signature_Name_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  signature_name VARCHAR(255),
  signature_position VARCHAR(255),
  signature_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AM (Associate Member) History Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS MemberRegist_AM_Main_History (
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

CREATE TABLE IF NOT EXISTS MemberRegist_AM_Representatives_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  prename_th VARCHAR(50),
  prename_en VARCHAR(50),
  prename_other VARCHAR(100),
  first_name_thai VARCHAR(255),
  last_name_thai VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AM_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  product_name VARCHAR(255),
  product_type VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AM_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AM_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  other_business_type_detail TEXT,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AM_ContactPerson_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  contact_person_name VARCHAR(255),
  contact_person_position VARCHAR(255),
  contact_person_email VARCHAR(255),
  contact_person_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AM_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(100),
  document_url VARCHAR(500),
  document_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_AM_Signature_Name_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  signature_name VARCHAR(255),
  signature_position VARCHAR(255),
  signature_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_AM_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- IC (Individual) History Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS MemberRegist_IC_Main_History (
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

CREATE TABLE IF NOT EXISTS MemberRegist_IC_Products_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  product_name VARCHAR(255),
  product_type VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_IC_BusinessTypes_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  business_type VARCHAR(100),
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MemberRegist_IC_BusinessTypeOther_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  other_business_type_detail TEXT,
  
  INDEX idx_main_history (main_history_id),
  FOREIGN KEY (main_history_id) REFERENCES MemberRegist_IC_Main_History(history_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
