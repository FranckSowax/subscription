# 📊 Mise à Jour : Champ Genre et Statistiques

**Date :** 11 octobre 2025  
**Commit :** 05f25df

---

## ✅ Fonctionnalités Ajoutées

### 1. **Champ Genre dans l'Inscription**

**Formulaire mis à jour :**
- ✅ Nouveau champ "Genre" (obligatoire)
- ✅ Options : Homme / Femme
- ✅ Dropdown stylisé
- ✅ Validation avec Zod

**Position :**
- Après le numéro de téléphone
- Avant la case de consentement

---

### 2. **Page de Statistiques Admin**

**URL :** `/admin/stats`

**Statistiques affichées :**
- ✅ Total étudiants
- ✅ Nombre d'hommes (+ pourcentage)
- ✅ Nombre de femmes (+ pourcentage)
- ✅ Inscriptions validées
- ✅ Inscriptions en attente
- ✅ Tests PRE passés (+ score moyen)
- ✅ Tests POST passés (+ score moyen)

**Fonctionnalités :**
- ✅ Cartes statistiques avec dégradés de couleurs
- ✅ Graphiques visuels
- ✅ Tableau des étudiants avec colonne genre
- ✅ **Filtre par genre** (Tous / Hommes / Femmes)
- ✅ Export CSV avec filtre actif

---

## 🗄️ Migration SQL Requise

### Migration 007 : Ajouter le champ genre

**Fichier :** `supabase/migrations/007_add_gender_field.sql`

```sql
-- Add gender column
ALTER TABLE profiles 
ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('Homme', 'Femme'));

-- Add comment
COMMENT ON COLUMN profiles.gender IS 'Genre de l''utilisateur: Homme ou Femme';

-- Create index for better filtering performance
CREATE INDEX idx_profiles_gender ON profiles(gender);
```

**⚠️ À APPLIQUER DANS SUPABASE SQL EDITOR**

---

## 📝 Fichiers Créés/Modifiés

### Nouveaux Fichiers

1. **`supabase/migrations/007_add_gender_field.sql`**
   - Migration SQL pour le champ genre

2. **`app/admin/stats/page.tsx`**
   - Page de statistiques complète
   - Filtre par genre
   - Export CSV

3. **`app/api/admin/stats/route.ts`**
   - API pour récupérer les statistiques
   - Calculs automatiques

### Fichiers Modifiés

1. **`lib/validations/registration.ts`**
   - Ajout validation genre

2. **`components/forms/RegistrationForm.tsx`**
   - Ajout champ genre
   - Dropdown stylisé

3. **`app/api/auth/register/route.ts`**
   - Enregistrement du genre

4. **`app/admin/dashboard/page.tsx`**
   - Lien vers page statistiques
   - Description mise à jour

---

## 🎨 Design Statistiques

### Cartes Statistiques

**Total Étudiants :**
- Dégradé primary/accent
- Icône Users

**Hommes :**
- Dégradé bleu
- Pourcentage affiché

**Femmes :**
- Dégradé rose
- Pourcentage affiché

**Validés :**
- Dégradé vert
- Nombre en attente affiché

---

## 🔍 Filtre par Genre

**Dropdown de filtre :**
```tsx
<select value={genderFilter} onChange={...}>
  <option value="all">Tous</option>
  <option value="Homme">Hommes</option>
  <option value="Femme">Femmes</option>
</select>
```

**Fonctionnement :**
- Filtre temps réel
- Export CSV respecte le filtre
- Badge coloré par genre (bleu/rose)

---

## 📊 Tableau Étudiants

**Colonnes affichées :**
1. Nom
2. **Genre** (avec badge coloré)
3. Téléphone
4. Score PRE
5. Statut (Validé/En attente)

**Badge genre :**
- Homme → Badge bleu (default)
- Femme → Badge rose (secondary)

---

## 📥 Export CSV

**Nom du fichier :**
```
statistiques_[filtre]_[date].csv
```

**Exemples :**
- `statistiques_all_2025-10-11.csv`
- `statistiques_Homme_2025-10-11.csv`
- `statistiques_Femme_2025-10-11.csv`

**Colonnes CSV :**
- Nom
- Téléphone
- Genre
- Date inscription
- Score PRE
- Validé

---

## 🎯 Flux Utilisateur

### Inscription

```
1. Formulaire d'inscription
   ├─> Nom
   ├─> Email
   ├─> Téléphone
   ├─> Genre ⭐ NOUVEAU
   └─> Consentement

2. Enregistrement
   └─> Genre sauvegardé dans Supabase
```

### Admin - Statistiques

```
1. Dashboard Admin
   └─> Clic sur "Statistiques"

2. Page Statistiques
   ├─> Vue des statistiques générales
   ├─> Statistiques par genre
   ├─> Filtre par genre
   └─> Export CSV
```

---

## 📦 Données Statistiques

### Calculs Automatiques

**Genre :**
```javascript
maleCount = profiles.filter(p => p.gender === 'Homme').length
femaleCount = profiles.filter(p => p.gender === 'Femme').length
malePercentage = Math.round((maleCount / totalStudents) * 100)
femalePercentage = Math.round((femaleCount / totalStudents) * 100)
```

**Tests :**
```javascript
avgPreScore = preTests.reduce((sum, t) => sum + t.score, 0) / preTests.length
avgPostScore = postTests.reduce((sum, t) => sum + t.score, 0) / postTests.length
```

---

## ⚙️ Configuration Requise

### 1. Migration SQL (URGENT)

Appliquer dans Supabase SQL Editor :
```sql
ALTER TABLE profiles ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('Homme', 'Femme'));
COMMENT ON COLUMN profiles.gender IS 'Genre de l''utilisateur: Homme ou Femme';
CREATE INDEX idx_profiles_gender ON profiles(gender);
```

### 2. Redéploiement

- ✅ Code déjà poussé sur GitHub
- ⏳ Attendre le déploiement Netlify
- ⏳ Appliquer la migration SQL

---

## ✅ Fonctionnalités Complètes

**Formulaire d'inscription :**
- ✅ Champ genre requis
- ✅ Validation Zod
- ✅ Enregistrement en BDD

**Page statistiques :**
- ✅ Statistiques globales
- ✅ Statistiques par genre
- ✅ Filtre dynamique
- ✅ Export CSV filtré
- ✅ Design moderne avec dégradés

**Dashboard admin :**
- ✅ Lien vers statistiques
- ✅ 4 modules : Étudiants, Sessions, Questions, Statistiques

---

## 📱 Pages Admin

```
/admin/dashboard
├─> /admin/dashboard (Liste étudiants)
├─> /admin/sessions (Inscrits par session)
├─> /admin/questions (Banque questions)
└─> /admin/stats ⭐ NOUVEAU (Statistiques + genre)
```

---

## 🎨 Couleurs par Genre

**Hommes :**
- Badge : Bleu (`default`)
- Carte stats : `from-blue-50 to-blue-100`
- Icône : `text-blue-600`

**Femmes :**
- Badge : Rose (`secondary`)
- Carte stats : `from-pink-50 to-pink-100`
- Icône : `text-pink-600`

---

## 🚀 Prochaines Étapes

1. **Appliquer la migration SQL** dans Supabase
2. **Tester l'inscription** avec le champ genre
3. **Vérifier les statistiques** dans `/admin/stats`
4. **Tester les filtres** par genre
5. **Tester l'export CSV** avec différents filtres

---

**Projet mis à jour avec succès ! 🎉**
