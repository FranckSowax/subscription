# 🗄️ Appliquer Toutes les Migrations Supabase

## ⚠️ Erreur Actuelle

```
ERROR: 42P01: relation "profiles" does not exist
```

**Cause :** La table `profiles` n'existe pas encore. Vous devez appliquer les migrations dans l'ordre.

---

## ✅ Solution : Appliquer les Migrations dans l'Ordre

### Étape 1 : Accéder à Supabase SQL Editor

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard/project/apqpsyugdmvrzaprugvw)
2. Cliquer sur **SQL Editor** (menu gauche)
3. Cliquer sur **New query**

---

### Étape 2 : Appliquer les Migrations Une par Une

#### Migration 1 : Schéma Initial

```sql
-- 001_initial_schema.sql
-- Création des tables de base

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  whatsapp_number text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Masterclasses table
CREATE TABLE IF NOT EXISTS masterclasses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Masterclass sessions table
CREATE TABLE IF NOT EXISTS masterclass_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  masterclass_id uuid REFERENCES masterclasses(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  max_participants integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now()
);

-- Inscriptions table
CREATE TABLE IF NOT EXISTS inscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  masterclass_id uuid REFERENCES masterclasses(id) ON DELETE CASCADE,
  registration_date timestamp with time zone DEFAULT now(),
  validated boolean DEFAULT false
);

-- Session bookings table
CREATE TABLE IF NOT EXISTS session_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscription_id uuid REFERENCES inscriptions(id) ON DELETE CASCADE,
  session_id uuid REFERENCES masterclass_sessions(id) ON DELETE CASCADE,
  booking_date timestamp with time zone DEFAULT now(),
  UNIQUE(inscription_id)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  masterclass_id uuid REFERENCES masterclasses(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  choices jsonb NOT NULL,
  correct_choice text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscription_id uuid REFERENCES inscriptions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('PRE', 'POST')),
  score integer,
  max_score integer,
  taken_at timestamp with time zone DEFAULT now()
);

-- Test answers table
CREATE TABLE IF NOT EXISTS test_answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  selected_choice text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamp with time zone DEFAULT now()
);

-- Student auth tokens table
CREATE TABLE IF NOT EXISTS student_auth_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inscriptions_profile ON inscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_inscription ON session_bookings(inscription_id);
CREATE INDEX IF NOT EXISTS idx_tests_inscription ON tests(inscription_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_test ON test_answers(test_id);
CREATE INDEX IF NOT EXISTS idx_student_auth_tokens_token ON student_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_student_auth_tokens_profile ON student_auth_tokens(profile_id);
```

**Cliquer sur "Run"** ✅

---

#### Migration 2 : Masterclass par Défaut

```sql
-- 002_safe_migration.sql
-- Insertion de la masterclass par défaut

-- Insert default masterclass if not exists
INSERT INTO masterclasses (id, title, description)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Introduction à l''Intelligence Artificielle',
  'Masterclass d''introduction aux concepts fondamentaux de l''IA'
WHERE NOT EXISTS (
  SELECT 1 FROM masterclasses WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);
```

**Cliquer sur "Run"** ✅

---

#### Migration 3 : 12 Sessions

```sql
-- 003_add_sessions.sql
-- Ajout des 12 sessions de masterclass

-- Insert 12 sessions for the default masterclass
INSERT INTO masterclass_sessions (masterclass_id, session_date, max_participants)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  date,
  30
FROM (
  VALUES
    ('2025-01-15'::date),
    ('2025-01-22'::date),
    ('2025-01-29'::date),
    ('2025-02-05'::date),
    ('2025-02-12'::date),
    ('2025-02-19'::date),
    ('2025-02-26'::date),
    ('2025-03-05'::date),
    ('2025-03-12'::date),
    ('2025-03-19'::date),
    ('2025-03-26'::date),
    ('2025-04-02'::date)
) AS dates(date)
WHERE NOT EXISTS (
  SELECT 1 FROM masterclass_sessions 
  WHERE masterclass_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND session_date = dates.date
);
```

**Cliquer sur "Run"** ✅

---

#### Migration 4 : Questions PRE/POST

