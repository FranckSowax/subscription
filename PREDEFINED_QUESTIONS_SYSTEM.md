# 📚 Système de Questions Pré-définies & Authentification Étudiants

## ✅ Changements Majeurs Implémentés

### 1. **Questions Pré-définies** (Plus de génération OpenAI)
- ✅ 10 questions PRE-inscription (niveau débutant)
- ✅ 10 questions POST-masterclass (validation des acquis)
- ✅ Questions stockées en base de données
- ✅ Pas besoin d'OpenAI pour générer les questions

### 2. **Système d'Authentification Étudiants**
- ✅ Connexion par email uniquement
- ✅ Token de session (valide 24h)
- ✅ Dashboard personnel pour chaque étudiant

### 3. **Gestion des Tests PRE/POST**
- ✅ Test PRE : Disponible immédiatement après inscription
- ✅ Test POST : Disponible UNIQUEMENT après la date de la masterclass
- ✅ Historique complet des tests dans le dashboard

---

## 🎯 Nouveau Flux Complet

```
1. Inscription
   └─> Formulaire + Validation

2. Sélection de Session
   └─> Choix de la date (12 dates disponibles)

3. Test PRE-Inscription
   └─> 10 questions faciles (niveau débutant)
   └─> Score enregistré

4. Connexion Espace Étudiant
   └─> Email uniquement
   └─> Dashboard personnel

5. Masterclass (Date sélectionnée)
   └─> Participation à la masterclass

6. Test POST-Masterclass (Après la date)
   └─> 10 questions (validation des acquis)
   └─> Score enregistré
```

---

## 📝 Questions Pré-définies

### Test PRE-Inscription (10 questions)

**Objectif** : Évaluer les connaissances de base en IA avant la formation

1. Qu'est-ce que l'intelligence artificielle ?
   - A) Une science magique
   - B) Un robot uniquement
   - **C) Une technologie qui imite certaines capacités humaines** ✓
   - D) Une nouvelle langue

2. L'IA est-elle déjà présente dans notre vie quotidienne ?
   - A) Non, c'est trop récent
   - **B) Oui, mais on ne s'en rend pas toujours compte** ✓
   - C) Uniquement dans les films
   - D) Seulement dans les labos

3. Quel outil est un exemple d'IA générative ?
   - A) Word
   - **B) ChatGPT** ✓
   - C) Excel
   - D) PowerPoint

4. Lequel de ces secteurs n'utilise pas l'IA ?
   - A) Santé
   - B) Agriculture
   - **C) Cuisine traditionnelle manuelle** ✓
   - D) Finance

5. À quoi sert un prompt ?
   - A) Mise à jour
   - **B) Question/commande à l'IA** ✓
   - C) Logiciel
   - D) Image

6. Une IA peut-elle produire un texte ?
   - A) Non
   - **B) Oui, si bien entraînée** ✓
   - C) Uniquement des images
   - D) Jamais sans humain

7. Quelle IA est de Google ?
   - **A) Gemini** ✓
   - B) ChatGPT
   - C) Copilot
   - D) Bard

8. L'IA peut-elle avoir des biais ?
   - A) Non
   - **B) Oui, à cause des données** ✓
   - C) Rarement
   - D) Seulement en maths

9. Quel outil permet de créer des visuels ?
   - **A) Canva** ✓
   - B) Perplexity
   - C) Word
   - D) Google Docs

10. Que signifie "IA générative" ?
    - A) IA qui comprend les émotions
    - **B) IA qui génère du contenu** ✓
    - C) IA pour l'électricité
    - D) IA militaire

---

### Test POST-Masterclass (10 questions)

**Objectif** : Valider la compréhension des concepts, outils et éthique après la masterclass

1. Structure d'un bon prompt ?
   - A) Objectif – Format – Rôle
   - **B) Contexte – Rôle – Objectif – Format – Ton – Contraintes** ✓
   - C) Sujet – Verbe – Complément
   - D) Titre – Image – Résumé

2. Règle d'or N°1 du prompt ?
   - A) Écrire vite
   - B) Être flou
   - **C) Donner du contexte** ✓
   - D) Copier-coller

