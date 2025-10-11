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
-- ⚠️ ÉTAPE CRITIQUE - SUPPRIMER LES UTILISATEURS AUTH
-- ================================================
-- IMPORTANT : Ce script ne supprime PAS les utilisateurs de auth.users !
-- Vous devez OBLIGATOIREMENT supprimer les utilisateurs manuellement :
-- 
-- 1. Ouvrez Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Sélectionnez votre projet
-- 3. Allez dans "Authentication" → "Users"
-- 4. Cochez la case en haut pour TOUT sélectionner
-- 5. Cliquez sur "Delete users" (bouton rouge)
-- 6. Confirmez la suppression
--
-- ⚠️ Sans cette étape, vous aurez une erreur 409 (Conflict) lors de l'inscription !

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
