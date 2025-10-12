-- ================================================
-- RESET SIMPLE - Supprimer toutes les inscriptions
-- ================================================
-- Version rapide et simple
-- ================================================

-- Supprimer les tests
DELETE FROM tests;

-- Supprimer les réservations de sessions
DELETE FROM session_bookings;

-- Supprimer les inscriptions
DELETE FROM inscriptions;

-- Supprimer les profils
DELETE FROM profiles;

-- Réinitialiser les compteurs de sessions
UPDATE sessions SET current_participants = 0;

-- Supprimer TOUS les utilisateurs
DELETE FROM auth.users;

-- Vérification
SELECT 
  (SELECT COUNT(*) FROM tests) as tests,
  (SELECT COUNT(*) FROM inscriptions) as inscriptions,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users) as users;
