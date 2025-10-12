-- ================================================
-- Migration : Ajout des champs Filière et Niveau d'étude
-- ================================================

-- Ajouter la colonne field_of_study (Filière)
ALTER TABLE inscriptions
ADD COLUMN IF NOT EXISTS field_of_study TEXT;

-- Ajouter la colonne education_level (Niveau d'étude)
ALTER TABLE inscriptions
ADD COLUMN IF NOT EXISTS education_level TEXT;

-- Créer un index pour améliorer les performances des recherches/filtres
CREATE INDEX IF NOT EXISTS idx_inscriptions_field_of_study ON inscriptions(field_of_study);
CREATE INDEX IF NOT EXISTS idx_inscriptions_education_level ON inscriptions(education_level);

-- Commentaires pour documentation
COMMENT ON COLUMN inscriptions.field_of_study IS 'Filière d''étude du candidat (ex: Informatique, Mathématiques, etc.)';
COMMENT ON COLUMN inscriptions.education_level IS 'Niveau d''étude du candidat (ex: Licence, Master, Doctorat, etc.)';