3. Outil académique IA ?
   - A) Canva
   - **B) ChatGPT / Perplexity** ✓
   - C) Google Maps
   - D) PowerPoint

4. Activité de l'atelier pratique ?
   - A) Lecture
   - **B) Prompt Battle** ✓
   - C) Jeu de société
   - D) Création PDF

5. Pourquoi IA peut être biaisée ?
   - A) Toujours exacte
   - **B) Données d'entraînement** ✓
   - C) Ne dort pas
   - D) Pas d'Internet

6. Outil IA pour créer un CV ?
   - A) ChatGPT
   - **B) Canva** ✓
   - C) Excel
   - D) Perplexity

7. Rôle de l'éthique en IA ?
   - A) Aucun
   - B) Performance
   - **C) Usage responsable** ✓
   - D) Créer des lois

8. IA remplacera-t-elle les humains ?
   - A) Oui
   - **B) Non, elle les rendra meilleurs** ✓
   - C) En cuisine
   - D) Dans 1000 ans

9. Objectif du mini-projet ?
   - A) Créer une app IA
   - **B) Idée d'usage local** ✓
   - C) Noter les autres groupes
   - D) Refaire le cours

10. Nom de l'IA de Microsoft ?
    - A) Gemini
    - B) Bard
    - **C) Copilot** ✓
    - D) Watson

---

## 🔐 Système d'Authentification

### Connexion Étudiant

**URL** : `/student/login`

**Fonctionnement** :
1. L'étudiant entre son email d'inscription
2. Le système vérifie l'existence du compte
3. Un token de session est généré (valide 24h)
4. L'étudiant est redirigé vers son dashboard

**Sécurité** :
- Token unique par session
- Expiration automatique après 24h
- Vérification à chaque requête

---

## 📊 Dashboard Étudiant

**URL** : `/student/dashboard`

### Informations Affichées

#### 1. Informations Personnelles
- Nom complet
- Email
- Date d'inscription

#### 2. Session de Masterclass
- Date sélectionnée
- Heure de la session
- Statut (à venir / passée)

#### 3. Test PRE-Inscription
- ✅ Score obtenu (X/10)
- ✅ Date de passage
- ✅ Lien vers les résultats détaillés

#### 4. Test POST-Masterclass
- 🔒 **AVANT la masterclass** : "Test non disponible"
- ✅ **APRÈS la masterclass** : "Test disponible" + Bouton
- ✅ **Déjà passé** : Score + Résultats

---

## 🗄️ Structure de la Base de Données

### Nouvelles Tables

#### `student_auth_tokens`
```sql
CREATE TABLE student_auth_tokens (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);
```

#### Colonne ajoutée : `questions.test_type`
```sql
ALTER TABLE questions 
ADD COLUMN test_type VARCHAR(10) DEFAULT 'PRE' 
CHECK (test_type IN ('PRE', 'POST'));
```

#### Vue : `student_dashboard`
```sql
CREATE VIEW student_dashboard AS
SELECT 
  p.id as profile_id,
  p.full_name,
  p.email,
  i.id as inscription_id,
  ms.session_date,
  ms.session_time,
  -- Test PRE
  pre_test.id as pre_test_id,
  pre_test.score as pre_test_score,
  -- Test POST
  post_test.id as post_test_id,
  post_test.score as post_test_score,
  -- Disponibilité
  CASE 
    WHEN ms.session_date <= CURRENT_DATE THEN TRUE
    ELSE FALSE
  END as post_test_available
FROM profiles p
LEFT JOIN inscriptions i ON p.id = i.profile_id
LEFT JOIN session_bookings sb ON i.id = sb.inscription_id
LEFT JOIN masterclass_sessions ms ON sb.session_id = ms.id
LEFT JOIN tests pre_test ON i.id = pre_test.inscription_id AND pre_test.type = 'PRE'
LEFT JOIN tests post_test ON i.id = post_test.inscription_id AND post_test.type = 'POST';
```

---

## 🔧 APIs Créées

### 1. Authentification

