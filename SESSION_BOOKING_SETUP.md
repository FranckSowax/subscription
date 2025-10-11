# 📅 Système de Réservation de Sessions - Guide de Configuration

## ✅ Ce qui a été créé

### 1. Tables de Base de Données

Deux nouvelles tables ont été ajoutées :

#### `masterclass_sessions`
- Stocke les dates de sessions disponibles
- 12 dates configurées : 20-23, 27-30 Octobre + 3-6 Novembre 2025
- Capacité : 25 participants par session
- Compteur automatique des participants

#### `session_bookings`
- Enregistre les réservations des étudiants
- Une réservation par étudiant
- Lien avec l'inscription

### 2. APIs Créées

#### `GET /api/sessions`
- Liste toutes les sessions disponibles
- Retourne les statistiques globales
- Affiche le nombre de places restantes

#### `POST /api/sessions/book`
- Permet de réserver une session
- Vérifie que l'étudiant a validé le test (≥50%)
- Vérifie qu'il n'a pas déjà réservé
- Vérifie que la session n'est pas complète

### 3. Composant UI

#### `SessionSelector`
- Interface user-friendly pour choisir une date
- Affichage par mois (Octobre / Novembre)
- Code couleur selon disponibilité :
  - 🟢 Vert : Beaucoup de places (< 50%)
  - 🟡 Jaune : Places limitées (50-80%)
  - 🟠 Orange : Presque complet (80-100%)
  - 🔴 Rouge : COMPLET
- Compteur global de places disponibles
- Confirmation visuelle de la sélection

### 4. Intégration

Le sélecteur de session apparaît **après les résultats du test pré-évaluation** si :
- ✅ Le test est réussi (score ≥ 50%)
- ✅ L'étudiant clique sur "Choisir ma date de masterclass"

---

## 🚀 Installation

### Étape 1 : Appliquer la Migration SQL

1. **Ouvrir Supabase SQL Editor**
   ```
   https://apqpsyugdmvrzaprugvw.supabase.co/project/apqpsyugdmvrzaprugvw/sql/new
   ```

2. **Copier le contenu de**
   ```
   supabase/migrations/003_add_sessions.sql
   ```

3. **Coller et Exécuter** (bouton "Run")

4. **Vérifier** que les tables sont créées :
   - `masterclass_sessions` (12 lignes)
   - `session_bookings` (vide au début)

### Étape 2 : Redémarrer l'Application

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

---

## 🧪 Tester le Système

### 1. S'inscrire et Passer le Test
```
1. Aller sur /inscription
2. Remplir le formulaire
3. Passer le test pré-évaluation
4. Obtenir ≥50% pour valider
```

### 2. Voir les Résultats et Choisir une Date
```
1. Sur la page de résultats
2. Cliquer "📅 Choisir ma date de masterclass"
3. Voir les 12 dates disponibles
4. Sélectionner une date
5. Confirmer la réservation
```

### 3. Vérifier la Réservation
```
- Message de succès affiché
- Notification WhatsApp envoyée (si configuré)
- Compteur de participants mis à jour
```

---

## 📊 Fonctionnalités du Système

### Statistiques Globales
- **Places restantes** : Total des places disponibles
- **Déjà inscrits** : Nombre total de réservations
- **Capacité totale** : 300 places (12 sessions × 25)
- **Sessions** : 12 dates

### Gestion Automatique
- ✅ Compteur mis à jour automatiquement
- ✅ Sessions marquées "COMPLET" quand pleines
- ✅ Impossible de réserver si complet
- ✅ Une seule réservation par étudiant
- ✅ Validation requise (test réussi)

### Interface Utilisateur
- 📅 Dates formatées en français
- 👥 Indicateur de places restantes
- 🎨 Code couleur de disponibilité
- ✅ Confirmation visuelle de sélection
- 🔒 Boutons désactivés si complet

---

## 🔧 Configuration des Dates

Pour modifier les dates disponibles, éditez la migration :

```sql
-- Dans supabase/migrations/003_add_sessions.sql
v_dates date[] := ARRAY[
  '2025-10-20'::date, '2025-10-21'::date, -- Ajouter/modifier ici
  -- ...
];
```

Puis réappliquez la migration.

---

## 📱 Notifications WhatsApp

Après une réservation réussie, un message WhatsApp est envoyé avec :
- ✅ Confirmation de la réservation
- 📅 Date et heure de la session
- 📍 Lieu (si configuré)
- 📝 Instructions supplémentaires

**Note :** Nécessite la configuration du token Whapi dans `.env.local`

---

## 🎯 Flux Complet Utilisateur

```
1. Inscription → Formulaire
2. Test pré-évaluation → 10 questions
3. Résultats → Score affiché
4. Si ≥50% → Bouton "Choisir ma date"
5. Sélection de session → Interface calendrier
6. Confirmation → Réservation enregistrée
7. Notification WhatsApp → Confirmation envoyée
8. Dashboard admin → Voir toutes les réservations
```

---

## 📈 Dashboard Admin

Les administrateurs peuvent voir :
- Liste des étudiants avec leur session réservée
- Statistiques par session
- Export CSV avec les dates de session

---

## ⚠️ Points Importants

### Contraintes
- ✅ **Une réservation par étudiant** : Impossible de changer après confirmation
- ✅ **Test validé requis** : Score ≥ 50% obligatoire
- ✅ **Capacité limitée** : 25 participants maximum par session
- ✅ **Ordre d'arrivée** : Premier arrivé, premier servi

### Sécurité
- ✅ RLS activé sur les tables
- ✅ Vérifications côté serveur
- ✅ Validation de l'inscription
- ✅ Protection contre les doubles réservations

---

## 🎨 Personnalisation

### Modifier la Capacité
```sql
-- Dans la migration
max_participants int NOT NULL DEFAULT 25, -- Changer ici
```

### Ajouter des Dates
```sql
-- Ajouter dans le tableau v_dates
'2025-11-07'::date, '2025-11-08'::date,
```

### Modifier les Couleurs
```tsx
// Dans SessionSelector.tsx
const getAvailabilityColor = (session: Session) => {
  // Modifier les seuils ici
  if (percentage >= 100) return 'bg-red-100...';
  if (percentage >= 80) return 'bg-orange-100...';
  // ...
}
```

---

## 🆘 Dépannage

### Erreur "Session non trouvée"
- Vérifier que la migration a été appliquée
- Vérifier que les sessions existent dans la table

### Erreur "Inscription doit être validée"
- L'étudiant doit avoir réussi le test pré-évaluation (≥50%)

### Erreur "Session complète"
- La session sélectionnée a atteint 25 participants
- Choisir une autre date

### Compteur incorrect
- Les triggers SQL maintiennent le compteur automatiquement
- Vérifier que les triggers sont créés

---

## ✅ Checklist de Vérification

- [ ] Migration SQL appliquée
- [ ] 12 sessions créées dans la table
- [ ] Application redémarrée
- [ ] Test d'inscription effectué
- [ ] Test pré-évaluation réussi
- [ ] Sélecteur de session affiché
- [ ] Réservation effectuée avec succès
- [ ] Compteur mis à jour
- [ ] Notification WhatsApp reçue (si configuré)

---

**Le système de réservation est maintenant opérationnel ! 🎉**
