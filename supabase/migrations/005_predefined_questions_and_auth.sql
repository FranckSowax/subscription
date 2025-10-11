-- Migration pour ajouter les questions pré-définies et le système d'authentification étudiants

-- 1. Ajouter la colonne test_type à la table questions si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE questions ADD COLUMN test_type VARCHAR(10) DEFAULT 'PRE' CHECK (test_type IN ('PRE', 'POST'));
  END IF;
END $$;

-- 2. Supprimer les anciennes questions générées
DELETE FROM questions;

-- 3. Ajouter les questions PRE-INSCRIPTION (Test 1)
DO $$
DECLARE
  v_masterclass_id uuid;
BEGIN
  -- Récupérer l'ID de la masterclass
  SELECT id INTO v_masterclass_id
  FROM masterclasses
  ORDER BY created_at
  LIMIT 1;

  IF v_masterclass_id IS NOT NULL THEN
    -- Questions PRE-INSCRIPTION (niveau débutant)
    INSERT INTO questions (masterclass_id, question_text, choices, correct_choice, test_type) VALUES
    
    (v_masterclass_id,
     'Qu''est-ce que l''intelligence artificielle ?',
     '{"A": "Une science magique", "B": "Un robot uniquement", "C": "Une technologie qui imite certaines capacités humaines", "D": "Une nouvelle langue"}',
     'C',
     'PRE'),
    
    (v_masterclass_id,
     'L''IA est-elle déjà présente dans notre vie quotidienne ?',
     '{"A": "Non, c''est trop récent", "B": "Oui, mais on ne s''en rend pas toujours compte", "C": "Uniquement dans les films", "D": "Seulement dans les labos"}',
     'B',
     'PRE'),
    
    (v_masterclass_id,
     'Quel outil est un exemple d''IA générative ?',
     '{"A": "Word", "B": "ChatGPT", "C": "Excel", "D": "PowerPoint"}',
     'B',
     'PRE'),
    
    (v_masterclass_id,
     'Lequel de ces secteurs n''utilise pas l''IA ?',
     '{"A": "Santé", "B": "Agriculture", "C": "Cuisine traditionnelle manuelle", "D": "Finance"}',
     'C',
     'PRE'),
    
    (v_masterclass_id,
     'À quoi sert un prompt ?',
     '{"A": "Mise à jour", "B": "Question/commande à l''IA", "C": "Logiciel", "D": "Image"}',
     'B',
     'PRE'),
    
    (v_masterclass_id,
     'Une IA peut-elle produire un texte ?',
     '{"A": "Non", "B": "Oui, si bien entraînée", "C": "Uniquement des images", "D": "Jamais sans humain"}',
     'B',
     'PRE'),
    
    (v_masterclass_id,
     'Quelle IA est de Google ?',
     '{"A": "Gemini", "B": "ChatGPT", "C": "Copilot", "D": "Bard"}',
     'A',
     'PRE'),
    
    (v_masterclass_id,
     'L''IA peut-elle avoir des biais ?',
     '{"A": "Non", "B": "Oui, à cause des données", "C": "Rarement", "D": "Seulement en maths"}',
     'B',
     'PRE'),
    
    (v_masterclass_id,
     'Quel outil permet de créer des visuels ?',
     '{"A": "Canva", "B": "Perplexity", "C": "Word", "D": "Google Docs"}',
     'A',
     'PRE'),
    
    (v_masterclass_id,
     'Que signifie "IA générative" ?',
     '{"A": "IA qui comprend les émotions", "B": "IA qui génère du contenu", "C": "IA pour l''électricité", "D": "IA militaire"}',
     'B',
     'PRE');
  END IF;
END $$;

-- 4. Créer les questions POST-MASTERCLASS
DO $$
DECLARE
  v_masterclass_id uuid;
