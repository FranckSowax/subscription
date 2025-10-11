-- ⚠️ ATTENTION : Ce script supprime TOUTES les données de la base de données
-- Utilisez avec précaution ! Cette action est IRRÉVERSIBLE !
-- Date: 2025-10-11
-- Description: Réinitialiser toutes les tables pour repartir à zéro

-- ================================================
-- PARTIE 1 : Supprimer les données des tables
-- ================================================

-- 1. Supprimer les réservations de sessions (dépend de sessions et inscriptions)
DELETE FROM session_bookings;

-- 2. Supprimer les tests (dépend de inscriptions)
DELETE FROM tests;

-- 3. Supprimer les inscriptions (dépend de profiles et masterclasses)
DELETE FROM inscriptions;

-- 4. Supprimer les profils (dépend de auth.users)
DELETE FROM profiles;

-- 5. Supprimer les sessions
DELETE FROM sessions;

-- 6. Supprimer les masterclasses
DELETE FROM masterclasses;

-- 7. Supprimer les questions QCM (optionnel - décommenter si vous voulez aussi supprimer les questions)
-- DELETE FROM questions;

-- ================================================
-- PARTIE 2 : Supprimer les utilisateurs auth
-- ================================================

-- Note: Cette partie doit être exécutée séparément car elle nécessite des permissions admin
-- Vous devrez supprimer les utilisateurs via le dashboard Supabase Authentication
-- OU exécuter ce script via une fonction RPC avec des privilèges admin

-- Pour supprimer tous les utilisateurs auth manuellement :
-- 1. Allez dans Supabase Dashboard > Authentication > Users
-- 2. Sélectionnez tous les utilisateurs
-- 3. Cliquez sur "Delete users"

-- ================================================
-- PARTIE 3 : Réinitialiser les séquences (optionnel)
-- ================================================

-- Réinitialise les compteurs auto-increment si nécessaire
-- ALTER SEQUENCE IF EXISTS inscriptions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tests_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS sessions_id_seq RESTART WITH 1;

-- ================================================
-- VÉRIFICATION
-- ================================================

-- Vérifier que toutes les tables sont vides
SELECT 'session_bookings' as table_name, COUNT(*) as count FROM session_bookings
UNION ALL
SELECT 'tests', COUNT(*) FROM tests
UNION ALL
SELECT 'inscriptions', COUNT(*) FROM inscriptions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'masterclasses', COUNT(*) FROM masterclasses
UNION ALL
SELECT 'questions', COUNT(*) FROM questions;

-- ================================================
-- RÉSULTAT ATTENDU
-- ================================================
-- Toutes les lignes devraient afficher "0" pour le count
-- Si ce n'est pas le cas, vérifiez les contraintes de clés étrangères
