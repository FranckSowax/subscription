-- Migration pour ajouter les sessions de masterclass et les réservations

-- Table des sessions de masterclass
CREATE TABLE IF NOT EXISTS masterclass_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id uuid NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  max_participants int NOT NULL DEFAULT 25,
  current_participants int NOT NULL DEFAULT 0,
  is_full boolean GENERATED ALWAYS AS (current_participants >= max_participants) STORED,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(masterclass_id, session_date)
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS session_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES masterclass_sessions(id) ON DELETE CASCADE,
  booked_at timestamp with time zone DEFAULT now(),
  UNIQUE(inscription_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sessions_masterclass_id ON masterclass_sessions(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON masterclass_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_inscription_id ON session_bookings(inscription_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON session_bookings(session_id);

-- Enable RLS
ALTER TABLE masterclass_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour masterclass_sessions
CREATE POLICY "Les sessions sont visibles par tous"
  ON masterclass_sessions FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent créer des sessions"
  ON masterclass_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tuteur')
    )
  );

-- RLS Policies pour session_bookings
CREATE POLICY "Les utilisateurs peuvent voir leurs propres réservations"
  ON session_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inscriptions
      WHERE inscriptions.id = session_bookings.inscription_id
      AND inscriptions.profile_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer leurs propres réservations"
  ON session_bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inscriptions
      WHERE inscriptions.id = inscription_id
      AND inscriptions.profile_id = auth.uid()
    )
  );

-- Fonction pour incrémenter le compteur de participants
CREATE OR REPLACE FUNCTION increment_session_participants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE masterclass_sessions
  SET current_participants = current_participants + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour décrémenter le compteur de participants
CREATE OR REPLACE FUNCTION decrement_session_participants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE masterclass_sessions
  SET current_participants = current_participants - 1
  WHERE id = OLD.session_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour maintenir le compteur à jour
DROP TRIGGER IF EXISTS trigger_increment_participants ON session_bookings;
CREATE TRIGGER trigger_increment_participants
  AFTER INSERT ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION increment_session_participants();

DROP TRIGGER IF EXISTS trigger_decrement_participants ON session_bookings;
CREATE TRIGGER trigger_decrement_participants
  AFTER DELETE ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION decrement_session_participants();

-- Insérer les sessions pour la masterclass par défaut
DO $$
DECLARE
  v_masterclass_id uuid;
  v_dates date[] := ARRAY[
    '2025-10-20'::date, '2025-10-21'::date, '2025-10-22'::date, '2025-10-23'::date,
    '2025-10-27'::date, '2025-10-28'::date, '2025-10-29'::date, '2025-10-30'::date,
    '2025-11-03'::date, '2025-11-04'::date, '2025-11-05'::date, '2025-11-06'::date
  ];
  v_date date;
BEGIN
  -- Récupérer l'ID de la masterclass par défaut
  SELECT id INTO v_masterclass_id
  FROM masterclasses
  ORDER BY created_at
  LIMIT 1;

  -- Insérer les sessions si la masterclass existe
  IF v_masterclass_id IS NOT NULL THEN
    FOREACH v_date IN ARRAY v_dates
    LOOP
      INSERT INTO masterclass_sessions (masterclass_id, session_date, max_participants)
      VALUES (v_masterclass_id, v_date, 25)
      ON CONFLICT (masterclass_id, session_date) DO NOTHING;
    END LOOP;
  END IF;
END $$;
