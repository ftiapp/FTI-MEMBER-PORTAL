-- Migration: Add building and address_type columns to ICmember_Addr table
-- Date: 2025-08-06
-- Description: Add building field and address_type enum to support multiple address types

-- Add building column after address_number
ALTER TABLE ICmember_Addr 
ADD COLUMN building VARCHAR(255) COMMENT 'อาคาร/หมู่บ้าน' AFTER address_number;

-- Add address_type column with ENUM values
ALTER TABLE ICmember_Addr 
ADD COLUMN address_type ENUM('1', '2', '3') NOT NULL DEFAULT '2' 
COMMENT '1=ที่อยู่สำนักงาน, 2=ที่อยู่จัดส่งเอกสาร, 3=ที่อยู่ใบกำกับภาษี' 
AFTER address_number;

-- Add phone, email, website columns if they don't exist
ALTER TABLE ICmember_Addr 
ADD COLUMN phone VARCHAR(50) COMMENT 'เบอร์โทรศัพท์' AFTER postal_code,
ADD COLUMN email VARCHAR(255) COMMENT 'อีเมล' AFTER phone,
ADD COLUMN website TEXT COMMENT 'เว็บไซต์' AFTER email;

-- Update existing records to be address_type '2' (shipping address)
UPDATE ICmember_Addr SET address_type = '2' WHERE address_type IS NULL OR address_type = '';

-- Add index for address_type for better query performance
ALTER TABLE ICmember_Addr ADD INDEX idx_address_type (address_type);

-- Add composite index for ic_member_id and address_type
ALTER TABLE ICmember_Addr ADD INDEX idx_ic_member_id_address_type (ic_member_id, address_type);
