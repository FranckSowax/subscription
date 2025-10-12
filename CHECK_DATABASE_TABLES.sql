-- Script pour vérifier toutes les tables de la base de données
-- Utile pour diagnostiquer les problèmes de schéma

-- ================================================
-- 1. LISTER TOUTES LES TABLES
-- ================================================

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ================================================
-- 2. VÉRIFIER LES TABLES REQUISES POUR L'APP
-- ================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'masterclasses') 
    THEN '✅' ELSE '❌' 
  END as masterclasses,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') 
    THEN '✅' ELSE '❌' 
  END as sessions,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscriptions') 
    THEN '✅' ELSE '❌' 
  END as inscriptions,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅' ELSE '❌' 
  END as profiles,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_bookings') 
    THEN '✅' ELSE '❌' 
  END as session_bookings,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tests') 
    THEN '✅' ELSE '❌' 
  END as tests,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') 
    THEN '✅' ELSE '❌' 
  END as questions;

-- ================================================
-- 3. COMPTER LES ENREGISTREMENTS DANS CHAQUE TABLE
-- ================================================

SELECT 'masterclasses' as table_name, COUNT(*) as count FROM masterclasses
UNION ALL
SELECT 'inscriptions', COUNT(*) FROM inscriptions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'tests', COUNT(*) FROM tests
UNION ALL
SELECT 'questions', COUNT(*) FROM questions;

-- Note: sessions et session_bookings seront ajoutés après la migration

-- ================================================
-- 4. CHERCHER DES TABLES AVEC "SESSION" DANS LE NOM
-- ================================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%session%'
ORDER BY table_name;

-- ================================================
-- 5. AFFICHER LA STRUCTURE DES COLONNES
-- ================================================

-- Colonnes de la table inscriptions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscriptions'
ORDER BY ordinal_position;

-- ================================================
-- RÉSULTAT ATTENDU
-- ================================================

-- Si vous voyez ❌ pour "sessions" ou "session_bookings",
-- vous devez appliquer la migration 008_create_sessions_table.sql
