-- Migration to add account deletion and deactivation fields
-- This fixes the missing column error for is_deleted and deactivated_until

-- Add is_deleted column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add deactivated_until column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deactivated_until TIMESTAMP;

-- Update existing records to have is_deleted = false
UPDATE users SET is_deleted = FALSE WHERE is_deleted IS NULL;

-- Make is_deleted NOT NULL after setting defaults
ALTER TABLE users 
ALTER COLUMN is_deleted SET NOT NULL;
