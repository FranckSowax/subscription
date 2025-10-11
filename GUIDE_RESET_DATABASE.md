# 🔄 Guide : Réinitialiser la Base de Données

**⚠️ ATTENTION : Cette opération est IRRÉVERSIBLE !**

---

## 📋 Étapes pour Supprimer Toutes les Données

### **Étape 1 : Backup (Fortement Recommandé)**

Avant de supprimer toutes les données, créez une sauvegarde :

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **Database** > **Backups**
3. Créez un backup manuel (ou notez l'heure pour restaurer si besoin)

---

### **Étape 2 : Supprimer les Données des Tables**

1. Ouvrez **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez et collez le contenu de `RESET_ALL_DATA.sql`
4. Cliquez sur **Run** (Exécuter)

**OU**

Exécutez les commandes une par une dans l'ordre suivant :

```sql
-- 1. Réservations de sessions
DELETE FROM session_bookings;

-- 2. Tests
DELETE FROM tests;

-- 3. Inscriptions
DELETE FROM inscriptions;

-- 4. Profils
DELETE FROM profiles;

-- 5. Sessions
DELETE FROM sessions;

-- 6. Masterclasses
DELETE FROM masterclasses;
```

---

### **Étape 3 : Supprimer les Utilisateurs Auth**

**Option A : Via le Dashboard (Recommandé)**

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **Authentication** > **Users**
3. **Sélectionnez tous les utilisateurs** (cochez la case en haut)
4. Cliquez sur **Delete users**
5. Confirmez la suppression

**Option B : Via SQL (Avancé)**

```sql
-- Cette requête nécessite des privilèges admin
-- Exécutez-la dans le SQL Editor avec précaution
SELECT auth.uid FROM auth.users;
-- Notez tous les UIDs, puis supprimez manuellement via le dashboard
```

---

### **Étape 4 : Vérification**

Exécutez cette requête pour vérifier que tout est vide :

```sql
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
```

**Résultat attendu :**
```
table_name          | count
--------------------+-------
session_bookings    | 0
tests               | 0
inscriptions        | 0
profiles            | 0
sessions            | 0
masterclasses       | 0
questions           | 0
```

---

### **Étape 5 : Recréer les Données de Base (Optionnel)**

Si vous voulez recréer une masterclass et des sessions :

```sql
-- Créer une masterclass
INSERT INTO masterclasses (title, description, max_students, start_date, end_date)
VALUES (
  'Introduction à l''IA - 2025',
  'Masterclass d''introduction à l''Intelligence Artificielle',
  300,
  '2025-01-15',
  '2025-03-30'
)
RETURNING id;

-- Notez l'ID retourné, puis créez 12 sessions
-- Remplacez <masterclass_id> par l'ID obtenu ci-dessus

INSERT INTO sessions (masterclass_id, session_date, max_participants, current_participants)
SELECT 
  '<masterclass_id>'::uuid,
  date::date,
  25,
  0
FROM generate_series(
  '2025-01-15'::date,
  '2025-03-30'::date,
  '1 week'::interval
) AS date
LIMIT 12;
```

---

## 📊 Ordre de Suppression (Important)

L'ordre de suppression respecte les contraintes de clés étrangères :

```
1. session_bookings (dépend de sessions + inscriptions)
   ↓
2. tests (dépend de inscriptions)
   ↓
3. inscriptions (dépend de profiles + masterclasses)
   ↓
4. profiles (dépend de auth.users)
   ↓
5. sessions (dépend de masterclasses)
   ↓
6. masterclasses (table parente)
   ↓
7. auth.users (via Dashboard Authentication)
```

---

## ⚠️ Points Importants

1. **Backup d'abord** : Créez toujours un backup avant la suppression
2. **Ordre strict** : Respectez l'ordre de suppression
3. **Auth séparé** : Les utilisateurs auth doivent être supprimés via le Dashboard
4. **Vérification** : Vérifiez que toutes les tables sont vides
5. **Questions** : Ne supprimez les questions QCM que si nécessaire

---

## 🔐 Permissions Requises

- **Supabase Dashboard Access** : Accès administrateur
- **SQL Editor** : Permissions d'écriture
- **Authentication** : Permissions de gestion des utilisateurs

---

## 📝 Checklist de Sécurité

- [ ] Backup créé
- [ ] Équipe informée
- [ ] Environnement vérifié (pas de production)
- [ ] Script RESET_ALL_DATA.sql prêt
- [ ] Dashboard Supabase ouvert
- [ ] Prêt à supprimer les utilisateurs auth

---

## 🚀 Après la Réinitialisation

Une fois toutes les données supprimées :

1. ✅ Vérifiez que toutes les tables sont vides
2. ✅ Vérifiez qu'il n'y a plus d'utilisateurs dans Authentication
3. ✅ Recréez les données de base si nécessaire (masterclass + sessions)
4. ✅ Testez une nouvelle inscription pour vérifier que tout fonctionne
5. ✅ Vérifiez les logs pour détecter d'éventuelles erreurs

---

## 🆘 En Cas de Problème

**Erreur de contrainte de clé étrangère :**
- Vérifiez l'ordre de suppression
- Assurez-vous de supprimer les tables enfants avant les parents

**Impossible de supprimer certaines données :**
- Vérifiez les permissions
- Utilisez le Dashboard pour supprimer manuellement

**Besoin de restaurer :**
- Allez dans Database > Backups
- Restaurez le backup créé à l'étape 1

---

**Base de données prête pour un nouveau départ ! 🎉**
