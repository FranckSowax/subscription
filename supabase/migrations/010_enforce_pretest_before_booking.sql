-- ================================================
-- Migration 010: Forcer le pré-test avant réservation
-- ================================================
-- Cette migration garantit qu'un étudiant doit passer 
-- le pré-test avant de pouvoir réserver une session
-- ================================================

-- 1. Créer une fonction pour vérifier si le pré-test a été effectué
CREATE OR REPLACE FUNCTION check_pretest_before_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si un pré-test existe pour cette inscription
  IF NOT EXISTS (
    SELECT 1 
    FROM tests 
    WHERE inscription_id = NEW.inscription_id 
    AND type = 'PRE'
  ) THEN
    RAISE EXCEPTION 'Le pré-test doit être effectué avant de réserver une session';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer un trigger sur la table session_bookings
DROP TRIGGER IF EXISTS ensure_pretest_before_booking ON session_bookings;

CREATE TRIGGER ensure_pretest_before_booking
  BEFORE INSERT ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_pretest_before_booking();

-- 3. Ajouter un commentaire pour la documentation
COMMENT ON FUNCTION check_pretest_before_booking() IS 
  'Vérifie qu''un étudiant a effectué le pré-test avant de permettre la réservation d''une session';

COMMENT ON TRIGGER ensure_pretest_before_booking ON session_bookings IS 
  'Garantit que le pré-test est obligatoire avant toute réservation de session';
