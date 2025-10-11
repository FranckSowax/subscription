-- Script pour vérifier les utilisateurs dans auth.users
-- Les utilisateurs auth doivent être supprimés manuellement via le Dashboard

-- ================================================
-- VÉRIFIER LES UTILISATEURS AUTH EXISTANTS
-- ================================================

-- Compter le nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM auth.users;

-- Lister tous les utilisateurs avec leur email
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ================================================
-- INSTRUCTIONS POUR SUPPRIMER LES UTILISATEURS
-- ================================================

-- ⚠️ Les utilisateurs dans auth.users NE PEUVENT PAS être supprimés via SQL
-- Vous DEVEZ utiliser le Dashboard Supabase :

-- 1. Allez sur : https://supabase.com/dashboard
-- 2. Sélectionnez votre projet
-- 3. Cliquez sur "Authentication" dans le menu de gauche
-- 4. Cliquez sur "Users"
-- 5. Cochez la case en haut pour sélectionner TOUS les utilisateurs
-- 6. Cliquez sur "Delete users" (bouton rouge)
-- 7. Confirmez la suppression

-- Une fois les utilisateurs supprimés, vous pourrez vous réinscrire sans erreur 409
