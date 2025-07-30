-- Migration: Create MemberRegist_IC_Documents table to match OC structure
-- This table will store IC membership document metadata like OC does

CREATE TABLE IF NOT EXISTS MemberRegist_IC_Documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    file_path TEXT,
    file_size INT,
    mime_type VARCHAR(100),
    cloudinary_id VARCHAR(255),
    cloudinary_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (main_id) REFERENCES MemberRegist_IC_Main(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_main_id (main_id),
    INDEX idx_document_type (document_type),
    INDEX idx_created_at (created_at)
);

-- Add comments for clarity
ALTER TABLE MemberRegist_IC_Documents 
COMMENT = 'Stores IC membership document metadata uploaded to Cloudinary';

-- Add index for cloudinary_id lookups
CREATE INDEX idx_cloudinary_id ON MemberRegist_IC_Documents(cloudinary_id);
