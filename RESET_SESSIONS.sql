-- ================================================
-- RESET ET RECRÉATION DES SESSIONS
-- ================================================
-- Ce script supprime TOUTES les sessions et les recrée avec les bonnes dates

-- ================================================
-- ÉTAPE 1 : SUPPRIMER TOUTES LES SESSIONS
-- ================================================

-- Supprimer d'abord les réservations (dépendances)
DELETE FROM session_bookings;

-- Supprimer toutes les sessions
DELETE FROM sessions;

-- ================================================
-- ÉTAPE 2 : RECRÉER LES 12 SESSIONS EXACTES
-- ================================================

DO $$
DECLARE
  v_masterclass_id UUID;
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
      '2025-10-20',
      '2025-11-06'
    )
    RETURNING id INTO v_masterclass_id;
  END IF;
  
  -- Créer exactement 12 sessions
  INSERT INTO sessions (masterclass_id, session_date, max_participants, current_participants)
  VALUES
    -- OCTOBRE 2025 (8 sessions)
    (v_masterclass_id, '2025-10-20', 25, 0),  -- Lundi
    (v_masterclass_id, '2025-10-21', 25, 0),  -- Mardi
    (v_masterclass_id, '2025-10-22', 25, 0),  -- Mercredi
    (v_masterclass_id, '2025-10-23', 25, 0),  -- Jeudi
    (v_masterclass_id, '2025-10-27', 25, 0),  -- Lundi
    (v_masterclass_id, '2025-10-28', 25, 0),  -- Mardi
    (v_masterclass_id, '2025-10-29', 25, 0),  -- Mercredi
    (v_masterclass_id, '2025-10-30', 25, 0),  -- Jeudi
    -- NOVEMBRE 2025 (4 sessions)
    (v_masterclass_id, '2025-11-03', 25, 0),  -- Lundi
    (v_masterclass_id, '2025-11-04', 25, 0),  -- Mardi
    (v_masterclass_id, '2025-11-05', 25, 0),  -- Mercredi
    (v_masterclass_id, '2025-11-06', 25, 0);  -- Jeudi
END $$;

-- ================================================
-- ÉTAPE 3 : VÉRIFICATION
-- ================================================

-- Compter les sessions
SELECT COUNT(*) as total_sessions FROM sessions;

-- Afficher toutes les sessions
SELECT 
  id,
  session_date,
  to_char(session_date, 'Day DD Month YYYY') as date_formatee,
  max_participants,
  current_participants,
  (max_participants - current_participants) as places_disponibles
FROM sessions
ORDER BY session_date;

-- Vérifier la capacité totale
SELECT 
  COUNT(*) as nombre_sessions,
  SUM(max_participants) as capacite_totale,
  SUM(current_participants) as places_reservees,
  SUM(max_participants - current_participants) as places_restantes
FROM sessions;
