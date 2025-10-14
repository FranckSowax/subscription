-- ================================================
-- Migration 011: Remplacer par questions avancées
-- ================================================
-- Version avancée des questions avec contexte gabonais
-- Focus sur la compréhension critique et l'application pratique
-- ================================================

-- 1. Supprimer UNIQUEMENT les questions non utilisées dans des tests
-- Cela préserve les questions des tests déjà passés par les étudiants existants
DELETE FROM questions
WHERE id NOT IN (
  SELECT DISTINCT (jsonb_array_elements(responses)->>'question_id')::uuid
  FROM tests
  WHERE responses IS NOT NULL
  AND jsonb_array_length(responses) > 0
);

-- 2. Insérer les nouvelles questions PRÉ-INSCRIPTION (Test 1)
-- Objectif : évaluer la perception, la logique et les connaissances générales sur l'IA
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
    -- Questions PRÉ-INSCRIPTION - Compréhension initiale et perception critique
    INSERT INTO questions (masterclass_id, question_text, choices, correct_choice, test_type) VALUES
    
    -- Question 1
    (v_masterclass_id,
     'L''intelligence artificielle cherche avant tout à :',
     '{"A": "Remplacer l''être humain", "B": "Reproduire certaines formes d''intelligence humaine", "C": "Simuler des émotions pour créer l''empathie", "D": "Créer une conscience numérique"}',
     'B',
     'PRE'),
    
    -- Question 2
    (v_masterclass_id,
     'Si un étudiant gabonais utilise ChatGPT pour trouver un sujet de mémoire, il :',
     '{"A": "Triche dans son travail", "B": "Utilise un assistant d''aide à la réflexion, mais doit vérifier les sources", "C": "Remplace la recherche documentaire", "D": "Perd sa créativité"}',
     'B',
     'PRE'),
    
    -- Question 3
    (v_masterclass_id,
     'Parmi ces affirmations, laquelle est la plus exacte ?',
     '{"A": "L''IA comprend ce qu''elle écrit", "B": "L''IA analyse des données et génère des réponses selon des modèles statistiques", "C": "L''IA apprend seule sans données", "D": "L''IA décide comme un humain rationnel"}',
     'B',
     'PRE'),
    
    -- Question 4
    (v_masterclass_id,
     'Quelle situation illustre une dépendance excessive à l''IA ?',
     '{"A": "Utiliser ChatGPT pour structurer un mémoire", "B": "Demander à l''IA d''écrire intégralement le mémoire et le soumettre sans lecture", "C": "Employer Perplexity pour vérifier des sources", "D": "Créer un plan de cours avec Copilot"}',
     'B',
     'PRE'),
    
    -- Question 5
    (v_masterclass_id,
     'Un prompt efficace doit contenir :',
     '{"A": "Seulement la question à poser", "B": "Des mots-clés sans contexte", "C": "Un rôle, un objectif clair, et des contraintes précises", "D": "Le titre du document uniquement"}',
     'C',
     'PRE'),
    
    -- Question 6
    (v_masterclass_id,
     'L''IA pourrait favoriser l''entrepreneuriat au Gabon en :',
     '{"A": "Aidant à analyser des données de marché et concevoir des supports de communication", "B": "Créant automatiquement des entreprises", "C": "Éliminant les employés humains", "D": "Produisant des financements automatiques"}',
     'A',
     'PRE'),
    
    -- Question 7
    (v_masterclass_id,
     'Le principal risque d''un usage non critique de l''IA est :',
     '{"A": "Le gain de temps", "B": "La propagation d''informations fausses ou biaisées", "C": "La productivité élevée", "D": "La disparition du travail d''équipe"}',
     'B',
     'PRE'),
    
    -- Question 8
    (v_masterclass_id,
     'Parmi ces outils, lequel associe IA et création visuelle ?',
     '{"A": "Perplexity", "B": "Canva", "C": "Gemini", "D": "Copilot"}',
     'B',
     'PRE'),
    
    -- Question 9
    (v_masterclass_id,
     'Dans un contexte académique gabonais, l''IA peut :',
     '{"A": "Évaluer les étudiants automatiquement", "B": "Aider à rédiger, organiser et synthétiser les connaissances", "C": "Supprimer le rôle des professeurs", "D": "Noter les devoirs à la place du jury"}',
     'B',
     'PRE'),
    
    -- Question 10
    (v_masterclass_id,
     'Si une IA confond Libreville et Port-Gentil dans une réponse, cela illustre :',
     '{"A": "Un manque de respect pour le Gabon", "B": "Un biais ou une erreur de données contextuelles", "C": "Un bug du serveur", "D": "Un problème de traduction"}',
     'B',
     'PRE');
  END IF;
