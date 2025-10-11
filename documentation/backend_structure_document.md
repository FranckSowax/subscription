# Backend Structure Document

## 1. Backend Architecture

Notre backend repose principalement sur deux piliers : Supabase pour l’authentification, la base de données et le stockage, et des fonctions serverless (Next.js API routes hébergées sur Vercel) pour la logique métier supplémentaire (génération de questions IA, envoi de notifications). Cette combinaison offre :

- **Serverless & managed** : pas de serveurs à gérer, montée en charge automatique.
- **Séparation des responsabilités** : Supabase gère l’auth et le CRUD de données, les API Next.js traitent la génération de QCM et l’interface avec GPT-4o ou Whapi.
- **Design modulable** : chaque composant (auth, base, IA, notifications) peut évoluer indépendamment.
- **Performances & fiabilité** : hébergement Vercel + CDN intégré + cluster Supabase géré.

Cette architecture garantit :
- **Scalabilité** : montée en charge automatique de Vercel et Supabase.
- **Maintenabilité** : code isolé par domaine, API documentées, règles RLS (Row Level Security).
- **Performance** : API serverless très rapides (< 200 ms), caching edge possible.

## 2. Database Management

- Type de base : **SQL (PostgreSQL)** géré par Supabase.
- **Tables principales** : inscriptions (étudiants), masterclasses, questions, tests (pré & post), rôles & permissions.
- **Stockage de fichiers** : Supabase Storage pour les PDF de masterclass.
- **Accès** : via le client Supabase SDK (JavaScript) ou l’API REST auto-générée.
- **Pratiques** :
  - Indexation des champs souvent filtrés (email, date de création, masterclass_id).
  - Transactions atomiques pour l’inscription + test + notification.
  - Règles RLS pour séparer accès étudiants et admins/tuteurs.

## 3. Database Schema

### Description humaine

1. **users** (géré par Supabase Auth) : comptes des admins, tuteurs.
2. **profiles** : profil étendu de l’utilisateur (lien vers Auth).
3. **inscriptions** : données perso de chaque étudiant + statut.
4. **masterclasses** : chaque formation (titre, PDF de support).
5. **questions** : banque de questions QCM, liées à une masterclass.
6. **tests** : enregistrements des tentatives (pré ou post), score et réponses.
7. **user_roles** : rôle attribué (admin, tuteur).  

### Schéma SQL (PostgreSQL)

```sql
-- 1. Profil utilisateur étendu
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name       text NOT NULL,
  date_of_birth   date NOT NULL,
  whatsapp_number text NOT NULL,
  created_at      timestamp with time zone DEFAULT now()
);

-- 2. Détail d’inscription pour étudiants
CREATE TABLE inscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            uuid NOT NULL REFERENCES profiles(id),
  masterclass_id        uuid NOT NULL REFERENCES masterclasses(id),
  validated             boolean DEFAULT false,
  registration_date     timestamp with time zone DEFAULT now()
);

-- 3. Masterclasses
CREATE TABLE masterclasses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  pdf_url     text,            -- URL du PDF stocké
  created_at  timestamp with time zone DEFAULT now()
);

-- 4. Banque de questions
CREATE TABLE questions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id   uuid NOT NULL REFERENCES masterclasses(id),
  question_text    text NOT NULL,
  choices          jsonb NOT NULL, -- {"A":"...","B":"...",...}
  correct_choice   text NOT NULL,
  created_at       timestamp with time zone DEFAULT now()
);

-- 5. Tests (pré & post)
CREATE TABLE tests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id),
  type           text NOT NULL CHECK(type IN ('PRE', 'POST')),
  score          int NOT NULL,
  max_score      int NOT NULL DEFAULT 10,
  responses      jsonb NOT NULL,   -- {"question_id":"A","..."}
  taken_at       timestamp with time zone DEFAULT now()
);

-- 6. Rôles utilisateurs
CREATE TABLE user_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role    text NOT NULL CHECK(role IN ('admin', 'tuteur')),
  assigned_at timestamp with time zone DEFAULT now()
);
```

## 4. API Design and Endpoints

