-- Script de vérification de la base de données
-- Copiez/collez ce script dans Supabase SQL Editor pour vérifier votre configuration

-- 1. Vérifier les tables existantes
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('profiles', 'masterclasses', 'inscriptions', 'questions', 'tests', 'user_roles')
ORDER BY table_name;

-- 2. Vérifier RLS (Row Level Security) activé
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'masterclasses', 'inscriptions', 'questions', 'tests', 'user_roles')
ORDER BY tablename;

-- 3. Compter les enregistrements dans chaque table
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'masterclasses', COUNT(*) FROM masterclasses
UNION ALL
SELECT 'inscriptions', COUNT(*) FROM inscriptions
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'tests', COUNT(*) FROM tests
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles;

-- 4. Vérifier si une masterclass par défaut existe
SELECT id, title, description, created_at 
FROM masterclasses 
ORDER BY created_at 
LIMIT 1;
