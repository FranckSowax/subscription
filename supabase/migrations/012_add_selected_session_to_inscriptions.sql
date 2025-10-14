-- ================================================
-- Migration 012: Ajouter selected_session_id aux inscriptions
-- ================================================
-- Permet de stocker le choix de session AVANT le pré-test
-- La réservation réelle (session_bookings) n'est créée qu'APRÈS le test
-- ================================================

-- 1. Ajouter la colonne selected_session_id à la table inscriptions
ALTER TABLE inscriptions 
ADD COLUMN IF NOT EXISTS selected_session_id uuid REFERENCES sessions(id) ON DELETE SET NULL;

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_inscriptions_selected_session 
ON inscriptions(selected_session_id);

-- 3. Modifier le trigger de pré-test pour créer automatiquement la réservation
-- après la soumission du pré-test SI une session a été sélectionnée
CREATE OR REPLACE FUNCTION auto_create_booking_after_pretest()
RETURNS TRIGGER AS $$
DECLARE
  v_selected_session_id uuid;
  v_session_full boolean;
  v_booking_exists boolean;
BEGIN
  -- Ne s'exécuter que pour les tests PRE
  IF NEW.type = 'PRE' THEN
    -- Récupérer la session sélectionnée pour cette inscription
    SELECT selected_session_id INTO v_selected_session_id
    FROM inscriptions
    WHERE id = NEW.inscription_id;
    
    -- Si une session a été sélectionnée
    IF v_selected_session_id IS NOT NULL THEN
      -- Vérifier si un booking existe déjà pour cette inscription
      SELECT EXISTS (
        SELECT 1 FROM session_bookings 
        WHERE inscription_id = NEW.inscription_id
      ) INTO v_booking_exists;
      
      -- Ne rien faire si un booking existe déjà
      IF NOT v_booking_exists THEN
        -- Vérifier si la session n'est pas pleine
        SELECT (current_participants >= max_participants) INTO v_session_full
        FROM sessions
        WHERE id = v_selected_session_id;
        
        -- Si la session n'est pas pleine, créer la réservation
        IF NOT v_session_full THEN
          -- Créer la réservation
          INSERT INTO session_bookings (inscription_id, session_id)
          VALUES (NEW.inscription_id, v_selected_session_id);
          
          -- Incrémenter le compteur de participants
          UPDATE sessions
          SET current_participants = current_participants + 1
          WHERE id = v_selected_session_id;
          
          -- Effacer le selected_session_id (maintenant qu'on a créé la réservation)
          UPDATE inscriptions
          SET selected_session_id = NULL
          WHERE id = NEW.inscription_id;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_create_booking_after_pretest ON tests;

CREATE TRIGGER trigger_auto_create_booking_after_pretest
  AFTER INSERT ON tests
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_booking_after_pretest();

-- 5. Commentaires
COMMENT ON COLUMN inscriptions.selected_session_id IS 
  'Session choisie par l''étudiant AVANT le pré-test. Utilisée pour créer automatiquement la réservation après le test.';

COMMENT ON FUNCTION auto_create_booking_after_pretest() IS 
  'Crée automatiquement une réservation de session après la soumission du pré-test si une session a été présélectionnée.';

COMMENT ON TRIGGER trigger_auto_create_booking_after_pretest ON tests IS 
  'Finalise la réservation de session automatiquement après le pré-test réussi.';
