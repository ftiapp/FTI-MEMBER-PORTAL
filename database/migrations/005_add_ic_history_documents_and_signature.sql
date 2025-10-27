-- Migration: Add missing IC history tables
-- This migration adds the missing history tables for IC membership that were not created in the initial migration

-- IC Representatives History
CREATE TABLE IF NOT EXISTS MemberRegist_Reject_IC_Representatives_History (
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
  phone_extension VARCHAR(10),
  rep_order INT,
  is_primary TINYINT(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_main_history (main_history_id),
  CONSTRAINT fk_ic_rep_hist_main
    FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IC Industry Groups History
CREATE TABLE IF NOT EXISTS MemberRegist_Reject_IC_IndustryGroups_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  industry_group_id INT,
  industry_group_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_main_history (main_history_id),
  CONSTRAINT fk_ic_ind_hist_main
    FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IC Province Chapters History
CREATE TABLE IF NOT EXISTS MemberRegist_Reject_IC_ProvinceChapters_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  province_chapter_id INT,
  province_chapter_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_main_history (main_history_id),
  CONSTRAINT fk_ic_pc_hist_main
    FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IC Documents History
CREATE TABLE IF NOT EXISTS MemberRegist_Reject_IC_Documents_History (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  main_history_id INT NOT NULL,
  original_main_id INT NOT NULL,
  document_type VARCHAR(100),
  file_name VARCHAR(255),
  file_path TEXT,
  file_size INT,
  mime_type VARCHAR(100),
  cloudinary_id VARCHAR(255),
  cloudinary_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_main_history (main_history_id),
  CONSTRAINT fk_ic_docs_hist_main
    FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IC SignatureName History
CREATE TABLE IF NOT EXISTS MemberRegist_Reject_IC_SignatureName_History (
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
  position_th VARCHAR(255),
  position_en VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_main_history (main_history_id),
  CONSTRAINT fk_ic_sign_hist_main
    FOREIGN KEY (main_history_id) REFERENCES MemberRegist_Reject_IC_Main_History(history_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