```sql
-- 004_easy_questions.sql
-- Ajout des questions pré-définies (10 PRE + 10 POST)

-- Delete existing questions to avoid duplicates
DELETE FROM questions WHERE masterclass_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Insert 10 PRE questions (very easy)
INSERT INTO questions (masterclass_id, question_text, choices, correct_choice) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Que signifie IA ?', 
 '{"A": "Internet Avancé", "B": "Intelligence Artificielle", "C": "Information Automatique", "D": "Interface Audio"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quel assistant vocal utilise l''IA ?', 
 '{"A": "Siri", "B": "Excel", "C": "Paint", "D": "Bloc-notes"}', 'A'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quelle application utilise l''IA pour recommander des films ?', 
 '{"A": "Word", "B": "Netflix", "C": "Calculatrice", "D": "Horloge"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA peut-elle reconnaître des visages sur des photos ?', 
 '{"A": "Oui", "B": "Non", "C": "Seulement en noir et blanc", "D": "Uniquement les animaux"}', 'A'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quel réseau social utilise l''IA pour organiser votre fil d''actualité ?', 
 '{"A": "Bloc-notes", "B": "Paint", "C": "Facebook", "D": "Calculatrice"}', 'C'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA est-elle utilisée dans les voitures autonomes ?', 
 '{"A": "Oui", "B": "Non", "C": "Seulement les vélos", "D": "Uniquement les avions"}', 'A'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quel service utilise l''IA pour traduire des textes ?', 
 '{"A": "Google Translate", "B": "Bloc-notes", "C": "Paint", "D": "Horloge"}', 'A'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA peut-elle jouer aux échecs ?', 
 '{"A": "Non", "B": "Oui", "C": "Seulement aux dames", "D": "Uniquement au poker"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quelle application utilise l''IA pour identifier des objets dans des photos ?', 
 '{"A": "Calculatrice", "B": "Google Photos", "C": "Bloc-notes", "D": "Paint"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA est-elle utilisée dans les chatbots (robots conversationnels) ?', 
 '{"A": "Non", "B": "Seulement pour les jeux", "C": "Oui", "D": "Uniquement pour la musique"}', 'C');

-- Insert 10 POST questions (slightly more advanced)
INSERT INTO questions (masterclass_id, question_text, choices, correct_choice) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Qu''est-ce que le Machine Learning ?', 
 '{"A": "Un type de machine", "B": "Une méthode d''apprentissage automatique", "C": "Un logiciel de dessin", "D": "Un jeu vidéo"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quel est le rôle principal d''un algorithme en IA ?', 
 '{"A": "Dessiner des images", "B": "Résoudre des problèmes et prendre des décisions", "C": "Jouer de la musique", "D": "Écrire des livres"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Qu''est-ce qu''un réseau de neurones artificiels ?', 
 '{"A": "Un réseau social", "B": "Un modèle inspiré du cerveau humain", "C": "Un câble électrique", "D": "Un type de wifi"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA peut-elle apprendre de ses erreurs ?', 
 '{"A": "Non, jamais", "B": "Oui, grâce au Machine Learning", "C": "Seulement le lundi", "D": "Uniquement avec un professeur"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Qu''est-ce que le Deep Learning ?', 
 '{"A": "Plonger en profondeur", "B": "Une forme avancée de Machine Learning", "C": "Un jeu vidéo", "D": "Une application de dessin"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quel type de données l''IA utilise-t-elle pour apprendre ?', 
 '{"A": "Des données", "B": "De l''eau", "C": "Du papier", "D": "De l''air"}', 'A'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA peut-elle créer de l''art (peintures, musique) ?', 
 '{"A": "Non", "B": "Oui", "C": "Seulement de la musique", "D": "Uniquement des sculptures"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Qu''est-ce qu''un chatbot ?', 
 '{"A": "Un robot physique", "B": "Un programme qui simule une conversation", "C": "Un jeu de chat", "D": "Une application de dessin"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'L''IA est-elle utilisée dans le diagnostic médical ?', 
 '{"A": "Non", "B": "Oui", "C": "Seulement pour les animaux", "D": "Uniquement pour les plantes"}', 'B'),

('00000000-0000-0000-0000-000000000001'::uuid, 'Quel est un exemple d''utilisation de l''IA dans notre quotidien ?', 
 '{"A": "Recommandations personnalisées sur Netflix", "B": "Ouvrir une porte", "C": "Boire de l''eau", "D": "Marcher"}', 'A');
```

**Cliquer sur "Run"** ✅

---

