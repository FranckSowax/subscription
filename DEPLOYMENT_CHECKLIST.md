# ✅ Checklist de Déploiement - Masterclass IA

## 🗄️ Migrations Supabase (OBLIGATOIRE)

### ⚠️ IMPORTANT : Appliquer dans l'ordre !

Aller sur : https://supabase.com/dashboard/project/apqpsyugdmvrzaprugvw → SQL Editor

---

### 1️⃣ Migration : Rendre date_of_birth optionnel

```sql
ALTER TABLE profiles 
ALTER COLUMN date_of_birth DROP NOT NULL;

COMMENT ON COLUMN profiles.date_of_birth IS 'Optional date of birth field';
```

**Vérification :**
```sql
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'date_of_birth';
-- Résultat attendu : is_nullable = YES
```

---

### 2️⃣ Migration : Créer les 12 sessions correctes

```sql
-- Supprimer toutes les sessions existantes
DELETE FROM masterclass_sessions;

-- Créer exactement 12 sessions (Octobre + Novembre 2025)
INSERT INTO masterclass_sessions (masterclass_id, session_date, max_participants, current_participants)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  date,
  25,
  0
FROM (
  VALUES
    -- OCTOBRE 2025 (8 sessions)
    ('2025-10-20'::date),
    ('2025-10-21'::date),
    ('2025-10-22'::date),
    ('2025-10-23'::date),
    ('2025-10-27'::date),
    ('2025-10-28'::date),
    ('2025-10-29'::date),
    ('2025-10-30'::date),
    -- NOVEMBRE 2025 (4 sessions)
    ('2025-11-03'::date),
    ('2025-11-04'::date),
    ('2025-11-05'::date),
    ('2025-11-06'::date)
) AS dates(date);
```

**Vérification :**
```sql
SELECT 
  COUNT(*) as total_sessions,
  SUM(max_participants) as total_capacity
FROM masterclass_sessions;
-- Résultat attendu : 12 sessions, 300 places
```

---

## 🔐 Variables d'Environnement Netlify

### Configuration requise :

1. Aller sur Netlify Dashboard → Site settings → Environment variables
2. Ajouter ces 3 variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://apqpsyugdmvrzaprugvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre_clé_anon]
SUPABASE_SERVICE_ROLE_KEY=[votre_clé_service_role]
```

**Où trouver les clés :**
- Supabase Dashboard → Settings → API
- `anon` key = Public key
- `service_role` key = Secret key (⚠️ Ne jamais exposer côté client)

---

## 📊 Vérifications Post-Déploiement

### ✅ Checklist

- [ ] **Migrations Supabase appliquées**
  - [ ] `date_of_birth` est nullable
  - [ ] 12 sessions créées (300 places total)
  
- [ ] **Variables Netlify configurées**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Build Netlify réussi**
  - [ ] Pas d'erreurs TypeScript
  - [ ] Pas d'erreurs ESLint
  - [ ] Déploiement terminé

- [ ] **Tests fonctionnels**
  - [ ] Page d'accueil accessible
  - [ ] Formulaire d'inscription fonctionne
  - [ ] Sélection de session affiche 12 dates
  - [ ] Logo animé visible
  - [ ] Dégradés affichés correctement

---

## 🎯 Flux Complet de l'Application

### 1. **Page d'Accueil** (`/`)
- Logo animé CCPEZON ⟷ STUDIA
- Bouton "S'inscrire maintenant"

### 2. **Inscription** (`/inscription`)
- Formulaire :
  - Nom complet (ex: Laura Ndong)
  - Email
  - Téléphone (+241)
  - Consentement
- Bouton : "Choisir la date de session"

### 3. **Sélection Session** (`/inscription/session/[id]`)
- 12 sessions affichées
- Horaire : 9h00 - 13h00
- 25 places par session
- Design avec dégradés
- Bouton : "Confirmer ma réservation"

### 4. **Test PRE** (`/test/pre?inscription_id=[id]`)
- 10 questions
- Score minimum : 50%
- Design avec dégradés
- Barre de progression animée

### 5. **Dashboard Étudiant** (`/student/dashboard`)
- Confirmation d'inscription
- Résultats test PRE
- Date de masterclass
- Téléchargement PDF
- Test POST (après masterclass)

### 6. **Dashboard Admin** (`/admin/dashboard`)
- Liste des étudiants
- Vue par session (`/admin/sessions`)
- Export CSV
- Gestion des questions

---

## 🎨 Fonctionnalités Visuelles

### Design Moderne
- ✅ Logo animé 3D (flip continu)
- ✅ Dégradés corail (primary) + accent
- ✅ Cartes avec ombres colorées
- ✅ Effets hover avec zoom
- ✅ Bordures arrondies (rounded-xl)
- ✅ Responsive mobile/desktop

### Composants Principaux
- `FlipLogo` - Animation logo
- `SessionSelector` - Sélection de date
- `QCMTest` - Questions avec dégradés
- `RegistrationForm` - Formulaire inscription

---

## 🚨 Problèmes Connus et Solutions

### Erreur : "date_of_birth violates not-null constraint"
**Solution :** Appliquer la migration 1 (ALTER TABLE profiles)

### Erreur : "600 places au lieu de 300"
**Solution :** Appliquer la migration 2 (12 sessions × 25 places)

### Erreur : "Clock is not defined"
**Solution :** Déjà corrigé dans le code (import ajouté)

### Erreur : TypeScript "any" ou "Property does not exist"
**Solution :** Déjà corrigé avec type assertions

---

## 📱 URLs Importantes

**Production :**
- Site : https://subscriptionstudia.netlify.app
- Admin : https://subscriptionstudia.netlify.app/admin/dashboard

**Supabase :**
- Dashboard : https://supabase.com/dashboard/project/apqpsyugdmvrzaprugvw
- SQL Editor : https://supabase.com/dashboard/project/apqpsyugdmvrzaprugvw/sql

**Netlify :**
- Dashboard : https://app.netlify.com
- Builds : https://app.netlify.com/sites/subscriptionstudia/deploys

---

## 📦 Structure des Données

### Sessions (12 dates)
```
Octobre 2025: 20, 21, 22, 23, 27, 28, 29, 30
Novembre 2025: 3, 4, 5, 6
Horaire fixe: 9h00 - 13h00
Capacité: 25 places/session = 300 places total
```

### Tests
```
PRE: 10 questions (avant masterclass)
POST: 10 questions (après masterclass)
Score minimum PRE: 50% pour validation
```

---

## ✅ Résumé

**Pour que l'application fonctionne :**
1. ✅ Appliquer les 2 migrations SQL dans Supabase
2. ✅ Configurer les 3 variables d'environnement Netlify
3. ✅ Vérifier que le build Netlify réussit
4. ✅ Tester l'inscription sur mobile

**Tout le code est déjà poussé sur GitHub !**
**Il ne reste que la configuration Supabase à faire.**

---

**Date de création : 11 octobre 2025**
**Dernière mise à jour : Commit 219963f**
