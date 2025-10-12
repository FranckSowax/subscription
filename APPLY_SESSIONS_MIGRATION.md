# 🔧 Appliquer la Migration des Sessions

## ⚠️ Problème Détecté

La table `sessions` n'existe pas dans votre base de données Supabase !

**Erreur :** `ERROR: relation "sessions" does not exist`

---

## ✅ Solution : Créer les Tables Manquantes

### **Étape 1 : Ouvrir Supabase SQL Editor**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu gauche

---

### **Étape 2 : Vérifier les Tables Existantes**

Exécutez d'abord cette requête pour voir quelles tables existent :

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Si vous voyez :**
- ✅ `masterclasses`
- ✅ `inscriptions`
- ✅ `profiles`
- ✅ `tests`
- ❌ PAS de `sessions`
- ❌ PAS de `session_bookings`

→ **Continuez avec l'étape 3**

---

### **Étape 3 : Appliquer la Migration**

Copiez et collez **TOUT** le contenu de ce fichier dans le SQL Editor :

📁 **Fichier :** `supabase/migrations/008_create_sessions_table.sql`

Puis cliquez sur **Run** (Exécuter)

---

### **Étape 4 : Vérifier la Création**

Après l'exécution, vérifiez que tout est créé :

```sql
-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sessions', 'session_bookings')
ORDER BY table_name;
```

**Résultat attendu :**
```
table_name
-----------------
session_bookings
sessions
```

```sql
-- Vérifier les 12 sessions créées
SELECT 
  id,
  session_date,
  max_participants,
  current_participants
FROM sessions
ORDER BY session_date;
```

**Résultat attendu :** 12 lignes (une par semaine, Oct-Nov 2025)

---

## 🎯 Ce Qui Sera Créé

### **1. Table `sessions`**
- `id` : UUID (clé primaire)
- `masterclass_id` : UUID (référence à masterclasses)
- `session_date` : DATE
- `max_participants` : INTEGER (25 par défaut)
- `current_participants` : INTEGER (0 par défaut)
- `created_at`, `updated_at`

### **2. Table `session_bookings`**
- `id` : UUID (clé primaire)
- `inscription_id` : UUID (référence à inscriptions)
- `session_id` : UUID (référence à sessions)
- `created_at`
- **Contrainte UNIQUE** : Une inscription = une seule session

### **3. 12 Sessions Pré-créées**
- Dates : du 15 octobre au 30 novembre 2025
- Fréquence : Une session par semaine
- Capacité : 25 participants par session
- Total : 300 places (12 × 25)

---

## 🔒 Sécurité (RLS)

**Politiques créées :**
- ✅ Lecture publique des sessions (pour réservation)
- ✅ Lecture des réservations par propriétaire uniquement
- ✅ Gestion complète pour le service role

---

## ⚠️ Si Vous Avez Déjà des Tables avec d'Autres Noms

**Vérifiez si vous avez une table similaire :**

```sql
-- Chercher des tables avec "session" dans le nom
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%session%';
```

**Si vous trouvez une table comme `masterclass_sessions` :**

Option 1 : Renommer la table
```sql
ALTER TABLE masterclass_sessions RENAME TO sessions;
```

Option 2 : Utiliser la table existante et ajuster le code

---

## ✅ Après la Migration

Une fois la migration appliquée :

1. **Testez l'API des sessions**
   ```bash
   curl https://subscriptionstudia.netlify.app/api/sessions
   ```

2. **Faites une nouvelle inscription** pour tester la réservation

3. **Vérifiez le dashboard étudiant** → La session devrait s'afficher !

---

## 🆘 En Cas de Problème

**Erreur "already exists" :**
- C'est normal si la table existe déjà
- La migration utilise `IF NOT EXISTS`

**Erreur de permissions :**
- Vous devez être connecté comme propriétaire du projet

**Les sessions ne s'affichent pas :**
- Vérifiez avec la requête de vérification
- Relancez le script de population des sessions

---

**Une fois la migration appliquée, le site fonctionnera correctement ! 🎉**
