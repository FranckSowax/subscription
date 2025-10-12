# 🔄 Scripts de Reset des Données

## ⚠️ ATTENTION

Ces scripts **suppriment des données de manière irréversible**.

- ❌ **NE PAS utiliser en PRODUCTION** sans backup complet
- ✅ **Utiliser uniquement en développement/test**
- 💾 **Toujours faire un backup avant**

---

## 📋 Scripts Disponibles

### **1. RESET_SIMPLE.sql** (Recommandé pour les tests)

**Supprime TOUT :**
- ✅ Tous les tests
- ✅ Toutes les réservations de sessions
- ✅ Toutes les inscriptions
- ✅ Tous les profils
- ✅ Tous les utilisateurs
- ✅ Réinitialise les compteurs de sessions

**Utilisation :**
```sql
-- Copiez et collez dans Supabase SQL Editor
-- Puis cliquez sur "Run"
```

**Résultat :**
- Base de données comme neuve
- Prête pour de nouveaux tests
- Pas de données anciennes

---

### **2. 999_RESET_ALL_DATA.sql** (Version avancée)

**Supprime TOUT sauf les admins :**
- ✅ Même chose que RESET_SIMPLE
- ✅ Mais **garde les comptes admin**

**Configuration :**
```sql
-- Ligne 51 : Modifiez les emails admin à conserver
DELETE FROM auth.users 
WHERE email NOT IN ('admin@example.com', 'admin@studiaai.com');
```

**Pour supprimer TOUS les utilisateurs (même admins) :**
```sql
-- Décommentez la ligne 55
DELETE FROM auth.users;
```

---

### **3. RESET_RECENT.sql** (Nettoyage partiel)

**Supprime uniquement les inscriptions récentes :**
- ✅ Inscriptions des **dernières 24 heures**
- ✅ Tests, réservations et profils associés
- ✅ Conserve les anciennes données
- ✅ Recalcule les compteurs

**Modification de la période :**
```sql
-- Ligne 10 : Changez "24 hours" par "1 hour", "7 days", etc.
WHERE registration_date >= NOW() - INTERVAL '24 hours'
```

---

## 🚀 Comment Utiliser

### **Méthode 1 : Supabase Dashboard** (Recommandé)

1. **Allez sur** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionnez votre projet**
3. **Cliquez sur** `SQL Editor` (icône `</>`)
4. **Cliquez sur** `+ New Query`
5. **Copiez-collez** le contenu du script choisi
6. **Cliquez sur** `Run` ▶️
7. **Vérifiez** les résultats dans l'onglet "Results"

---

### **Méthode 2 : CLI Supabase** (Avancé)

```bash
# Si vous utilisez Supabase CLI
supabase db reset
```

---

## 📊 Vérification Après Reset

Après exécution, vous devriez voir :

```sql
tests | inscriptions | profiles | users
------|--------------|----------|------
  0   |      0       |    0     |   0
```

Ou si vous avez gardé des admins :

```sql
tests | inscriptions | profiles | users
------|--------------|----------|------
  0   |      0       |    0     |   1
```

---

## 🔍 Requêtes de Vérification Utiles

### **Compter les enregistrements**
```sql
SELECT 
  (SELECT COUNT(*) FROM tests) as tests,
  (SELECT COUNT(*) FROM inscriptions) as inscriptions,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM auth.users) as users,
  (SELECT COUNT(*) FROM session_bookings) as bookings;
```

### **Voir les sessions et leurs participants**
```sql
SELECT 
  id,
  session_date,
  current_participants,
  max_participants
FROM sessions
ORDER BY session_date;
```

### **Lister les utilisateurs restants**
```sql
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

### **Voir les inscriptions récentes**
```sql
SELECT 
  i.id,
  p.full_name,
  i.registration_date,
  i.validated
FROM inscriptions i
JOIN profiles p ON p.id = i.profile_id
WHERE i.registration_date >= NOW() - INTERVAL '24 hours'
ORDER BY i.registration_date DESC;
```

---

## 💾 Faire un Backup Avant Reset

### **Option 1 : Export via Dashboard**
1. Allez dans `Database` → `Backups`
2. Cliquez sur `Create backup`
3. Attendez la confirmation

### **Option 2 : Export SQL**
```bash
# Via CLI (si configuré)
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Option 3 : Export manuel**
```sql
-- Copiez les données importantes
COPY (SELECT * FROM inscriptions) TO '/tmp/inscriptions_backup.csv' CSV HEADER;
COPY (SELECT * FROM profiles) TO '/tmp/profiles_backup.csv' CSV HEADER;
COPY (SELECT * FROM tests) TO '/tmp/tests_backup.csv' CSV HEADER;
```

---

## ⚙️ Reset Sélectif

### **Supprimer un utilisateur spécifique**
```sql
-- Remplacez l'email
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### **Supprimer les inscriptions d'une session**
```sql
-- Remplacez la date
DELETE FROM inscriptions 
WHERE masterclass_id IN (
  SELECT id FROM sessions WHERE session_date = '2025-01-15'
);
```

### **Supprimer les tests échoués**
```sql
DELETE FROM tests 
WHERE score < (max_score * 0.5);
```

---

## 🔐 Sécurité

### **Permissions Requises**
- Accès au SQL Editor de Supabase
- Rôle `service_role` ou `postgres`

### **Précautions**
1. ✅ Toujours tester d'abord sur une copie
2. ✅ Faire un backup avant
3. ✅ Vérifier les résultats après
4. ✅ Informer l'équipe avant un reset
5. ❌ Ne JAMAIS exécuter en production sans plan

---

## 📞 En Cas de Problème

### **J'ai supprimé par erreur !**
1. **Restaurer** depuis le dernier backup
2. Aller dans `Database` → `Backups`
3. Sélectionner le backup d'avant le reset
4. Cliquer sur `Restore`

### **Les compteurs sont incorrects**
```sql
-- Recalculer les compteurs de sessions
UPDATE sessions s
SET current_participants = (
  SELECT COUNT(DISTINCT sb.inscription_id)
  FROM session_bookings sb
  WHERE sb.session_id = s.id
);
```

### **Il reste des données orphelines**
```sql
-- Supprimer les profils sans utilisateur
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Supprimer les tests sans inscription
DELETE FROM tests 
WHERE inscription_id NOT IN (SELECT id FROM inscriptions);
```

---

## ✅ Checklist Avant Reset

- [ ] Backup créé et vérifié
- [ ] Environnement de test/développement confirmé
- [ ] Script approprié sélectionné
- [ ] Équipe informée (si applicable)
- [ ] Plan de restauration prêt
- [ ] Requêtes de vérification préparées

---

## 📝 Historique des Resets

Gardez une trace :

```
Date       | Script utilisé    | Raison           | Données supprimées
-----------|-------------------|------------------|-------------------
2025-10-12 | RESET_SIMPLE      | Test formulaire  | 5 inscriptions
2025-10-13 | RESET_RECENT      | Nettoyage tests  | 2 inscriptions
```

---

**⚠️ Rappel : Ces opérations sont IRRÉVERSIBLES sans backup !**
