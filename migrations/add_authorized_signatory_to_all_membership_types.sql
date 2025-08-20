-- Migration: Create signature name tables for OC, AC, AM membership types
-- Following the same pattern as create_ic_signature_name_table.sql

-- ========================================
-- OC (Ordinary Corporate) Membership
-- ========================================

-- Create OC authorized signatory names table
CREATE TABLE IF NOT EXISTS MemberRegist_OC_Signature_Name (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL,

    -- Authorized signatory's name (Thai/English)
    first_name_th VARCHAR(150),
    last_name_th  VARCHAR(150),
    first_name_en VARCHAR(150),
    last_name_en  VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE,

    INDEX idx_main_id (main_id),
    INDEX idx_created_at (created_at)
);

ALTER TABLE MemberRegist_OC_Signature_Name
COMMENT = 'Stores authorized signatory name linked to OC membership main record';

-- ========================================
-- AC (Associate Corporate) Membership
-- ========================================

-- Create AC authorized signatory names table
CREATE TABLE IF NOT EXISTS MemberRegist_AC_Signature_Name (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL,

    -- Authorized signatory's name (Thai/English)
    first_name_th VARCHAR(150),
    last_name_th  VARCHAR(150),
    first_name_en VARCHAR(150),
    last_name_en  VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (main_id) REFERENCES MemberRegist_AC_Main(id) ON DELETE CASCADE,

    INDEX idx_main_id (main_id),
    INDEX idx_created_at (created_at)
);

ALTER TABLE MemberRegist_AC_Signature_Name
COMMENT = 'Stores authorized signatory name linked to AC membership main record';

-- ========================================
-- AM (Associate Member) Membership
-- ========================================

-- Create AM authorized signatory names table
CREATE TABLE IF NOT EXISTS MemberRegist_AM_Signature_Name (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL,

    -- Authorized signatory's name (Thai/English)
    first_name_th VARCHAR(150),
    last_name_th  VARCHAR(150),
    first_name_en VARCHAR(150),
    last_name_en  VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (main_id) REFERENCES MemberRegist_AM_Main(id) ON DELETE CASCADE,

    INDEX idx_main_id (main_id),
    INDEX idx_created_at (created_at)
);

ALTER TABLE MemberRegist_AM_Signature_Name
COMMENT = 'Stores authorized signatory name linked to AM membership main record';
