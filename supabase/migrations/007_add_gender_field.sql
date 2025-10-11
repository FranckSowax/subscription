-- Migration: Add gender field to profiles table
-- Date: 2025-01-11
-- Description: Add gender column (Homme/Femme)

-- Add gender column
ALTER TABLE profiles 
ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('Homme', 'Femme'));

-- Add comment
COMMENT ON COLUMN profiles.gender IS 'Genre de l''utilisateur: Homme ou Femme';

-- Create index for better filtering performance
CREATE INDEX idx_profiles_gender ON profiles(gender);
