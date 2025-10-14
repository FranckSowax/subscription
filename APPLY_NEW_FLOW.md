# Guide Rapide - Application du Nouveau Flux

## 🎯 Résumé

Modification du flux d'inscription pour permettre le **choix de session AVANT le pré-test**, tout en maintenant l'obligation du test. La réservation n'est finalisée qu'après la réussite du test.

---

## 📋 Checklist de Déploiement

### ✅ Étape 1 : Appliquer la Migration SQL

**Via Supabase Dashboard :**
1. Connectez-vous à [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Ouvrez **SQL Editor**
4. Créez une **New Query**
5. Copiez le contenu de `supabase/migrations/012_add_selected_session_to_inscriptions.sql`
6. Cliquez sur **Run**

**Via Supabase CLI :**
```bash
cd /path/to/windsurf-project
npx supabase migration up
```

### ✅ Étape 2 : Vérifier la Migration

```sql
-- Vérifier la colonne selected_session_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inscriptions' 
AND column_name = 'selected_session_id';

-- Résultat attendu :
-- column_name           | data_type | is_nullable
-- selected_session_id   | uuid      | YES
```

```sql
-- Vérifier le trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_create_booking_after_pretest';

-- Résultat attendu :
-- trigger_name                           | event_manipulation | event_object_table
-- trigger_auto_create_booking_after_pretest | INSERT          | tests
```

### ✅ Étape 3 : Tester le Nouveau Flux

**Test Complet :**

1. **Inscription** :
   - Allez sur `/inscription`
   - Remplissez le formulaire
   - Cliquez sur "Choisir ma date de session"
   - ✅ Redirection vers `/inscription/session/[id]`

2. **Sélection de Session** :
   - Choisissez une date disponible
   - Cliquez sur "Réserver cette session"
   - ✅ Message : "Session sélectionnée avec succès"
   - ✅ Redirection vers `/test/pre?inscription_id=[id]`

3. **Vérification en Base** :
   ```sql
   -- Vérifier que selected_session_id est rempli
   SELECT id, selected_session_id, validated
   FROM inscriptions
   WHERE id = '[votre_inscription_id]';
   
   -- Résultat attendu :
   -- selected_session_id : [UUID de la session]
   -- validated : false
   
   -- Vérifier qu'AUCUN booking n'existe encore
   SELECT * FROM session_bookings
   WHERE inscription_id = '[votre_inscription_id]';
   
   -- Résultat attendu : 0 lignes
   ```

4. **Pré-test** :
   - Répondez aux 10 questions
   - Soumettez le test
   - ✅ Redirection vers `/test/confirmation`

5. **Vérification Finale** :
   ```sql
   -- Vérifier que le booking a été créé automatiquement
   SELECT * FROM session_bookings
   WHERE inscription_id = '[votre_inscription_id]';
   
   -- Résultat attendu : 1 ligne
   
   -- Vérifier que selected_session_id est effacé
   SELECT id, selected_session_id, validated
   FROM inscriptions
   WHERE id = '[votre_inscription_id]';
   
   -- Résultat attendu :
   -- selected_session_id : NULL
   -- validated : true
   
   -- Vérifier le compteur de participants
   SELECT id, session_date, current_participants
   FROM sessions
   WHERE id = '[session_id_choisie]';
   
   -- Résultat attendu : current_participants a augmenté de 1
   ```

---

## 🧪 Tests de Cas Limites

### Test 1 : Abandon Après Sélection
```
1. Inscription créée
2. Session sélectionnée
3. ❌ Ne PAS passer le test
4. Fermer le navigateur

Résultat attendu :
✅ selected_session_id rempli dans inscriptions
✅ Aucun booking créé
✅ validated = false
✅ Compteur de participants inchangé
```

### Test 2 : Session Complète
```
1. Remplir manuellement une session (current_participants = max_participants)
2. Essayer de sélectionner cette session

Résultat attendu :
❌ Erreur : "Cette session est complète"
✅ selected_session_id reste NULL
```

### Test 3 : Double Sélection
```
1. Sélectionner une session
2. Essayer de sélectionner une autre session SANS passer le test

Résultat attendu :
❌ Erreur : "Vous avez déjà sélectionné une session"
✅ selected_session_id = première session choisie
```

---

## 🔍 Débogage

### Problème : Le booking n'est pas créé après le test

**Diagnostic :**
```sql
-- Vérifier que le trigger existe
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_create_booking_after_pretest';

-- Vérifier que la fonction existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'auto_create_booking_after_pretest';

-- Vérifier les logs (si disponibles)
SELECT * FROM tests 
WHERE inscription_id = '[id]' 
ORDER BY taken_at DESC;
```

**Solutions :**
1. Recréer le trigger :
   ```sql
   DROP TRIGGER IF EXISTS trigger_auto_create_booking_after_pretest ON tests;
   CREATE TRIGGER trigger_auto_create_booking_after_pretest
     AFTER INSERT ON tests
     FOR EACH ROW
     EXECUTE FUNCTION auto_create_booking_after_pretest();
   ```

2. Vérifier que `selected_session_id` était bien rempli avant le test

### Problème : selected_session_id n'est pas stocké

**Diagnostic :**
```sql
-- Vérifier la colonne
SELECT column_name FROM information_schema.columns
WHERE table_name = 'inscriptions' AND column_name = 'selected_session_id';
```

**Solution :**
Réappliquer la migration 012

### Problème : Le trigger `ensure_pretest_before_booking` bloque

**Explication :**  
C'est normal ! Ce trigger empêche la création manuelle de bookings sans test.

**Solution :**  
Ne PAS désactiver ce trigger. Il protège l'intégrité des données.  
Le trigger `auto_create_booking_after_pretest` crée le booking de manière sûre.

---

## 📊 Monitoring

### Requête de Suivi

```sql
-- Inscriptions avec session sélectionnée mais sans test
SELECT 
  i.id,
  i.registration_date,
  i.selected_session_id,
  s.session_date,
  EXTRACT(EPOCH FROM (NOW() - i.registration_date))/3600 as heures_depuis_inscription
FROM inscriptions i
LEFT JOIN sessions s ON i.selected_session_id = s.id
WHERE i.selected_session_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
  )
ORDER BY i.registration_date DESC;
```

**Utilisation :**
- Identifier les étudiants qui ont choisi une session mais n'ont pas passé le test
- Optionnel : Envoyer des rappels après 24h
- Optionnel : Nettoyer les sélections après 7 jours

---

## 🎓 Formation des Utilisateurs

### Message pour les Tuteurs

> **Nouveau flux d'inscription :**
> 
> Les étudiants choisissent maintenant leur date de masterclass AVANT de passer le pré-test.
> 
> Avantages :
> - Meilleure expérience utilisateur
> - Engagement accru (savoir sa date motive à passer le test)
> - Protection maintenue : pas de réservation sans test
> 
> Points d'attention :
> - Si un étudiant ne passe pas le test, sa "réservation" n'est jamais confirmée
> - Le système libère automatiquement les places non confirmées

---

## ✅ Validation Finale

Après déploiement, confirmer :

- [ ] Migration SQL appliquée sans erreur
- [ ] Colonne `selected_session_id` créée
- [ ] Trigger `trigger_auto_create_booking_after_pretest` actif
- [ ] Trigger `ensure_pretest_before_booking` toujours actif
- [ ] Flux complet testé (inscription → session → test → booking)
- [ ] Cas limite testé (abandon après sélection)
- [ ] Interface utilisateur mise à jour
- [ ] Messages d'information cohérents
- [ ] Documentation mise à jour

---

## 🚨 En Cas de Problème

1. **Vérifier les logs Supabase** dans le Dashboard
2. **Consulter `NOUVEAU_FLUX_INSCRIPTION.md`** pour les détails techniques
3. **Tester en environnement de dev** avant de modifier la production
4. **Rollback disponible** : voir section Rollback dans `NOUVEAU_FLUX_INSCRIPTION.md`

---

## ✨ Succès !

Si tous les tests passent, votre nouveau flux est opérationnel ! 🎉

Les étudiants peuvent maintenant choisir leur date préférée avant de passer le test, tout en maintenant l'obligation du pré-test pour finaliser leur inscription.