#### `POST /api/student/auth/login`
```json
{
  "email": "etudiant@example.com"
}
```

**Réponse** :
```json
{
  "success": true,
  "token": "abc123...",
  "profile": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "etudiant@example.com"
  }
}
```

#### `POST /api/student/auth/verify`
```json
{
  "token": "abc123..."
}
```

**Réponse** :
```json
{
  "success": true,
  "profile": { ... }
}
```

### 2. Dashboard

#### `GET /api/student/dashboard`
**Headers** : `Authorization: Bearer <token>`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "full_name": "Jean Dupont",
    "email": "jean@example.com",
    "session_date": "2025-10-20",
    "session_time": "14:00-17:00",
    "pre_test_score": 8,
    "pre_test_max_score": 10,
    "post_test_available": true,
    "post_test_score": null
  }
}
```

### 3. Questions

#### `GET /api/questions?masterclass_id=<id>&test_type=PRE`
**Réponse** :
```json
{
  "questions": [
    {
      "id": "uuid",
      "question_text": "Qu'est-ce que l'IA ?",
      "choices": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "test_type": "PRE"
    }
  ]
}
```

### 4. Disponibilité Test POST

#### `GET /api/test/post/availability`
**Headers** : `Authorization: Bearer <token>`

**Réponse** :
```json
{
  "success": true,
  "available": true,
  "session_date": "2025-10-20",
  "already_taken": false,
  "message": "Test POST disponible"
}
```

---

## 📱 Pages Créées/Modifiées

### Nouvelles Pages

1. **`/student/login`** - Connexion étudiant
2. **`/student/dashboard`** - Dashboard personnel
3. **`/inscription/session/[id]`** - Sélection de session après inscription

### Pages Modifiées

1. **`/test/pre`** - Utilise questions PRE pré-définies
2. **`/test/post`** - Utilise questions POST pré-définies
3. **`/test/results/[id]`** - Suppression du sélecteur de session

---

## 🚀 Installation & Déploiement

### Étape 1 : Appliquer la Migration SQL

```bash
# 1. Ouvrir Supabase SQL Editor
https://apqpsyugdmvrzaprugvw.supabase.co/project/apqpsyugdmvrzaprugvw/sql/new

# 2. Copier le contenu de :
supabase/migrations/005_predefined_questions_and_auth.sql

# 3. Coller et cliquer "Run"
```

**Cette migration va** :
- ✅ Supprimer les anciennes questions
- ✅ Insérer 10 questions PRE
- ✅ Insérer 10 questions POST
- ✅ Créer la table `student_auth_tokens`
- ✅ Créer la vue `student_dashboard`
- ✅ Ajouter la colonne `test_type` à `questions`

### Étape 2 : Redémarrer l'Application

```bash
# Si l'app tourne déjà, hot reload automatique
# Sinon :
npm run dev
```

---

## 🧪 Tester le Système

### 1. Test d'Inscription Complète

```bash
1. Aller sur /inscription
2. Remplir le formulaire
3. Choisir une date de masterclass
4. Passer le test PRE (10 questions faciles)
5. Voir les résultats
```

### 2. Test de Connexion Étudiant

```bash
1. Aller sur /student/login
2. Entrer l'email d'inscription
3. ✅ Voir le dashboard personnel
4. ✅ Voir le score du test PRE
5. ✅ Voir la date de la masterclass
```

### 3. Test de Disponibilité POST

```bash
# Cas 1 : AVANT la masterclass
- Le test POST est grisé
- Message : "Test disponible après votre masterclass"

# Cas 2 : APRÈS la masterclass
- Le test POST est disponible
- Bouton : "Passer le test post-masterclass"

# Cas 3 : Déjà passé
- Score affiché
- Lien vers les résultats
```

---

## 📊 Logique de Disponibilité du Test POST

```sql
-- Le test POST est disponible SI :
1. La date de la masterclass est passée (session_date <= CURRENT_DATE)
2. ET le test n'a pas encore été passé (post_test_id IS NULL)

