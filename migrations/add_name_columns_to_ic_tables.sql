-- Add name columns to IC membership tables
-- This migration adds name columns to store the actual names of industrial groups and provincial chapters
-- to avoid frequent mapping issues

-- Add name column to MemberRegist_IC_IndustryGroups table
ALTER TABLE MemberRegist_IC_IndustryGroups 
ADD COLUMN industry_group_name VARCHAR(255) NULL AFTER industry_group_id;

-- Add name column to MemberRegist_IC_ProvinceChapters table
ALTER TABLE MemberRegist_IC_ProvinceChapters 
ADD COLUMN province_chapter_name VARCHAR(255) NULL AFTER province_chapter_id;

-- Add indexes for better performance when searching by names
CREATE INDEX idx_ic_industry_groups_name ON MemberRegist_IC_IndustryGroups(industry_group_name);
CREATE INDEX idx_ic_province_chapters_name ON MemberRegist_IC_ProvinceChapters(province_chapter_name);

-- Add comments to document the purpose of these columns
ALTER TABLE MemberRegist_IC_IndustryGroups 
MODIFY COLUMN industry_group_name VARCHAR(255) NULL COMMENT 'Name of the industrial group to avoid frequent mapping';

ALTER TABLE MemberRegist_IC_ProvinceChapters 
MODIFY COLUMN province_chapter_name VARCHAR(255) NULL COMMENT 'Name of the provincial chapter to avoid frequent mapping';
