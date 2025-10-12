-- ================================================
-- CORRIGER LES TRIGGERS ET FONCTIONS
-- ================================================
-- Ce script met à jour les triggers qui référencent masterclass_sessions

-- ================================================
-- ÉTAPE 1 : SUPPRIMER LES ANCIENS TRIGGERS
-- ================================================

DROP TRIGGER IF EXISTS decrement_participants_on_delete ON session_bookings;
DROP TRIGGER IF EXISTS increment_participants_on_insert ON session_bookings;

-- ================================================
-- ÉTAPE 2 : SUPPRIMER LES ANCIENNES FONCTIONS
-- ================================================

DROP FUNCTION IF EXISTS decrement_session_participants() CASCADE;
DROP FUNCTION IF EXISTS increment_session_participants() CASCADE;

-- ================================================
-- ÉTAPE 3 : CRÉER LES NOUVELLES FONCTIONS (avec 'sessions')
-- ================================================

-- Fonction pour incrémenter le compteur de participants
CREATE OR REPLACE FUNCTION increment_session_participants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions
  SET current_participants = current_participants + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour décrémenter le compteur de participants
CREATE OR REPLACE FUNCTION decrement_session_participants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions
  SET current_participants = current_participants - 1
  WHERE id = OLD.session_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- ÉTAPE 4 : CRÉER LES NOUVEAUX TRIGGERS
-- ================================================

-- Trigger pour incrémenter quand une réservation est créée
CREATE TRIGGER increment_participants_on_insert
AFTER INSERT ON session_bookings
FOR EACH ROW
EXECUTE FUNCTION increment_session_participants();

-- Trigger pour décrémenter quand une réservation est supprimée
CREATE TRIGGER decrement_participants_on_delete
AFTER DELETE ON session_bookings
FOR EACH ROW
EXECUTE FUNCTION decrement_session_participants();

-- ================================================
-- ÉTAPE 5 : VÉRIFICATION
-- ================================================

-- Lister tous les triggers sur session_bookings
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'session_bookings';

-- Lister toutes les fonctions créées
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%session_participants%'
AND routine_schema = 'public';
