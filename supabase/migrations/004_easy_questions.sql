-- Migration pour remplacer les questions par des questions plus faciles pour débutants

-- Supprimer les anciennes questions
DELETE FROM questions;

-- Insérer des questions faciles et user-friendly pour débutants
DO $$
DECLARE
  v_masterclass_id uuid;
BEGIN
  -- Récupérer l'ID de la masterclass par défaut
  SELECT id INTO v_masterclass_id
  FROM masterclasses
  ORDER BY created_at
  LIMIT 1;

  -- Insérer les questions faciles si la masterclass existe
  IF v_masterclass_id IS NOT NULL THEN
    INSERT INTO questions (masterclass_id, question_text, choices, correct_choice) VALUES
    
    -- Question 1 : Très basique
    (v_masterclass_id, 
     'Que signifie "IA" ?',
     '{"A": "Internet Avancé", "B": "Intelligence Artificielle", "C": "Information Automatique", "D": "Informatique Appliquée"}',
     'B'),
    
    -- Question 2 : Concept simple
    (v_masterclass_id,
     'Quel est l''objectif principal de l''Intelligence Artificielle ?',
     '{"A": "Remplacer tous les humains", "B": "Créer des robots", "C": "Permettre aux machines d''apprendre et de résoudre des problèmes", "D": "Développer des jeux vidéo"}',
     'C'),
    
    -- Question 3 : Application courante
    (v_masterclass_id,
     'Parmi ces exemples, lequel utilise l''Intelligence Artificielle ?',
     '{"A": "Une calculatrice simple", "B": "Un assistant vocal comme Siri ou Alexa", "C": "Un livre papier", "D": "Une lampe électrique"}',
     'B'),
    
    -- Question 4 : Terme simple
    (v_masterclass_id,
     'Comment appelle-t-on le processus par lequel une IA apprend à partir de données ?',
     '{"A": "Programmation classique", "B": "Machine Learning (Apprentissage automatique)", "C": "Copier-coller", "D": "Téléchargement"}',
     'B'),
    
    -- Question 5 : Exemple concret
    (v_masterclass_id,
     'Quelle application utilise l''IA pour reconnaître les visages sur les photos ?',
     '{"A": "Bloc-notes", "B": "Calculatrice", "C": "Facebook ou Google Photos", "D": "Horloge"}',
     'C'),
    
    -- Question 6 : Concept de base
    (v_masterclass_id,
     'Qu''est-ce qu''un "algorithme" en informatique ?',
     '{"A": "Un type d''ordinateur", "B": "Une suite d''instructions pour résoudre un problème", "C": "Un langage de programmation", "D": "Un virus informatique"}',
     'B'),
    
    -- Question 7 : Application pratique
    (v_masterclass_id,
     'Quel service utilise l''IA pour recommander des films ou séries ?',
     '{"A": "Netflix ou YouTube", "B": "Microsoft Word", "C": "Paint", "D": "Bloc-notes"}',
     'A'),
    
    -- Question 8 : Concept accessible
    (v_masterclass_id,
     'Que fait un "chatbot" (robot conversationnel) ?',
     '{"A": "Il répare des ordinateurs", "B": "Il discute et répond aux questions des utilisateurs", "C": "Il crée des sites web", "D": "Il imprime des documents"}',
     'B'),
    
    -- Question 9 : Technologie courante
    (v_masterclass_id,
     'Quelle technologie permet à une voiture de se conduire toute seule ?',
     '{"A": "GPS uniquement", "B": "Intelligence Artificielle", "C": "Bluetooth", "D": "Wi-Fi"}',
     'B'),
    
    -- Question 10 : Futur accessible
    (v_masterclass_id,
     'Dans quel domaine l''IA peut-elle aider les médecins ?',
     '{"A": "Détecter des maladies sur des images médicales", "B": "Cuisiner des repas", "C": "Conduire des voitures", "D": "Écrire des livres"}',
     'A');
  END IF;
END $$;
