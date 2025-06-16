-- Add bilingual product columns to pending_product_updates table
ALTER TABLE pending_product_updates 
  RENAME COLUMN old_products TO old_products_th,
  RENAME COLUMN new_products TO new_products_th,
  ADD COLUMN old_products_en TEXT AFTER new_products_th,
  ADD COLUMN new_products_en TEXT AFTER old_products_en;
