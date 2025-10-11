-- Diagnostic: Vérifier le nombre de sessions et leur capacité

-- 1. Compter les sessions
SELECT COUNT(*) as nombre_sessions FROM masterclass_sessions;

-- 2. Voir toutes les sessions avec leurs dates
SELECT 
  id,
  session_date,
  max_participants,
  current_participants,
  created_at
FROM masterclass_sessions
ORDER BY session_date;

-- 3. Statistiques globales
SELECT 
  COUNT(*) as total_sessions,
  SUM(max_participants) as total_capacity,
  SUM(current_participants) as total_booked,
  AVG(max_participants) as avg_capacity
FROM masterclass_sessions;

-- 4. Grouper par date pour voir les doublons
SELECT 
  session_date,
  COUNT(*) as nombre_fois
FROM masterclass_sessions
GROUP BY session_date
HAVING COUNT(*) > 1;

-- ============================================
-- SOLUTION 1: Si vous avez des doublons
-- ============================================

-- Supprimer les doublons (garder seulement 1 par date)
DELETE FROM masterclass_sessions
WHERE id NOT IN (
  SELECT MIN(id)
  FROM masterclass_sessions
  GROUP BY session_date
);

-- ============================================
-- SOLUTION 2: Si vous avez trop de sessions
-- ============================================

-- Supprimer TOUTES les sessions existantes
DELETE FROM masterclass_sessions;

-- Recréer exactement 12 sessions (Octobre + Novembre 2025)
INSERT INTO masterclass_sessions (masterclass_id, session_date, max_participants, current_participants)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  date,
  25,
  0
FROM (
  VALUES
    -- Octobre 2025 (6 sessions)
    ('2025-10-15'::date),
    ('2025-10-22'::date),
    ('2025-10-29'::date),
    -- Novembre 2025 (6 sessions)
    ('2025-11-05'::date),
    ('2025-11-12'::date),
    ('2025-11-19'::date),
    ('2025-11-26'::date),
    -- Décembre 2025 (3 sessions)
    ('2025-12-03'::date),
    ('2025-12-10'::date),
    ('2025-12-17'::date),
    -- Janvier 2026 (2 sessions)
    ('2026-01-07'::date),
    ('2026-01-14'::date)
) AS dates(date);

-- Vérifier le résultat final
SELECT 
  COUNT(*) as total_sessions,
  SUM(max_participants) as total_capacity
FROM masterclass_sessions;

-- Résultat attendu:
-- total_sessions: 12
-- total_capacity: 300 (12 x 25)
