-- Créer les 12 sessions exactes avec les bonnes dates
-- Octobre : 20, 21, 22, 23, 27, 28, 29, 30 (8 sessions)
-- Novembre : 3, 4, 5, 6 (4 sessions)
-- Total : 12 sessions × 25 places = 300 places

-- 1. Supprimer TOUTES les sessions existantes
DELETE FROM masterclass_sessions;

-- 2. Créer les 12 sessions avec les dates exactes
INSERT INTO masterclass_sessions (masterclass_id, session_date, max_participants, current_participants)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  date,
  25,
  0
FROM (
  VALUES
    -- OCTOBRE 2025 (8 sessions)
    ('2025-10-20'::date),  -- Lundi 20 octobre
    ('2025-10-21'::date),  -- Mardi 21 octobre
    ('2025-10-22'::date),  -- Mercredi 22 octobre
    ('2025-10-23'::date),  -- Jeudi 23 octobre
    ('2025-10-27'::date),  -- Lundi 27 octobre
    ('2025-10-28'::date),  -- Mardi 28 octobre
    ('2025-10-29'::date),  -- Mercredi 29 octobre
    ('2025-10-30'::date),  -- Jeudi 30 octobre
    -- NOVEMBRE 2025 (4 sessions)
    ('2025-11-03'::date),  -- Lundi 3 novembre
    ('2025-11-04'::date),  -- Mardi 4 novembre
    ('2025-11-05'::date),  -- Mercredi 5 novembre
    ('2025-11-06'::date)   -- Jeudi 6 novembre
) AS dates(date);

-- 3. Vérifier le résultat
SELECT 
  COUNT(*) as total_sessions,
  SUM(max_participants) as total_capacity,
  SUM(current_participants) as total_booked
FROM masterclass_sessions;

-- 4. Voir toutes les sessions créées
SELECT 
  session_date,
  TO_CHAR(session_date, 'Day DD Month YYYY') as date_formatee,
  max_participants as places,
  current_participants as reservees
FROM masterclass_sessions
ORDER BY session_date;

-- Résultat attendu:
-- total_sessions: 12
-- total_capacity: 300 (12 × 25)
-- total_booked: 0
