-- ⚠️ Script pour supprimer les profils de test et leurs données associées
-- Date: 2025-10-11
-- Description: Supprimer les inscriptions, tests et profils existants

-- ================================================
-- SUPPRESSION DES DONNÉES DE TEST
-- ================================================

-- 1. Supprimer les réservations de sessions
DELETE FROM session_bookings;

-- 2. Supprimer les tests
DELETE FROM tests;

-- 3. Supprimer les inscriptions
DELETE FROM inscriptions;

-- 4. Supprimer les profils
DELETE FROM profiles;

-- ================================================
-- NOTE IMPORTANTE
-- ================================================
-- Les utilisateurs dans auth.users doivent être supprimés manuellement :
-- 1. Allez dans Supabase Dashboard
-- 2. Authentication → Users
-- 3. Sélectionnez tous les utilisateurs
-- 4. Cliquez sur "Delete users"

-- ================================================
-- VÉRIFICATION
-- ================================================
SELECT 
  'session_bookings' as table_name, 
  COUNT(*) as remaining_count 
FROM session_bookings

UNION ALL

SELECT 'tests', COUNT(*) FROM tests

UNION ALL

SELECT 'inscriptions', COUNT(*) FROM inscriptions

UNION ALL

SELECT 'profiles', COUNT(*) FROM profiles;

-- Résultat attendu : 0 pour chaque table
