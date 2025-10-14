# Compatibilité avec les Données Existantes

## 🎯 Analyse d'Impact des Migrations

Ce document détaille la compatibilité des nouvelles migrations avec les étudiants et données déjà présents dans Supabase.

---

## ✅ Migration 010 : Pré-test Obligatoire

**Fichier :** `010_enforce_pretest_before_booking.sql`

### Modifications
- Création fonction `check_pretest_before_booking()`
- Création trigger `ensure_pretest_before_booking` sur table `session_bookings`

### Impact sur Données Existantes
✅ **AUCUN IMPACT**

**Raison :**
- Le trigger s'applique uniquement aux **NOUVELLES** insertions (`BEFORE INSERT`)
- Les réservations existantes ne sont **PAS affectées**
- Les étudiants déjà inscrits conservent leur réservation même sans pré-test

**Pour les nouvelles inscriptions :**
- Le trigger empêchera toute réservation sans pré-test
- Comportement attendu et désiré

---

## ⚠️ Migration 011 : Questions Avancées

**Fichier :** `011_update_advanced_questions.sql`

### Modifications
- Suppression des anciennes questions **NON UTILISÉES**
- Insertion de 20 nouvelles questions (10 PRE + 10 POST)

### Impact sur Données Existantes
✅ **PROTÉGÉ**

**Protection Implémentée :**
```sql
-- Suppression UNIQUEMENT des questions non référencées dans les tests
DELETE FROM questions
WHERE id NOT IN (
  SELECT DISTINCT (jsonb_array_elements(responses)->>'question_id')::uuid
  FROM tests
  WHERE responses IS NOT NULL
  AND jsonb_array_length(responses) > 0
);
```

**Résultat :**
- ✅ Les questions utilisées dans les tests passés sont **PRÉSERVÉES**
- ✅ Les résultats des étudiants existants restent **INTACTS**
- ✅ Les nouvelles questions coexistent avec les anciennes
- ⚠️ Il peut y avoir plus de 20 questions au total (anciennes + nouvelles)

**Cas d'Usage :**
1. **Étudiant avec test déjà passé** : Ses questions restent disponibles, résultats consultables
2. **Nouvel étudiant** : Recevra les nouvelles questions avancées
3. **Consultation des résultats** : Les anciens tests affichent les bonnes questions

---

## ✅ Migration 012 : Nouveau Flux Inscription

**Fichier :** `012_add_selected_session_to_inscriptions.sql`

### Modifications
- Ajout colonne `selected_session_id` à la table `inscriptions`
- Création fonction `auto_create_booking_after_pretest()`
- Création trigger `trigger_auto_create_booking_after_pretest` sur table `tests`

### Impact sur Données Existantes
✅ **AUCUN IMPACT**

**Pour la colonne `selected_session_id` :**
- Colonne **NULLABLE** : `ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS selected_session_id uuid`
- Toutes les inscriptions existantes auront `selected_session_id = NULL`
- Pas d'impact sur les inscriptions validées

**Pour le trigger `auto_create_booking_after_pretest` :**
- S'exécute uniquement à l'insertion d'un **NOUVEAU** test
- Les tests existants ne déclenchent **PAS** le trigger
- Protection contre les doublons :
  ```sql
  -- Vérification explicite
  SELECT EXISTS (
    SELECT 1 FROM session_bookings 
    WHERE inscription_id = NEW.inscription_id
  ) INTO v_booking_exists;
  
  -- Ne crée le booking QUE s'il n'existe pas déjà
  IF NOT v_booking_exists THEN
    INSERT INTO session_bookings...
  END IF;
  ```

**Résultat :**
- ✅ Étudiants avec test + réservation existants : **Aucun changement**
- ✅ Compteur de participants : **Pas de double incrémentation**
- ✅ Nouveaux étudiants : Bénéficient du nouveau flux

---

## 📊 Tableau Récapitulatif

| Migration | Modification | Impact Données Existantes | Protection |
|-----------|-------------|---------------------------|------------|
| **010** | Trigger avant insertion booking | ✅ Aucun | Trigger `BEFORE INSERT` uniquement |
| **011** | Remplacement questions | ✅ Préservées | DELETE avec exclusion des questions utilisées |
| **012** | Colonne + Trigger après test | ✅ Aucun | Colonne NULL + Vérification existence booking |

---

## 🧪 Tests de Validation

### Scénarios à Tester Après Migration

#### Scénario 1 : Étudiant Existant avec Test + Réservation
```
État actuel :
- Inscription validée
- Test PRE passé
- Réservation confirmée

Après migration :
✅ Inscription toujours validée
✅ Test consultable avec bonnes questions
✅ Réservation intacte
✅ selected_session_id = NULL
```

#### Scénario 2 : Étudiant Existant Sans Test
```
État actuel :
- Inscription non validée
- Pas de test
- Pas de réservation

Après migration :
✅ Peut choisir une session (nouveau flux)
✅ Doit passer le pré-test (nouvelles questions)
✅ Réservation créée automatiquement après test
```

