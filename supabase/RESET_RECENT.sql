-- ================================================
-- RESET RÉCENT - Supprimer les inscriptions des dernières 24h
-- ================================================
-- Utile pour nettoyer les tests récents sans toucher aux anciennes données
-- ================================================

-- Récupérer les IDs des inscriptions récentes (dernières 24h)
WITH recent_inscriptions AS (
  SELECT id, profile_id 
  FROM inscriptions 
  WHERE registration_date >= NOW() - INTERVAL '24 hours'
)

-- Supprimer les tests liés
DELETE FROM tests 
WHERE inscription_id IN (SELECT id FROM recent_inscriptions);

-- Supprimer les réservations de sessions
DELETE FROM session_bookings 
WHERE inscription_id IN (SELECT id FROM recent_inscriptions);

-- Supprimer les inscriptions
DELETE FROM inscriptions 
WHERE id IN (SELECT id FROM recent_inscriptions);

-- Supprimer les profils orphelins
DELETE FROM profiles 
WHERE id NOT IN (SELECT DISTINCT profile_id FROM inscriptions WHERE profile_id IS NOT NULL);

-- Supprimer les utilisateurs orphelins
DELETE FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT id FROM profiles WHERE id IS NOT NULL);

-- Recalculer les compteurs de participants
UPDATE sessions s
SET current_participants = (
  SELECT COUNT(DISTINCT sb.inscription_id)
  FROM session_bookings sb
  WHERE sb.session_id = s.id
);

-- Vérification
SELECT 
  (SELECT COUNT(*) FROM inscriptions WHERE registration_date >= NOW() - INTERVAL '24 hours') as recent_inscriptions,
  (SELECT COUNT(*) FROM inscriptions) as total_inscriptions,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users) as total_users;
