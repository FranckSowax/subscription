-- Migration: Create sessions and session_bookings tables
-- Date: 2025-01-12
-- Description: Create missing tables for masterclass sessions and bookings

-- ================================================
-- 0. CHECK IF OLD TABLE EXISTS AND RENAME IT
-- ================================================

-- If masterclass_sessions exists, rename it to sessions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'masterclass_sessions'
    AND table_schema = 'public'
  ) THEN
    -- Rename the table
    ALTER TABLE masterclass_sessions RENAME TO sessions;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'sessions' AND column_name = 'current_participants'
    ) THEN
      ALTER TABLE sessions ADD COLUMN current_participants INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    RAISE NOTICE 'Table masterclass_sessions renamed to sessions';
  END IF;
END $$;

-- ================================================
-- 1. CREATE SESSIONS TABLE (if it doesn't exist)
-- ================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id UUID NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 25,
  current_participants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_masterclass_id ON sessions(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date);

-- ================================================
-- 2. CREATE SESSION_BOOKINGS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id UUID NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inscription_id) -- Une inscription = une seule session
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_bookings_inscription_id ON session_bookings(inscription_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id);

-- ================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read sessions (for booking)
CREATE POLICY "Allow public read access to sessions" ON sessions
  FOR SELECT USING (true);

-- Allow service role to manage sessions
CREATE POLICY "Allow service role to manage sessions" ON sessions
  FOR ALL USING (true);

-- Allow users to read their own bookings
CREATE POLICY "Allow users to read own bookings" ON session_bookings
  FOR SELECT USING (auth.uid() IN (
    SELECT profile_id FROM inscriptions WHERE id = inscription_id
  ));

-- Allow service role to manage bookings
CREATE POLICY "Allow service role to manage bookings" ON session_bookings
  FOR ALL USING (true);

-- ================================================
-- 4. CREATE UPDATE TIMESTAMP FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_sessions_updated_at_trigger ON sessions;
CREATE TRIGGER update_sessions_updated_at_trigger
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();

-- ================================================
-- 5. POPULATE WITH 12 SESSIONS (Octobre-Novembre 2025)
-- ================================================

-- Get the first masterclass ID
DO $$
DECLARE
  v_masterclass_id UUID;
BEGIN
  -- Get first masterclass
  SELECT id INTO v_masterclass_id FROM masterclasses LIMIT 1;
  
  -- If no masterclass exists, create one
  IF v_masterclass_id IS NULL THEN
    INSERT INTO masterclasses (title, description, max_students, start_date, end_date)
    VALUES (
      'Introduction à l''Intelligence Artificielle - 2025',
      'Masterclass complète d''introduction aux concepts fondamentaux de l''IA et ses applications pratiques',
      300,
      '2025-10-15',
      '2025-11-30'
    )
    RETURNING id INTO v_masterclass_id;
  END IF;
  
  -- Create 12 sessions (weekly, starting from Oct 15, 2025)
  INSERT INTO sessions (masterclass_id, session_date, max_participants, current_participants)
  SELECT 
    v_masterclass_id,
    date::date,
    25,
    0
  FROM generate_series(
    '2025-10-15'::date,
    '2025-11-30'::date,
    '1 week'::interval
  ) AS date
  ON CONFLICT DO NOTHING
  LIMIT 12;
END $$;

-- ================================================
-- VERIFICATION
-- ================================================

-- Count sessions created
SELECT COUNT(*) as total_sessions FROM sessions;

-- Show all sessions
SELECT 
  id,
  session_date,
  max_participants,
  current_participants,
  (max_participants - current_participants) as places_disponibles
FROM sessions
ORDER BY session_date;