#### Scénario 3 : Nouvel Étudiant
```
Nouveau flux complet :
1. Inscription
2. Choix de session → selected_session_id rempli
3. Pré-test (nouvelles questions)
4. Réservation créée automatiquement
5. selected_session_id effacé
```

---

## 🔍 Requêtes de Vérification Post-Migration

### Vérifier Préservation des Questions
```sql
-- Compter les questions par test_type
SELECT test_type, COUNT(*) as nombre
FROM questions
GROUP BY test_type
ORDER BY test_type;

-- Devrait montrer :
-- POST : >= 10 (anciennes + nouvelles)
-- PRE  : >= 10 (anciennes + nouvelles)
```

### Vérifier Intégrité des Tests Existants
```sql
-- Vérifier que tous les tests ont leurs questions disponibles
SELECT 
  t.id as test_id,
  t.type,
  COUNT(DISTINCT (jsonb_array_elements(t.responses)->>'question_id')::uuid) as questions_dans_test,
  COUNT(q.id) as questions_disponibles
FROM tests t
LEFT JOIN questions q ON q.id = ANY(
  ARRAY(SELECT (jsonb_array_elements(t.responses)->>'question_id')::uuid)
)
GROUP BY t.id, t.type
HAVING COUNT(DISTINCT (jsonb_array_elements(t.responses)->>'question_id')::uuid) 
     > COUNT(q.id);

-- Résultat attendu : 0 lignes (toutes les questions sont disponibles)
```

### Vérifier État des Inscriptions
```sql
-- État des inscriptions après migration
SELECT 
  COUNT(*) FILTER (WHERE selected_session_id IS NOT NULL) as avec_selection_en_attente,
  COUNT(*) FILTER (WHERE selected_session_id IS NULL AND validated = true) as validees_completes,
  COUNT(*) FILTER (WHERE selected_session_id IS NULL AND validated = false) as non_validees
FROM inscriptions;
```

---

## ⚠️ Points d'Attention

### 1. Questions en Double (Migration 011)
**Situation :** Anciennes et nouvelles questions coexistent

**Impact :**
- Plus de 20 questions au total dans la base
- Les nouveaux tests utilisent les nouvelles questions
- Les anciens tests gardent leurs questions originales

**Action si nécessaire :**
```sql
-- Optionnel : Nettoyer les anciennes questions après validation
-- NE PAS EXÉCUTER tant que des tests référencent ces questions
DELETE FROM questions 
WHERE created_at < '2025-10-14' 
AND test_type = 'PRE'
AND id NOT IN (
  SELECT DISTINCT (jsonb_array_elements(responses)->>'question_id')::uuid
  FROM tests
);
```

### 2. Sélections de Session Orphelines
**Situation :** Étudiants qui sélectionnent une session mais ne passent jamais le test

**Impact :**
- `selected_session_id` reste rempli indéfiniment
- Pas de réservation réelle créée
- Session apparaît "prise" dans l'interface mais ne l'est pas

**Nettoyage Optionnel (après 7 jours) :**
```sql
UPDATE inscriptions
SET selected_session_id = NULL
WHERE selected_session_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tests 
    WHERE inscription_id = inscriptions.id 
    AND type = 'PRE'
  )
  AND registration_date < NOW() - INTERVAL '7 days';
```

---

## ✅ Checklist de Validation

Après application des migrations, vérifier :

- [ ] Aucune erreur lors de l'exécution des migrations
- [ ] Les 3 triggers existent (`ensure_pretest_before_booking`, `trigger_auto_create_booking_after_pretest`, `trigger_update_post_test_status`)
- [ ] La colonne `selected_session_id` existe dans `inscriptions`
- [ ] Les anciennes questions des tests passés sont toujours présentes
- [ ] Les nouveaux tests reçoivent les nouvelles questions
- [ ] Les inscriptions existantes ont `selected_session_id = NULL`
- [ ] Les réservations existantes ne sont pas dupliquées
- [ ] Un étudiant existant peut consulter ses anciens résultats
- [ ] Un nouvel étudiant suit le nouveau flux correctement

---

## 🎉 Conclusion

Les trois migrations sont **100% compatibles** avec les données existantes :

✅ **Migration 010** : Aucun impact sur les réservations existantes  
✅ **Migration 011** : Questions des tests passés préservées  
✅ **Migration 012** : Inscriptions existantes non affectées

Les étudiants déjà inscrits conservent :
- ✅ Leurs résultats de tests consultables
- ✅ Leurs réservations de session
- ✅ Leur statut d'inscription validée

Les nouveaux étudiants bénéficient :
- ✅ Du nouveau flux (session → test → confirmation)
- ✅ Des questions avancées contextualisées
- ✅ De la protection triple niveau

**Les migrations peuvent être appliquées en toute sécurité en production.**