END $$;

-- 3. Insérer les nouvelles questions POST-MASTERCLASS (Test 2)
-- Objectif : évaluer la maîtrise, réflexion et éthique après formation
DO $$
DECLARE
  v_masterclass_id uuid;
BEGIN
  SELECT id INTO v_masterclass_id
  FROM masterclasses
  ORDER BY created_at
  LIMIT 1;

  IF v_masterclass_id IS NOT NULL THEN
    -- Questions POST-MASTERCLASS - Maîtrise, réflexion et éthique
    INSERT INTO questions (masterclass_id, question_text, choices, correct_choice, test_type) VALUES
    
    -- Question 1
    (v_masterclass_id,
     'Quel est le meilleur prompt pour obtenir une idée d''entreprise adaptée au Gabon ?',
     '{"A": "Donne-moi une idée de business", "B": "Tu es un expert en entrepreneuriat africain, propose-moi 3 idées réalistes pour un jeune à Libreville avec peu de moyens", "C": "Aide-moi à devenir riche", "D": "Trouve-moi une idée originale"}',
     'B',
     'POST'),
    
    -- Question 2
    (v_masterclass_id,
     'Si ChatGPT rédige un texte bien structuré mais factuellement faux, que faut-il faire ?',
     '{"A": "Le publier directement", "B": "Vérifier, reformuler et citer des sources fiables", "C": "Supprimer le texte", "D": "Lui demander d''être plus confiant"}',
     'B',
     'POST'),
    
    -- Question 3
    (v_masterclass_id,
     'Quelle est une bonne utilisation académique de l''IA ?',
     '{"A": "Copier un mémoire déjà rédigé", "B": "Générer un plan de travail et reformuler des idées en ses propres mots", "C": "Remplacer la soutenance par une vidéo IA", "D": "Laisser l''IA corriger les notes"}',
     'B',
     'POST'),
    
    -- Question 4
    (v_masterclass_id,
     'L''éthique en IA concerne surtout :',
     '{"A": "Le design des interfaces", "B": "La transparence, la responsabilité et le respect de la vie privée", "C": "L''efficacité technique", "D": "Le marketing numérique"}',
     'B',
     'POST'),
    
    -- Question 5
    (v_masterclass_id,
     'Un étudiant utilise Canva IA pour créer une affiche associative. Quelle erreur doit-il éviter ?',
     '{"A": "Copier des images sans licence", "B": "Ajouter trop de texte", "C": "Changer les couleurs", "D": "Ajouter un logo"}',
     'A',
     'POST'),
    
    -- Question 6
    (v_masterclass_id,
     'En entrepreneuriat, l''IA ne peut pas :',
     '{"A": "Générer des slogans", "B": "Remplacer la vision et la prise de décision humaine", "C": "Créer des modèles de plan d''affaires", "D": "Aider à simuler des coûts"}',
     'B',
     'POST'),
    
    -- Question 7
    (v_masterclass_id,
     'Si une IA traduit mal un proverbe fang, cela montre :',
     '{"A": "Une faiblesse linguistique", "B": "L''absence de contexte culturel dans ses données d''apprentissage", "C": "Une mauvaise connexion Internet", "D": "Une erreur d''utilisateur"}',
     'B',
     'POST'),
    
    -- Question 8
    (v_masterclass_id,
     'Pour éviter les biais dans les résultats d''une IA, il faut :',
     '{"A": "Poser des questions floues", "B": "Fournir un contexte clair et comparer plusieurs sources", "C": "Laisser l''IA apprendre seule", "D": "Redémarrer l''ordinateur"}',
     'B',
     'POST'),
    
    -- Question 9
    (v_masterclass_id,
     'L''un des bénéfices les plus concrets de l''IA pour les étudiants gabonais est :',
     '{"A": "La substitution des professeurs", "B": "L''amélioration de la productivité et de la qualité des travaux académiques", "C": "La suppression du travail collectif", "D": "L''accès automatique aux diplômes"}',
     'B',
     'POST'),
    
    -- Question 10
    (v_masterclass_id,
     'Quelle est la limite principale de l''IA générative dans le contexte gabonais ?',
     '{"A": "Son prix", "B": "Son manque de données locales et culturelles pertinentes", "C": "Son absence de connexion Internet", "D": "Sa lenteur d''exécution"}',
     'B',
     'POST');
  END IF;
END $$;

-- 4. Vérification
SELECT 
  test_type,
  COUNT(*) as nombre_questions
FROM questions
GROUP BY test_type
ORDER BY test_type;

-- 5. Commentaires
COMMENT ON TABLE questions IS 'Questions avancées avec contexte gabonais - Focus sur compréhension critique et application pratique';
