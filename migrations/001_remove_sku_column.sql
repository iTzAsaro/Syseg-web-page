-- Migration to remove 'sku' column from 'producto' table
-- Date: 2026-01-29

-- 1. Backup is assumed to be done (e.g. JSON export or mysqldump)
-- 2. Drop the column
ALTER TABLE producto DROP COLUMN sku;

-- 3. Verify (optional, manual check)
-- SHOW COLUMNS FROM producto;
