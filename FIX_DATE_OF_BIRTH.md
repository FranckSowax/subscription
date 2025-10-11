# 🔧 Correction Erreur "date_of_birth"

## ❌ Problème

**Erreur affichée :**
```
Erreur lors de la création du profil. Veuillez réessayer.
```

**Cause :**
La colonne `date_of_birth` dans la table `profiles` est marquée comme `NOT NULL` dans Supabase, mais le formulaire ne l'envoie plus.

---

## ✅ Solution : Appliquer la Migration

### Étape 1 : Accéder à Supabase SQL Editor

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard/project/apqpsyugdmvrzaprugvw)
2. Cliquer sur **SQL Editor** dans le menu de gauche
3. Cliquer sur **New query**

### Étape 2 : Exécuter la Migration

Copier et coller ce SQL dans l'éditeur :

```sql
-- Migration: Make date_of_birth optional in profiles table
-- Date: 2025-01-11
-- Description: Remove NOT NULL constraint from date_of_birth column

-- Make date_of_birth nullable
ALTER TABLE profiles 
ALTER COLUMN date_of_birth DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.date_of_birth IS 'Optional date of birth field';
```

### Étape 3 : Exécuter

1. Cliquer sur **Run** (ou Ctrl+Enter)
2. Vérifier le message de succès : `Success. No rows returned`

---

## 🧪 Vérification

### Vérifier la Structure de la Table

```sql
-- Vérifier la structure de la table profiles
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
date_of_birth    | date      | YES         |  ← Doit être YES
whatsapp_number  | text      | NO          | 
created_at       | timestamp | YES         | now()
```

---

## 📱 Tester l'Inscription

Après avoir appliqué la migration :

1. Aller sur l'application : https://subscriptionstudia.netlify.app
2. Cliquer sur **S'inscrire**
3. Remplir le formulaire :
   - Nom complet : `Laura Ndong`
   - Email : `test@example.com`
   - Téléphone : `+241 01 23 45 67`
   - ✅ Cocher le consentement
4. Cliquer sur **Choisir la date de session**

**Résultat attendu :**
✅ Redirection vers la page de sélection de session

---

## 🔄 Flux Complet Après Correction

```
1. Formulaire d'inscription
   └─> Nom, Email, Téléphone, Consentement
   └─> Clic sur "Choisir la date de session"

2. ✅ Profil créé dans Supabase (sans date_of_birth)

3. Redirection automatique
   └─> /inscription/session/[id]

4. Page de sélection de session
   └─> Affichage des 12 dates disponibles
   └─> Sélection d'une date
   └─> Confirmation

5. Redirection vers test PRE
   └─> /test/pre?inscription_id=[id]
```

---

## 📊 Structure de la Table Profiles (Après Migration)

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,  -- ← Maintenant OPTIONNEL
  whatsapp_number text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

---

## 🚨 Si l'Erreur Persiste

### Vérifier les Logs Supabase

1. Dans Supabase Dashboard → **Logs** → **Postgres Logs**
2. Chercher les erreurs récentes
3. Vérifier si `date_of_birth` est mentionné

### Vérifier l'API

```bash
# Tester l'API d'inscription
curl -X POST https://subscriptionstudia.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "whatsapp_number": "+24101234567",
    "consent": true
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "inscription_id": "uuid-here"
  }
}
```

---

## 📝 Fichiers Modifiés

### Code (Déjà Poussé sur GitHub)
- ✅ `components/forms/RegistrationForm.tsx` - Champ supprimé
- ✅ `lib/validations/registration.ts` - Validation retirée
- ✅ `app/api/auth/register/route.ts` - Insertion sans date_of_birth

### Migration (À Appliquer dans Supabase)
- ⚠️ `supabase/migrations/006_make_date_of_birth_optional.sql` - À exécuter

---

## ✅ Checklist

- [ ] Accéder à Supabase SQL Editor
- [ ] Copier la migration SQL
- [ ] Exécuter la migration
- [ ] Vérifier le succès (No rows returned)
- [ ] Vérifier la structure de la table
- [ ] Tester l'inscription sur l'app
- [ ] Vérifier la redirection vers sélection de session

---

## 🎯 Résumé

**Problème :**
- ❌ `date_of_birth` requis en base de données
- ❌ Formulaire ne l'envoie plus
- ❌ Erreur lors de la création du profil

**Solution :**
- ✅ Migration SQL pour rendre `date_of_birth` optionnel
- ✅ Exécuter dans Supabase SQL Editor
- ✅ Tester l'inscription

**Après la migration, l'inscription fonctionnera et redirigera vers la page de sélection de session ! 🎉**
