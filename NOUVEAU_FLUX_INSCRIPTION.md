# Nouveau Flux d'Inscription - Documentation

## 🔄 Changement de Flux

### **Ancien Flux (Pré-test d'abord)**
```
1. Inscription
2. Pré-test (obligatoire)
3. Choix de session
4. Réservation confirmée
```

### **Nouveau Flux (Choix de session d'abord)**
```
1. Inscription
2. Choix de session (sélection stockée temporairement)
3. Pré-test (obligatoire)
4. Réservation confirmée automatiquement
```

---

## 🎯 Objectif

Permettre à l'étudiant de **choisir sa date préférée** avant de passer le test, tout en maintenant l'obligation du pré-test. Si l'étudiant ne passe pas le test, son inscription reste **incomplète** et la réservation **n'est jamais créée**.

---

## 🛠️ Modifications Techniques

### **1. Base de Données** 

**Migration `012_add_selected_session_to_inscriptions.sql`**

Ajout d'un champ dans la table `inscriptions` :
```sql
ALTER TABLE inscriptions 
ADD COLUMN selected_session_id uuid REFERENCES sessions(id);
```

**Trigger automatique** :
- Après la soumission du pré-test
- Si `selected_session_id` est renseigné
- Crée automatiquement le `session_booking`
- Incrémente le compteur de participants
- Efface le `selected_session_id`

```sql
CREATE FUNCTION auto_create_booking_after_pretest()
```

### **2. API de Réservation**

**Fichier : `app/api/sessions/book/route.ts`**

**Changements :**
- ❌ Ne crée **plus** de `session_booking` directement
- ✅ Stocke le `session_id` dans `inscriptions.selected_session_id`
- ❌ Ne vérifie **plus** l'existence d'un pré-test
- ✅ Vérifie si une session a déjà été sélectionnée

**Logique :**
```typescript
// Stocker la sélection (pas encore de réservation)
await supabase
  .from('inscriptions')
  .update({ selected_session_id: session_id })
  .eq('id', inscription_id);

// Message retourné
"Session sélectionnée avec succès. Passez maintenant le pré-test."
```

### **3. Flux Frontend**

#### **Étape 1 : Inscription**
**Fichier : `components/forms/RegistrationForm.tsx`**
- Redirection : `/inscription/session/${inscription_id}`
- Message : "Choisir ma date de session"

#### **Étape 2 : Sélection de Session**
**Fichier : `app/inscription/session/[id]/page.tsx`**
- ❌ Plus de vérification du pré-test
- Interface : "📅 Choisissez votre Date de Masterclass"
- Message : "Étape 1/2 : Choix de session"
- Après sélection → Redirection vers `/test/pre?inscription_id=${id}`

#### **Étape 3 : Pré-test**
**Fichier : `components/test/QCMTest.tsx`**
- 10 questions, 15 secondes par question
- Après soumission → Redirection vers `/test/confirmation`

#### **Étape 4 : Confirmation**
**Fichier : `app/test/confirmation/page.tsx`**
- Message de succès
- Accès au dashboard étudiant

---

## 🔒 Protection et Sécurité

### **Triple Protection Maintenue**

1. **Base de données (Trigger SQL)** :
   - Le trigger `ensure_pretest_before_booking` reste actif
   - Empêche toute insertion dans `session_bookings` sans pré-test
   - Protection contre les tentatives de contournement

2. **Backend (Trigger automatique)** :
   - Le booking n'est créé **QUE** après le pré-test
   - Vérification de la capacité de la session
   - Gestion atomique de la transaction

3. **Frontend (UX)** :
   - Flux guidé étape par étape
   - Messages clairs à chaque étape
   - Redirection automatique

---

## 📊 États de l'Inscription

### **État 1 : Inscription Initiale**
```json
{
  "id": "xxx",
  "validated": false,
  "selected_session_id": null
}
```

### **État 2 : Session Sélectionnée**
```json
{
  "id": "xxx",
  "validated": false,
  "selected_session_id": "yyy"
}
```
⚠️ **Inscription incomplète** - Pas de réservation réelle

### **État 3 : Pré-test Réussi**
```json
{
  "id": "xxx",
  "validated": true,
  "selected_session_id": null  // Effacé après création du booking
}
```
✅ **Inscription complète** - Réservation créée automatiquement

---

## 🎨 Expérience Utilisateur

### **Messages à Chaque Étape**

1. **Page d'inscription** :
   > "Après l'inscription, vous choisirez votre date de masterclass, puis vous passerez le pré-test obligatoire pour finaliser votre inscription."

