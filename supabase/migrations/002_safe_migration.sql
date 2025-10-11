-- Safe migration that checks for existing tables

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name text NOT NULL,
      date_of_birth date NOT NULL,
      whatsapp_number text NOT NULL,
      created_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Create masterclasses table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'masterclasses') THEN
    CREATE TABLE masterclasses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      pdf_url text,
      created_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Create inscriptions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inscriptions') THEN
    CREATE TABLE inscriptions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      masterclass_id uuid NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
      validated boolean DEFAULT false,
      registration_date timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Create questions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'questions') THEN
    CREATE TABLE questions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      masterclass_id uuid NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
      question_text text NOT NULL,
      choices jsonb NOT NULL,
      correct_choice text NOT NULL,
      created_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Create tests table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tests') THEN
    CREATE TABLE tests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
      type text NOT NULL CHECK(type IN ('PRE', 'POST')),
      score int NOT NULL,
      max_score int NOT NULL DEFAULT 10,
      responses jsonb NOT NULL,
      taken_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Create user_roles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    CREATE TABLE user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role text NOT NULL CHECK(role IN ('admin', 'tuteur')),
      assigned_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_inscriptions_profile_id ON inscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_masterclass_id ON inscriptions(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_questions_masterclass_id ON questions(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_tests_inscription_id ON tests(inscription_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are not recreated here to avoid duplicates
-- If you need to reset policies, drop them first or use the full migration
