-- Migration: Create MemberRegist_IC_Signature_Name table
-- Stores authorized signatory name for IC membership applications

CREATE TABLE IF NOT EXISTS MemberRegist_IC_Signature_Name (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL,

    -- Authorized signatory's name (Thai/English)
    first_name_th VARCHAR(150),
    last_name_th  VARCHAR(150),
    first_name_en VARCHAR(150),
    last_name_en  VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (main_id) REFERENCES MemberRegist_IC_Main(id) ON DELETE CASCADE,

    INDEX idx_main_id (main_id),
    INDEX idx_created_at (created_at)
);

ALTER TABLE MemberRegist_IC_Signature_Name
COMMENT = 'Stores authorized signatory name linked to IC membership main record';
