-- Add signature_name_id column to MemberRegist_OC_Documents table
-- This column will link documents to specific signatories in MemberRegist_OC_Signature_Name table

ALTER TABLE MemberRegist_OC_Documents 
ADD COLUMN signature_name_id INT NULL;

-- Add foreign key constraint
ALTER TABLE MemberRegist_OC_Documents 
ADD CONSTRAINT fk_oc_documents_signature_name 
FOREIGN KEY (signature_name_id) REFERENCES MemberRegist_OC_Signature_Name(id);
