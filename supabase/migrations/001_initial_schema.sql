-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profil utilisateur étendu
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  whatsapp_number text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Masterclasses
CREATE TABLE masterclasses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  pdf_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Détail d'inscription pour étudiants
CREATE TABLE inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  masterclass_id uuid NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
  validated boolean DEFAULT false,
  registration_date timestamp with time zone DEFAULT now()
);

-- 4. Banque de questions
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id uuid NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  choices jsonb NOT NULL,
  correct_choice text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Tests (pré & post)
CREATE TABLE tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK(type IN ('PRE', 'POST')),
  score int NOT NULL,
  max_score int NOT NULL DEFAULT 10,
  responses jsonb NOT NULL,
  taken_at timestamp with time zone DEFAULT now()
);

-- 6. Rôles utilisateurs
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK(role IN ('admin', 'tuteur')),
  assigned_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_inscriptions_profile_id ON inscriptions(profile_id);
CREATE INDEX idx_inscriptions_masterclass_id ON inscriptions(masterclass_id);
CREATE INDEX idx_questions_masterclass_id ON questions(masterclass_id);
CREATE INDEX idx_tests_inscription_id ON tests(inscription_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Inscriptions: Students see their own, admins/tuteurs see all
CREATE POLICY "Users can view own inscriptions" ON inscriptions
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins and tuteurs can view all inscriptions" ON inscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'tuteur')
    )
  );

CREATE POLICY "Users can insert own inscriptions" ON inscriptions
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update inscriptions" ON inscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Masterclasses: Public read, admin write
CREATE POLICY "Anyone can view masterclasses" ON masterclasses
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert masterclasses" ON masterclasses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update masterclasses" ON masterclasses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Questions: Public read for tests, admin write
CREATE POLICY "Authenticated users can view questions" ON questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert questions" ON questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update questions" ON questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete questions" ON questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tests: Students see their own, admins/tuteurs see all
CREATE POLICY "Users can view own tests" ON tests
  FOR SELECT USING (
    inscription_id IN (
      SELECT id FROM inscriptions WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins and tuteurs can view all tests" ON tests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'tuteur')
    )
  );

CREATE POLICY "Users can insert own tests" ON tests
  FOR INSERT WITH CHECK (
    inscription_id IN (
      SELECT id FROM inscriptions WHERE profile_id = auth.uid()
    )
  );

-- User roles: Only admins can manage
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert roles" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete roles" ON user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