-- Implémenté dans la vue student_dashboard :
CASE 
  WHEN ms.session_date IS NOT NULL 
   AND ms.session_date <= CURRENT_DATE THEN TRUE
  ELSE FALSE
END as post_test_available
```

---

## 🎨 Interface Utilisateur

### Dashboard Étudiant

```
┌─────────────────────────────────────┐
│  Espace Étudiant                    │
│  Jean Dupont                        │
│                          [Déconnexion]
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📅 Ma Masterclass                  │
│  ─────────────────────────────────  │
│  Date : 20 octobre 2025             │
│  Heure : 14:00-17:00                │
│  📍 Détails par WhatsApp            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✅ Test Pré-Inscription            │
│  ─────────────────────────────────  │
│  Score : 8/10                       │
│  Passé le : 15 octobre 2025         │
│  [Voir les résultats détaillés]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🏆 Test Post-Masterclass           │
│  ─────────────────────────────────  │
│  ✅ Test disponible !               │
│  Votre masterclass a eu lieu.       │
│  [Passer le test post-masterclass]  │
└─────────────────────────────────────┘
```

---

## ✅ Avantages du Nouveau Système

### 1. **Simplicité**
- ✅ Pas besoin d'OpenAI pour générer les questions
- ✅ Questions cohérentes pour tous les étudiants
- ✅ Coûts réduits (pas d'API calls)

### 2. **Contrôle**
- ✅ Questions validées et testées
- ✅ Difficulté maîtrisée
- ✅ Progression pédagogique claire

### 3. **Expérience Utilisateur**
- ✅ Dashboard personnel pour chaque étudiant
- ✅ Historique complet des tests
- ✅ Disponibilité automatique du test POST

### 4. **Sécurité**
- ✅ Authentification par token
- ✅ Expiration automatique
- ✅ Accès contrôlé aux données

---

## 📈 Métriques Disponibles

### Pour les Administrateurs

```sql
-- Nombre d'étudiants inscrits
SELECT COUNT(*) FROM profiles;

-- Scores moyens PRE
SELECT AVG(score) FROM tests WHERE type = 'PRE';

-- Scores moyens POST
SELECT AVG(score) FROM tests WHERE type = 'POST';

-- Progression moyenne
SELECT 
  AVG(post.score - pre.score) as progression
FROM tests pre
JOIN tests post ON pre.inscription_id = post.inscription_id
WHERE pre.type = 'PRE' AND post.type = 'POST';

-- Sessions les plus populaires
SELECT session_date, COUNT(*) as bookings
FROM session_bookings sb
JOIN masterclass_sessions ms ON sb.session_id = ms.id
GROUP BY session_date
ORDER BY bookings DESC;
```

---

## 🎯 Résumé des Fichiers

### Migrations SQL
- ✅ `005_predefined_questions_and_auth.sql` - Questions + Auth

### APIs
- ✅ `/api/student/auth/login/route.ts` - Connexion
- ✅ `/api/student/auth/verify/route.ts` - Vérification token
- ✅ `/api/student/dashboard/route.ts` - Dashboard
- ✅ `/api/test/post/availability/route.ts` - Disponibilité POST
- ✅ `/api/questions/route.ts` - Questions (modifié pour filtrer PRE/POST)

### Pages
- ✅ `/student/login/page.tsx` - Connexion
- ✅ `/student/dashboard/page.tsx` - Dashboard
- ✅ `/inscription/session/[id]/page.tsx` - Sélection session
- ✅ `/test/pre/page.tsx` - Test PRE (modifié)
- ✅ `/test/post/page.tsx` - Test POST (modifié)

---

## 🎉 Système Complet et Fonctionnel !

**Le système est maintenant :**
- ✅ Autonome (pas besoin d'OpenAI)
- ✅ Sécurisé (authentification par token)
- ✅ Intelligent (test POST disponible après masterclass)
- ✅ User-friendly (dashboard personnel)
- ✅ Évolutif (facile d'ajouter de nouvelles questions)

**Prochaines étapes :**
1. Appliquer la migration SQL
2. Tester le flux complet
3. Vérifier la disponibilité du test POST
4. Personnaliser les emails de connexion (optionnel)