Nous utilisons à la fois l’API REST de Supabase (pour CRUD basiques) et des routes serverless Next.js pour la logique métier spécifique.

1. Authentification (Supabase)
   - `POST /auth/v1/signup` : création de compte (admin/tuteur).
   - `POST /auth/v1/token` : connexion.
2. Inscriptions & Tests (CRUD via Supabase)
   - `POST /inscriptions` : création d’une inscription (via SDK).
   - `GET /inscriptions?masterclass_id=...` : liste des inscrits.
   - `POST /tests` : enregistrement d’un test pré ou post.
3. Génération de QCM (Next.js API)
   - `POST /api/generate-questions` : reçoit PDF (URL), appelle GPT-4o, retourne 10 questions.
4. Notifications WhatsApp (Next.js API)
   - `POST /api/send-whatsapp` : payload {to, messageType, data}, appelle Whapi API.
5. Dashboard Admin/Tuteur (Next.js API)
   - `GET /api/admin/students` : liste paginée + filtres.
   - `GET /api/admin/student/[id]` : détails d’un étudiant.
   - `GET /api/admin/questions` / `POST /api/admin/questions` / `PUT /api/admin/questions/[id]` : gestion de la banque.
6. Sécurité
   - Toutes les routes Next.js vérifient le JWT Supabase.
   - Les appels au client Supabase utilisent des policies RLS adaptées.

## 5. Hosting Solutions

- **Supabase** (managed service) pour la base de données, l’authentification et le stockage.
- **Vercel** pour héberger l’application Next.js (front + API routes).

Avantages :
- **Fiabilité** : SLA 99,9 % Supabase & Vercel.
- **Scalabilité** : montée en charge automatique selon le trafic.
- **Coût** : plans gratuits/entrée de gamme suffisent au démarrage, passage à l’échelle selon usage.

## 6. Infrastructure Components

- **Load Balancer / Edge Network** : Vercel s’appuie sur un réseau de points de présence (CDN).
- **Cache** :
  - Edge caching sur Next.js (ISR) pour les pages publiques.
  - CDN Supabase pour les assets (PDF, images).
- **Bases de données** : PostgreSQL distribué via Supabase.
- **Fonctions serverless** : Next.js API routes, auto-scaling.

Ces composants travaillent ensemble pour réduire la latence, garantir un temps de chargement rapide et supporter les pics de trafic.

## 7. Security Measures

- **HTTPS/TLS** obligatoire sur tous les endpoints.
- **Supabase Auth** avec JWT, mot de passe hashé.
- **RLS (Row Level Security)** pour isoler données étudiants vs. admins.
- **Variables d’environnement** sécurisées (GPT-4o, Whapi).
- **Chiffrement at-rest** (PostgreSQL) et in-transit.
- **RGPD local (Gabon)** : consentement sur la collecte, possibilité de suppression de compte, politique de confidentialité en français.

## 8. Monitoring and Maintenance

- **Supabase Dashboard** : métriques de base de données, alertes.
- **Vercel Analytics** : trafic, temps de réponse.
- **Sentry (ou équivalent)** : suivi des erreurs backend JS.
- **Logs** : stockage des logs d’API Next.js pour diagnostic.
- **Backups automatiques** : Supabase prend en charge les sauvegardes journalières.
- **Mise à jour régulière** :
  - Suivi des versions de Next.js, packages npm.
  - Revue trimestrielle des RLS et des policies de sécurité.

## 9. Conclusion et Résumé

En combinant Supabase (auth, base, stockage) et des fonctions serverless Next.js sur Vercel, nous obtenons un backend :

- **Agile et modulaire** : chaque service gère un domaine précis.
- **Scalable** : montée en charge automatique, CDN global.
- **Sécurisé** : RLS, TLS, chiffrement, conformité RGPD gabonaise.
- **Évolutif** : ajout facile de nouvelles masterclasses, doublage de tests, rôles.  

Ce setup répond pleinement aux besoins de la plateforme d’inscription, d’évaluation pré/post masterclass, de notification WhatsApp et de gestion administrative, tout en restant ouvert à l’extension vers d’autres formations futures.