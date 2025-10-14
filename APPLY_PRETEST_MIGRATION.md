# Guide d'Application - Migration Pré-test Obligatoire

## 🎯 Objectif
Appliquer la migration qui rend le pré-test **obligatoire** avant toute réservation de session.

---

## 📝 Prérequis

- Accès à la console Supabase (Dashboard)
- OU Supabase CLI installé localement
- Droits d'administration sur le projet

---

## 🚀 Méthode 1 : Via Supabase Dashboard (Recommandé)

### Étape 1 : Accéder au SQL Editor

1. Connectez-vous à [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **+ New Query**

### Étape 2 : Exécuter la migration

1. Copiez le contenu du fichier `supabase/migrations/010_enforce_pretest_before_booking.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **Run** (ou `Ctrl + Enter`)

### Étape 3 : Vérifier l'application

Exécutez cette requête pour vérifier que le trigger a été créé :

```sql
-- Vérifier l'existence du trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'ensure_pretest_before_booking';
```

**Résultat attendu :**
```
trigger_name                    | event_manipulation | event_object_table | action_timing
ensure_pretest_before_booking   | INSERT            | session_bookings   | BEFORE
```

### Étape 4 : Vérifier la fonction

```sql
-- Vérifier l'existence de la fonction
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'check_pretest_before_booking';
```

**Résultat attendu :**
```
routine_name                   | routine_type
check_pretest_before_booking   | FUNCTION
```

---

## 🚀 Méthode 2 : Via Supabase CLI

### Étape 1 : Vérifier les migrations en attente

```bash
cd /path/to/windsurf-project
npx supabase db diff
```

### Étape 2 : Appliquer la migration

```bash
npx supabase db push
```

OU

```bash
npx supabase migration up
```

### Étape 3 : Vérifier l'état

```bash
npx supabase db diff
# Devrait afficher : "No schema changes detected"
```

---

## ✅ Tests de Validation

### Test 1 : Tentative de réservation sans pré-test (doit échouer)

```sql
-- Créer une inscription test
INSERT INTO profiles (id, full_name, whatsapp_number, gender)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', '+241000000', 'Homme');

INSERT INTO inscriptions (id, profile_id, masterclass_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM masterclasses LIMIT 1)
);

-- Essayer de réserver une session SANS avoir passé le pré-test
-- ❌ Cette requête DOIT échouer
INSERT INTO session_bookings (inscription_id, session_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM sessions LIMIT 1)
);
-- Erreur attendue : "Le pré-test doit être effectué avant de réserver une session"
```

### Test 2 : Réservation avec pré-test (doit réussir)

```sql
-- Créer un pré-test pour l'inscription
INSERT INTO tests (inscription_id, type, score, max_score, responses)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'PRE',
  7,
  10,
  '[]'::jsonb
);

-- Maintenant la réservation DOIT fonctionner
-- ✅ Cette requête DOIT réussir
INSERT INTO session_bookings (inscription_id, session_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  (SELECT id FROM sessions LIMIT 1)
);
-- Succès attendu
```

### Test 3 : Nettoyage des données de test

```sql
-- Supprimer les données de test
DELETE FROM session_bookings WHERE inscription_id = '00000000-0000-0000-0000-000000000002';
DELETE FROM tests WHERE inscription_id = '00000000-0000-0000-0000-000000000002';
DELETE FROM inscriptions WHERE id = '00000000-0000-0000-0000-000000000002';
DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';
```

---

## 🧪 Test du Flux Complet (Frontend)

### Test manuel dans l'application :

1. **Ouvrir l'application** : `http://localhost:3000` (ou votre URL de production)

2. **Inscription** :
   - Remplir le formulaire d'inscription
   - Cliquer sur "Passer le pré-test"
   - ✅ **Vérifier** : Redirection vers `/test/pre`

3. **Pré-test** :
   - Répondre aux 10 questions
   - Soumettre le test
   - ✅ **Vérifier** : Redirection vers `/inscription/session/[id]`

4. **Sélection de session** :
   - ✅ **Vérifier** : Message "✅ Bravo ! Pré-test Réussi"
   - Sélectionner une date
   - Réserver la session
   - ✅ **Vérifier** : Réservation réussie

5. **Test de contournement** :
   - Essayer d'accéder directement à `/inscription/session/[id]` avec un nouvel inscription_id (sans pré-test)
   - ✅ **Vérifier** : Redirection automatique vers `/test/pre`

---

## 🐛 Dépannage

### Problème : Le trigger ne se déclenche pas

**Solution :**
```sql
-- Vérifier que le trigger est bien activé
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'session_bookings';

-- Recréer le trigger si nécessaire
DROP TRIGGER IF EXISTS ensure_pretest_before_booking ON session_bookings;
CREATE TRIGGER ensure_pretest_before_booking
  BEFORE INSERT ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_pretest_before_booking();
```

### Problème : Erreur lors de l'exécution de la migration

**Solution :**
1. Vérifier que la table `session_bookings` existe
2. Vérifier les permissions de votre utilisateur Supabase
3. Vérifier qu'il n'y a pas de conflits avec des triggers existants

```sql
-- Lister tous les triggers sur session_bookings
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'session_bookings';
```

### Problème : Les anciennes réservations sans pré-test causent des problèmes

**Solution :**
```sql
-- Identifier les réservations problématiques
SELECT sb.id, sb.inscription_id
FROM session_bookings sb
WHERE NOT EXISTS (
  SELECT 1 FROM tests t 
  WHERE t.inscription_id = sb.inscription_id 
  AND t.type = 'PRE'
);

-- Option 1 : Les supprimer (ATTENTION : perte de données)
DELETE FROM session_bookings 
WHERE id IN (
  SELECT sb.id
  FROM session_bookings sb
  WHERE NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = sb.inscription_id 
    AND t.type = 'PRE'
  )
);

-- Option 2 : Créer des pré-tests fictifs (pour données historiques)
-- À utiliser avec précaution
```

---

## 📊 Vérification Post-Déploiement

### Checklist de validation :

- [ ] Migration SQL appliquée sans erreur
- [ ] Trigger `ensure_pretest_before_booking` créé
- [ ] Fonction `check_pretest_before_booking()` créée
- [ ] Test 1 (sans pré-test) échoue comme prévu
- [ ] Test 2 (avec pré-test) réussit
- [ ] Flux d'inscription frontend fonctionne correctement
- [ ] Redirection après pré-test fonctionne
- [ ] Protection de la page de sélection de session active
- [ ] API de réservation refuse les requêtes sans pré-test

---

## 📞 Support

En cas de problème lors de l'application de cette migration :

1. Vérifier les logs Supabase dans le Dashboard
2. Consulter le fichier `PRETEST_OBLIGATOIRE.md` pour plus de détails
3. Exécuter les requêtes de dépannage ci-dessus
4. En dernier recours, faire un rollback (voir section Rollback dans `PRETEST_OBLIGATOIRE.md`)

---

## ✅ Confirmation de Succès

Si tous les tests passent, votre migration est appliquée avec succès ! 🎉

Le système force désormais tous les étudiants à passer le pré-test avant de pouvoir réserver une session de masterclass.
