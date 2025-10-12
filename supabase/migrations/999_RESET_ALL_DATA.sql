-- ================================================
-- ⚠️ ATTENTION : SCRIPT DE RESET COMPLET
-- ================================================
-- Ce script supprime TOUTES les données d'inscription et d'authentification
-- Utiliser UNIQUEMENT en développement/test
-- NE PAS EXÉCUTER EN PRODUCTION sans backup !
-- ================================================

-- Désactiver temporairement les triggers pour éviter les problèmes de cascade
SET session_replication_role = 'replica';

-- ================================================
-- ÉTAPE 1 : Supprimer les tests
-- ================================================
DELETE FROM tests;

-- ================================================
-- ÉTAPE 2 : Supprimer les réservations de sessions
-- ================================================
DELETE FROM session_bookings;

-- ================================================
-- ÉTAPE 3 : Supprimer les inscriptions
-- ================================================
DELETE FROM inscriptions;

-- ================================================
-- ÉTAPE 4 : Supprimer les profils
-- ================================================
DELETE FROM profiles;

-- ================================================
-- ÉTAPE 5 : Réinitialiser les compteurs de sessions
-- ================================================
UPDATE sessions 
SET current_participants = 0;

-- ================================================
-- ÉTAPE 6 : Supprimer les utilisateurs d'authentification
-- ================================================
-- ATTENTION : Cela supprime TOUS les utilisateurs sauf les admins
-- Modifier la condition WHERE si vous avez des emails admin spécifiques

-- Option 1 : Supprimer TOUS les utilisateurs (DANGEREUX!)
-- TRUNCATE auth.users CASCADE;

-- Option 2 : Supprimer tous les utilisateurs SAUF les admins
-- Remplacez 'admin@example.com' par votre email admin
DELETE FROM auth.users 
WHERE email NOT IN ('admin@example.com', 'admin@studiaai.com');

-- Si vous voulez supprimer TOUS les utilisateurs (y compris admins), décommentez :
-- DELETE FROM auth.users;

-- ================================================
-- Réactiver les triggers
-- ================================================
SET session_replication_role = 'origin';

-- ================================================
-- VÉRIFICATION : Compter les enregistrements restants
-- ================================================
SELECT 
  (SELECT COUNT(*) FROM tests) as tests_count,
  (SELECT COUNT(*) FROM session_bookings) as bookings_count,
  (SELECT COUNT(*) FROM inscriptions) as inscriptions_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users) as users_count;

-- ================================================
-- RÉSULTAT ATTENDU
-- ================================================
-- Si tout s'est bien passé, vous devriez voir :
-- tests_count: 0
-- bookings_count: 0
-- inscriptions_count: 0
-- profiles_count: 0
-- users_count: 0 (ou 1+ si vous avez gardé des admins)
-- ================================================