BEGIN
  SELECT id INTO v_masterclass_id
  FROM masterclasses
  ORDER BY created_at
  LIMIT 1;

  IF v_masterclass_id IS NOT NULL THEN
    -- Questions POST-MASTERCLASS (validation des acquis)
    INSERT INTO questions (masterclass_id, question_text, choices, correct_choice, test_type) VALUES
    
    (v_masterclass_id,
     'Structure d''un bon prompt ?',
     '{"A": "Objectif – Format – Rôle", "B": "Contexte – Rôle – Objectif – Format – Ton – Contraintes", "C": "Sujet – Verbe – Complément", "D": "Titre – Image – Résumé"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Règle d''or N°1 du prompt ?',
     '{"A": "Écrire vite", "B": "Être flou", "C": "Donner du contexte", "D": "Copier-coller"}',
     'C',
     'POST'),
    
    (v_masterclass_id,
     'Outil académique IA ?',
     '{"A": "Canva", "B": "ChatGPT / Perplexity", "C": "Google Maps", "D": "PowerPoint"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Activité de l''atelier pratique ?',
     '{"A": "Lecture", "B": "Prompt Battle", "C": "Jeu de société", "D": "Création PDF"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Pourquoi IA peut être biaisée ?',
     '{"A": "Toujours exacte", "B": "Données d''entraînement", "C": "Ne dort pas", "D": "Pas d''Internet"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Outil IA pour créer un CV ?',
     '{"A": "ChatGPT", "B": "Canva", "C": "Excel", "D": "Perplexity"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Rôle de l''éthique en IA ?',
     '{"A": "Aucun", "B": "Performance", "C": "Usage responsable", "D": "Créer des lois"}',
     'C',
     'POST'),
    
    (v_masterclass_id,
     'IA remplacera-t-elle les humains ?',
     '{"A": "Oui", "B": "Non, elle les rendra meilleurs", "C": "En cuisine", "D": "Dans 1000 ans"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Objectif du mini-projet ?',
     '{"A": "Créer une app IA", "B": "Idée d''usage local", "C": "Noter les autres groupes", "D": "Refaire le cours"}',
     'B',
     'POST'),
    
    (v_masterclass_id,
     'Nom de l''IA de Microsoft ?',
     '{"A": "Gemini", "B": "Bard", "C": "Copilot", "D": "Watson"}',
     'C',
     'POST');
  END IF;
END $$;

-- 5. Créer une table pour les sessions d'authentification étudiants
CREATE TABLE IF NOT EXISTS student_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Index pour recherche rapide par token
CREATE INDEX IF NOT EXISTS idx_student_auth_tokens_token ON student_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_student_auth_tokens_profile ON student_auth_tokens(profile_id);

-- 6. Activer RLS sur student_auth_tokens
ALTER TABLE student_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Politique : Les étudiants peuvent voir leurs propres tokens
CREATE POLICY "Students can view their own tokens"
  ON student_auth_tokens
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Politique : Permettre l'insertion de tokens (pour l'API)
CREATE POLICY "Allow token creation"
  ON student_auth_tokens
  FOR INSERT
  WITH CHECK (true);

-- 7. Fonction pour nettoyer les tokens expirés
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM student_auth_tokens
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Ajouter une colonne pour suivre si l'étudiant a complété le test POST
ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS post_test_completed BOOLEAN DEFAULT FALSE;

-- 9. Trigger pour mettre à jour post_test_completed
CREATE OR REPLACE FUNCTION update_post_test_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'POST' THEN
    UPDATE inscriptions
    SET post_test_completed = TRUE
    WHERE id = NEW.inscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_test_status
  AFTER INSERT ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_post_test_status();

-- 10. Vue pour le dashboard étudiant
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

-- 11. Commentaires
COMMENT ON TABLE student_auth_tokens IS 'Tokens d''authentification pour les sessions étudiants';
COMMENT ON VIEW student_dashboard IS 'Vue complète du dashboard étudiant avec historique des tests';
