-- Migration: Make date_of_birth optional in profiles table
-- Date: 2025-01-11
-- Description: Remove NOT NULL constraint from date_of_birth column

-- Make date_of_birth nullable
ALTER TABLE profiles 
ALTER COLUMN date_of_birth DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.date_of_birth IS 'Optional date of birth field';