2. **Page de sélection de session** :
   > "📅 Choisissez votre Date de Masterclass
   > 
   > Étape 1/2 : Choix de session
   > 
   > ⚠️ Après avoir choisi votre date, vous passerez le pré-test obligatoire pour finaliser votre inscription."

3. **Page de pré-test** :
   > "Évaluez vos connaissances
   > 
   > Répondez aux 10 questions suivantes
   > 
   > ⏱️ Attention : Vous avez 15 secondes par question !"

4. **Page de confirmation** :
   > "✅ Test PRE Complété avec Succès !
   > 
   > Votre inscription a été validée."

---

## 🚀 Déploiement

### **Étapes pour Appliquer**

1. **Appliquer la migration SQL** :
   ```bash
   # Via Supabase Dashboard
   - Ouvrir SQL Editor
   - Copier 012_add_selected_session_to_inscriptions.sql
   - Run
   ```

2. **Vérifier le trigger** :
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_auto_create_booking_after_pretest';
   ```

3. **Tester le flux complet** :
   - Créer une nouvelle inscription
   - Choisir une session → Vérifier `selected_session_id` dans DB
   - Passer le pré-test
   - Vérifier création automatique du `session_booking`
   - Vérifier que `selected_session_id` est null après le test

---

## ✅ Tests de Validation

### **Test 1 : Flux Normal**
```
✅ Inscription créée
✅ Session sélectionnée (selected_session_id rempli)
✅ Pré-test passé
✅ Booking créé automatiquement
✅ Compteur de participants incrémenté
✅ selected_session_id effacé
```

### **Test 2 : Abandon Après Sélection**
```
✅ Inscription créée
✅ Session sélectionnée
❌ Pré-test non passé
✅ Aucun booking créé
✅ Inscription reste incomplète
```

### **Test 3 : Session Complète**
```
✅ Inscription créée
✅ Sélection d'une session pleine → Erreur
✅ Sélection d'une autre session → OK
✅ Pré-test passé
✅ Booking créé
```

---

## 📈 Avantages du Nouveau Flux

### **Pour l'Étudiant**
- ✅ **Flexibilité** : Choisir sa date préférée d'abord
- ✅ **Transparence** : Voir les dates disponibles avant le test
- ✅ **Motivation** : Savoir sa date encourage à passer le test
- ✅ **Engagement** : Plus impliqué dans le processus

### **Pour l'Application**
- ✅ **Sécurité** : Protection multiple maintenue
- ✅ **Intégrité** : Pas de réservation sans test
- ✅ **Automatisation** : Trigger gère la finalisation
- ✅ **Traçabilité** : Chaque étape est enregistrée

---

## ⚠️ Points d'Attention

### **Données Orphelines Potentielles**

Si un étudiant sélectionne une session mais ne passe jamais le test :
- `selected_session_id` reste rempli
- Aucun booking n'est créé
- La session apparaît comme "prise" dans l'interface mais ne l'est pas réellement

**Solution : Tâche de nettoyage (optionnelle)**
```sql
-- Effacer les sélections de plus de 7 jours sans test
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

## 🔄 Rollback (Si Nécessaire)

Pour revenir à l'ancien flux :

1. **Supprimer le trigger** :
   ```sql
   DROP TRIGGER IF EXISTS trigger_auto_create_booking_after_pretest ON tests;
   DROP FUNCTION IF EXISTS auto_create_booking_after_pretest();
   ```

2. **Supprimer la colonne** (optionnel) :
   ```sql
   ALTER TABLE inscriptions DROP COLUMN selected_session_id;
   ```

3. **Restaurer les anciens fichiers TypeScript** depuis Git

---

## 📊 Métriques de Succès

**Mesures à suivre :**
- Taux de complétion du flux (inscription → test réussi)
- Nombre d'inscriptions avec `selected_session_id` non null et sans test (abandons)
- Temps moyen entre sélection de session et passage du test
- Satisfaction utilisateur (feedback)

---

## ✨ Conclusion

Ce nouveau flux améliore l'**expérience utilisateur** en permettant le choix de session **avant** le test, tout en maintenant la **sécurité** et l'**intégrité des données**. La réservation n'est finalisée qu'après la réussite du pré-test obligatoire.

**Date de migration** : 14 octobre 2025  
**Version** : 012_add_selected_session_to_inscriptions.sql  
**Statut** : ✅ Prêt pour déploiement
