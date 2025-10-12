-- ================================================
-- QUICK FIX : Créer ou Renommer la table sessions
-- ================================================
-- Copiez TOUT ce fichier dans Supabase SQL Editor

-- Étape 1 : Renommer masterclass_sessions si elle existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'masterclass_sessions'
  ) THEN
    ALTER TABLE masterclass_sessions RENAME TO sessions;
    
    -- Ajouter current_participants si manquant
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'sessions' AND column_name = 'current_participants'
    ) THEN
      ALTER TABLE sessions ADD COLUMN current_participants INTEGER NOT NULL DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Étape 2 : Créer sessions si elle n'existe pas
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id UUID NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 25,
  current_participants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Étape 3 : Créer session_bookings si elle n'existe pas
CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id UUID NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inscription_id)
);

-- Étape 4 : Créer les index
CREATE INDEX IF NOT EXISTS idx_sessions_masterclass_id ON sessions(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_bookings_inscription_id ON session_bookings(inscription_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id);

-- Étape 5 : Activer RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- Étape 6 : Créer les politiques RLS
DROP POLICY IF EXISTS "Allow public read access to sessions" ON sessions;
CREATE POLICY "Allow public read access to sessions" ON sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role to manage sessions" ON sessions;
CREATE POLICY "Allow service role to manage sessions" ON sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow users to read own bookings" ON session_bookings;
CREATE POLICY "Allow users to read own bookings" ON session_bookings
  FOR SELECT USING (auth.uid() IN (
    SELECT profile_id FROM inscriptions WHERE id = inscription_id
  ));

DROP POLICY IF EXISTS "Allow service role to manage bookings" ON session_bookings;
CREATE POLICY "Allow service role to manage bookings" ON session_bookings FOR ALL USING (true);

-- Étape 7 : Créer 12 sessions
DO $$
DECLARE
  v_masterclass_id UUID;
  v_session_count INTEGER;
BEGIN
  -- Obtenir la première masterclass
  SELECT id INTO v_masterclass_id FROM masterclasses ORDER BY created_at LIMIT 1;
  
  -- Si pas de masterclass, en créer une
  IF v_masterclass_id IS NULL THEN
    INSERT INTO masterclasses (title, description, max_students, start_date, end_date)
    VALUES (
      'Introduction à l''Intelligence Artificielle - 2025',
      'Masterclass complète d''introduction aux concepts fondamentaux de l''IA',
      300,
      '2025-10-15',
      '2025-11-30'
    )
    RETURNING id INTO v_masterclass_id;
  END IF;
  
  -- Compter les sessions existantes
  SELECT COUNT(*) INTO v_session_count FROM sessions WHERE masterclass_id = v_masterclass_id;
  
  -- Créer les 12 sessions avec les dates exactes
  IF v_session_count < 12 THEN
    INSERT INTO sessions (masterclass_id, session_date, max_participants, current_participants)
    VALUES
      -- Octobre 2025 (8 sessions)
      (v_masterclass_id, '2025-10-20', 25, 0),
      (v_masterclass_id, '2025-10-21', 25, 0),
      (v_masterclass_id, '2025-10-22', 25, 0),
      (v_masterclass_id, '2025-10-23', 25, 0),
      (v_masterclass_id, '2025-10-27', 25, 0),
      (v_masterclass_id, '2025-10-28', 25, 0),
      (v_masterclass_id, '2025-10-29', 25, 0),
      (v_masterclass_id, '2025-10-30', 25, 0),
      -- Novembre 2025 (4 sessions)
      (v_masterclass_id, '2025-11-03', 25, 0),
      (v_masterclass_id, '2025-11-04', 25, 0),
      (v_masterclass_id, '2025-11-05', 25, 0),
      (v_masterclass_id, '2025-11-06', 25, 0)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Étape 8 : Vérification
SELECT 
  'sessions' AS table_name,
  COUNT(*) AS total_rows
FROM sessions
UNION ALL
SELECT 
  'session_bookings',
  COUNT(*)
FROM session_bookings;

-- Afficher les sessions créées
SELECT 
  id,
  session_date,
  max_participants,
  current_participants,
  (max_participants - current_participants) AS places_disponibles
FROM sessions
ORDER BY session_date;
