# Pré-test Obligatoire - Documentation

## 🎯 Objectif

Forcer tous les étudiants à passer le pré-test **avant** de pouvoir réserver une session de masterclass. Cette règle métier garantit que l'inscription est validée uniquement après que l'étudiant ait complété le pré-test.

## 📋 Modifications Effectuées

### 1. **Migration SQL** (`010_enforce_pretest_before_booking.sql`)

Création d'une contrainte au niveau de la base de données :

- **Fonction `check_pretest_before_booking()`** : Vérifie qu'un test de type 'PRE' existe pour l'inscription avant toute réservation de session
- **Trigger `ensure_pretest_before_booking`** : Se déclenche automatiquement avant chaque insertion dans `session_bookings`
- **Protection au niveau base de données** : Même si le frontend est contourné, la base de données refuse toute réservation sans pré-test

```sql
-- Exemple de protection
INSERT INTO session_bookings (inscription_id, session_id)
VALUES ('xxx', 'yyy');
-- ❌ ERREUR: Le pré-test doit être effectué avant de réserver une session
```

### 2. **Flux d'Inscription Modifié**

**Ancien flux :**
1. Inscription → 2. Choix de session → 3. Pré-test

**Nouveau flux :**
1. Inscription → 2. **Pré-test** → 3. Choix de session

#### Fichiers modifiés :

**`components/forms/RegistrationForm.tsx`**
- Redirection vers `/test/pre` au lieu de `/inscription/session/[id]`
- Mise à jour des messages pour informer l'étudiant du nouveau flux
- Bouton renommé : "Passer le pré-test" au lieu de "Choisir la date de session"

**`components/test/QCMTest.tsx`**
- Après soumission du pré-test, redirection vers `/inscription/session/[id]`
- L'étudiant est automatiquement dirigé vers le choix de session après avoir réussi le test

### 3. **Vérifications Côté API**

**`app/api/sessions/book/route.ts`**
- Ajout d'une vérification **avant** la création de la réservation
- Recherche d'un test de type 'PRE' pour l'inscription donnée
- Retourne une erreur 403 si le pré-test n'est pas effectué

```typescript
// Vérifier si l'étudiant a passé le pré-test
const { data: preTest } = await supabase
  .from('tests')
  .select('id')
  .eq('inscription_id', inscription_id)
  .eq('type', 'PRE')
  .single();

if (!preTest) {
  return NextResponse.json(
    { error: 'Vous devez d\'abord passer le pré-test avant de réserver une session' },
    { status: 403 }
  );
}
```

**`app/api/inscriptions/[id]/route.ts`**
- Ajout de la récupération des tests associés à une inscription
- Permet de vérifier côté frontend si le pré-test a été effectué

### 4. **Protection Côté Frontend**

**`app/inscription/session/[id]/page.tsx`**
- Vérification automatique au chargement de la page
- Si aucun pré-test trouvé :
  - Affichage d'une alerte
  - Redirection automatique vers `/test/pre` après 3 secondes
  - Bouton manuel pour passer le test immédiatement
- Interface mise à jour pour féliciter l'étudiant après le test

```typescript
// Vérifier si le pré-test a été effectué
const hasTest = data.tests?.some((test: { type: string }) => test.type === 'PRE');

if (!hasTest) {
  // Redirection automatique vers le pré-test
  setTimeout(() => {
    router.push(`/test/pre?inscription_id=${id}`);
  }, 3000);
}
```

## 🔒 Niveaux de Protection

Le système implémente une **triple protection** :

1. **Base de données (SQL Trigger)** : Impossible d'insérer une réservation sans pré-test
2. **Backend (API)** : Vérification avant traitement de la requête
3. **Frontend (React)** : Vérification et redirection de l'utilisateur

## 🎨 Expérience Utilisateur

### Parcours étudiant :

1. **Inscription** : Formulaire rempli → Bouton "Passer le pré-test"
2. **Pré-test** : 10 questions avec timer de 15 secondes chacune
3. **Redirection automatique** : Après soumission → Page de sélection de session
4. **Choix de session** : Message de félicitations + Sélecteur de dates
5. **Confirmation** : Inscription complète

### Messages utilisateurs :

- **Page d'inscription** : "Vous passerez d'abord le pré-test, puis vous choisirez votre date de masterclass"
- **Page de session (avec test)** : "✅ Bravo ! Pré-test Réussi - Maintenant, choisissez votre date de masterclass"
- **Page de session (sans test)** : "⚠️ Vous devez d'abord passer le pré-test avant de choisir votre session"

## 🚀 Déploiement

### Étapes pour appliquer les changements :

1. **Appliquer la migration SQL** :
   ```bash
   # Via Supabase CLI
   npx supabase migration up
   
   # Ou manuellement dans le SQL Editor de Supabase
   ```

2. **Vérifier le trigger** :
   ```sql
   -- Vérifier que le trigger existe
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'ensure_pretest_before_booking';
   ```

3. **Tester le flux complet** :
   - Créer une nouvelle inscription
   - Vérifier la redirection vers le pré-test
   - Passer le pré-test
   - Vérifier la redirection vers la sélection de session
   - Réserver une session

4. **Tester les cas d'erreur** :
   - Essayer d'accéder directement à `/inscription/session/[id]` sans avoir passé le test
   - Vérifier que l'utilisateur est redirigé vers le pré-test

## ⚠️ Points d'Attention

- **Données existantes** : Les inscriptions créées avant cette migration peuvent avoir des réservations sans pré-test. Le trigger ne s'applique qu'aux **nouvelles** réservations.
  
- **Nettoyage des données** : Si nécessaire, exécuter :
  ```sql
  -- Supprimer les réservations sans pré-test (optionnel)
  DELETE FROM session_bookings 
  WHERE inscription_id NOT IN (
    SELECT inscription_id FROM tests WHERE type = 'PRE'
  );
  ```

- **Test en environnement de développement** : Toujours tester la migration localement avant de l'appliquer en production

## 📊 Impact

- ✅ **Qualité des données** : Garantit que tous les étudiants avec réservation ont passé le pré-test
- ✅ **Intégrité métier** : Respecte la règle métier imposée
- ✅ **Expérience utilisateur** : Flux clair et guidé
- ✅ **Sécurité** : Protection multi-niveaux contre les contournements

## 🔄 Rollback

Si nécessaire, pour revenir en arrière :

```sql
-- Supprimer le trigger et la fonction
DROP TRIGGER IF EXISTS ensure_pretest_before_booking ON session_bookings;
DROP FUNCTION IF EXISTS check_pretest_before_booking();
```

Puis restaurer les anciens fichiers TypeScript depuis le contrôle de version.
