# 🔍 Diagnostic Erreur Inscription Mobile

## ❌ Erreur Rapportée

"Erreur lors de la création de profil sur mobile"

---

## 🔧 Vérifications à Faire dans Supabase

### 1. Vérifier que Toutes les Tables Existent

```sql
-- Copier-coller dans Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Résultat attendu (9 tables) :**
```
inscriptions
masterclass_sessions
masterclasses
profiles
questions
session_bookings
student_auth_tokens
test_answers
tests
```

**Si vous n'avez PAS ces 9 tables :**
→ Appliquer les migrations 1 à 6 (voir message précédent)

---

### 2. Vérifier la Structure de la Table `profiles`

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

**Résultat attendu :**
```
column_name      | data_type | is_nullable | column_default
-----------------+-----------+-------------+----------------
id               | uuid      | NO          | 
full_name        | text      | NO          | 
date_of_birth    | date      | YES         | ← DOIT être YES (nullable)
whatsapp_number  | text      | NO          | 
created_at       | timestamp | YES         | now()
```

**Si `date_of_birth` est `NO` (NOT NULL) :**
→ Appliquer la migration 6

---

### 3. Vérifier qu'il y a une Masterclass

```sql
SELECT * FROM masterclasses;
```

**Résultat attendu (au moins 1 ligne) :**
```
id                                   | title                                      | description
-------------------------------------+--------------------------------------------+-------------
00000000-0000-0000-0000-000000000001 | Introduction à l'Intelligence Artificielle | ...
```

**Si vide :**
→ Appliquer la migration 2

---

### 4. Vérifier qu'il y a des Sessions

```sql
SELECT COUNT(*) as total_sessions FROM masterclass_sessions;
```

**Résultat attendu :**
```
total_sessions
--------------
12
```

**Si 0 :**
→ Appliquer la migration 3

---

### 5. Vérifier qu'il y a des Questions

```sql
SELECT COUNT(*) as total_questions FROM questions;
```

**Résultat attendu :**
```
total_questions
---------------
20
```

**Si 0 :**
→ Appliquer la migration 4

---

## 🧪 Test Manuel d'Inscription

### Via l'API Directement

```bash
# Tester l'API d'inscription
curl -X POST https://subscriptionstudia.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Mobile",
    "email": "testmobile@example.com",
    "whatsapp_number": "+24101234567",
    "consent": true
  }'
```

**Réponse attendue (succès) :**
```json
{
  "success": true,
  "message": "Inscription réussie!",
  "data": {
    "user_id": "uuid-here",
    "inscription_id": "uuid-here"
  }
}
```

**Réponse en cas d'erreur :**
```json
{
  "error": "Message d'erreur détaillé"
}
```

---

## 🔍 Erreurs Possibles et Solutions

### Erreur 1 : "relation 'profiles' does not exist"

**Cause :** Table `profiles` n'existe pas

**Solution :**
```sql
-- Appliquer Migration 1 (voir message précédent)
```

---

### Erreur 2 : "null value in column 'date_of_birth' violates not-null constraint"

**Cause :** La colonne `date_of_birth` est encore obligatoire

**Solution :**
```sql
-- Appliquer Migration 6
ALTER TABLE profiles 
ALTER COLUMN date_of_birth DROP NOT NULL;
```

---

### Erreur 3 : "Erreur lors de la création du profil"

**Causes possibles :**
1. Colonne `date_of_birth` encore NOT NULL
2. Problème de permissions RLS (Row Level Security)
3. Contrainte de clé étrangère

**Solution :**
```sql
-- Vérifier les contraintes
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- Désactiver temporairement RLS pour tester
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

---

### Erreur 4 : "Erreur lors de l'inscription"

**Cause :** Pas de masterclass dans la base

**Solution :**
```sql
-- Appliquer Migration 2
INSERT INTO masterclasses (id, title, description)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Introduction à l''Intelligence Artificielle',
  'Masterclass d''introduction aux concepts fondamentaux de l''IA'
);
```

---

## 📱 Vérifier les Logs Netlify

1. Aller sur [Netlify Dashboard](https://app.netlify.com)
2. Sélectionner votre site
3. **Functions** → Logs
4. Chercher les erreurs récentes de `/api/auth/register`

---

## 🔐 Vérifier les Variables d'Environnement Netlify

**Variables requises :**
```
NEXT_PUBLIC_SUPABASE_URL=https://apqpsyugdmvrzaprugvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[votre_service_role_key]
```

**Vérifier :**
1. Netlify Dashboard → Site settings → Environment variables
2. Les 3 variables doivent être présentes
3. Pas d'espaces avant/après les valeurs

---

## ✅ Checklist de Diagnostic

- [ ] Les 9 tables existent dans Supabase
- [ ] `date_of_birth` est nullable (YES)
- [ ] Il y a 1 masterclass
- [ ] Il y a 12 sessions
- [ ] Il y a 20 questions
- [ ] Les variables d'environnement Netlify sont configurées
- [ ] Test API réussi (curl)
- [ ] Logs Netlify vérifiés

---

## 🚀 Solution Rapide

**Si vous n'avez PAS encore appliqué les migrations :**

1. Ouvrir Supabase SQL Editor
2. Copier-coller les 6 migrations SQL (voir message précédent)
3. Exécuter une par une
4. Vérifier avec les requêtes de diagnostic ci-dessus
5. Tester l'inscription sur mobile

---

## 📞 Besoin d'Aide ?

**Envoyez-moi :**
1. Le résultat de la requête : `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
2. Le résultat de : `SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'profiles'`
3. Le message d'erreur exact affiché sur mobile
4. Les logs Netlify Functions (si disponibles)

---

**La cause la plus probable : Les migrations n'ont pas été appliquées dans Supabase ! 🎯**