#### Migration 5 : Vue Dashboard & Auth

```sql
-- 005_predefined_questions_and_auth.sql
-- Vue pour le dashboard étudiant

-- Create student dashboard view
CREATE OR REPLACE VIEW student_dashboard AS
SELECT 
  p.id as profile_id,
  p.full_name,
  au.email,
  i.id as inscription_id,
  i.validated,
  i.registration_date as inscription_date,
  sb.session_id,
  ms.session_date,
  -- Test PRE
  (SELECT id FROM tests WHERE inscription_id = i.id AND type = 'PRE' LIMIT 1) as pre_test_id,
  (SELECT score FROM tests WHERE inscription_id = i.id AND type = 'PRE' LIMIT 1) as pre_test_score,
  (SELECT max_score FROM tests WHERE inscription_id = i.id AND type = 'PRE' LIMIT 1) as pre_test_max_score,
  (SELECT taken_at FROM tests WHERE inscription_id = i.id AND type = 'PRE' LIMIT 1) as pre_test_date,
  -- Test POST
  (SELECT id FROM tests WHERE inscription_id = i.id AND type = 'POST' LIMIT 1) as post_test_id,
  (SELECT score FROM tests WHERE inscription_id = i.id AND type = 'POST' LIMIT 1) as post_test_score,
  (SELECT max_score FROM tests WHERE inscription_id = i.id AND type = 'POST' LIMIT 1) as post_test_max_score,
  (SELECT taken_at FROM tests WHERE inscription_id = i.id AND type = 'POST' LIMIT 1) as post_test_date,
  -- Disponibilité du test POST (après la date de la masterclass)
  CASE 
    WHEN ms.session_date IS NOT NULL AND ms.session_date <= CURRENT_DATE THEN TRUE
    ELSE FALSE
  END as post_test_available
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN inscriptions i ON p.id = i.profile_id
LEFT JOIN session_bookings sb ON i.id = sb.inscription_id
LEFT JOIN masterclass_sessions ms ON sb.session_id = ms.id;
```

**Cliquer sur "Run"** ✅

---

#### Migration 6 : Rendre date_of_birth Optionnel

```sql
-- 006_make_date_of_birth_optional.sql
-- Rendre date_of_birth optionnel

ALTER TABLE profiles 
ALTER COLUMN date_of_birth DROP NOT NULL;

COMMENT ON COLUMN profiles.date_of_birth IS 'Optional date of birth field';
```

**Cliquer sur "Run"** ✅

---

### Étape 3 : Vérifier les Tables

```sql
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Résultat attendu :**
```
table_name
-------------------
inscriptions
masterclass_sessions
masterclasses
profiles
questions
session_bookings
student_auth_tokens
test_answers
tests
```

---

### Étape 4 : Vérifier les Données

```sql
-- Vérifier la masterclass
SELECT * FROM masterclasses;

-- Vérifier les sessions (devrait avoir 12 lignes)
SELECT COUNT(*) as total_sessions FROM masterclass_sessions;

-- Vérifier les questions (devrait avoir 20 lignes : 10 PRE + 10 POST)
SELECT COUNT(*) as total_questions FROM questions;
```

---

## ✅ Après Toutes les Migrations

### Tester l'Inscription

1. Aller sur : https://subscriptionstudia.netlify.app
2. Remplir le formulaire
3. Cliquer sur "Choisir la date de session"
4. ✅ Devrait fonctionner !

---

## 📋 Checklist

- [ ] Migration 1 : Schéma initial (tables)
- [ ] Migration 2 : Masterclass par défaut
- [ ] Migration 3 : 12 sessions
- [ ] Migration 4 : 20 questions (10 PRE + 10 POST)
- [ ] Migration 5 : Vue dashboard
- [ ] Migration 6 : date_of_birth optionnel
- [ ] Vérifier les tables
- [ ] Vérifier les données
- [ ] Tester l'inscription

---

## 🎯 Résumé

**Ordre d'exécution :**
1. ✅ 001 - Créer les tables
2. ✅ 002 - Ajouter masterclass
3. ✅ 003 - Ajouter 12 sessions
4. ✅ 004 - Ajouter 20 questions
5. ✅ 005 - Créer vue dashboard
6. ✅ 006 - Rendre date_of_birth optionnel

**Après toutes les migrations, l'application sera 100% fonctionnelle ! 🎉**
