-- ============================================================
-- LISTE DES INSCRIPTIONS INCOMPLÈTES (SANS TEST)
-- ============================================================

-- OPTION 1: LISTE DÉTAILLÉE DES INSCRITS SANS PRÉ-TEST
-- (Ceux qui ont choisi une session mais pas passé le test)

SELECT 
    i.id as inscription_id,
    i.registration_date,
    p.full_name,
    p.whatsapp_number,
    p.gender,
    i.field_of_study,
    i.education_level,
    i.validated,
    i.selected_session_id,
    s.session_date,
    CASE 
        WHEN i.selected_session_id IS NOT NULL THEN 'Session choisie'
        ELSE 'Pas de session'
    END as statut_session,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM tests t 
            WHERE t.inscription_id = i.id AND t.type = 'PRE'
        ) THEN 'Test passé'
        ELSE 'Test NON passé'
    END as statut_test
FROM inscriptions i
INNER JOIN profiles p ON i.profile_id = p.id
LEFT JOIN sessions s ON i.selected_session_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
)
ORDER BY i.registration_date DESC;


-- ============================================================
-- OPTION 2: STATISTIQUES PAR STATUT
-- ============================================================

SELECT 
    CASE 
        WHEN i.selected_session_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM tests t WHERE t.inscription_id = i.id AND t.type = 'PRE'
        ) THEN 'Session choisie, test NON passé'
        WHEN i.selected_session_id IS NULL AND NOT EXISTS (
            SELECT 1 FROM tests t WHERE t.inscription_id = i.id AND t.type = 'PRE'
        ) THEN 'Ni session ni test'
        ELSE 'Autre'
    END as statut,
    COUNT(*) as nombre_inscrits,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inscriptions), 2) as pourcentage
FROM inscriptions i
WHERE NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
)
GROUP BY 
    CASE 
        WHEN i.selected_session_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM tests t WHERE t.inscription_id = i.id AND t.type = 'PRE'
        ) THEN 'Session choisie, test NON passé'
        WHEN i.selected_session_id IS NULL AND NOT EXISTS (
            SELECT 1 FROM tests t WHERE t.inscription_id = i.id AND t.type = 'PRE'
        ) THEN 'Ni session ni test'
        ELSE 'Autre'
    END;


-- ============================================================
-- OPTION 3: AVEC INFORMATIONS EMAIL (AUTH)
-- ============================================================

SELECT 
    i.id as inscription_id,
    i.registration_date,
    p.full_name,
    p.whatsapp_number,
    au.email,
    i.field_of_study,
    i.validated,
    CASE 
        WHEN i.selected_session_id IS NOT NULL THEN 'OUI'
        ELSE 'NON'
    END as a_choisi_session,
    s.session_date,
    EXTRACT(DAY FROM (NOW() - i.registration_date)) as jours_depuis_inscription
FROM inscriptions i
INNER JOIN profiles p ON i.profile_id = p.id
INNER JOIN auth.users au ON p.id = au.id
LEFT JOIN sessions s ON i.selected_session_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
)
ORDER BY i.registration_date DESC;


-- ============================================================
-- OPTION 4: EXPORT POUR RELANCE (FORMAT WHATSAPP)
-- ============================================================

SELECT 
    p.full_name as nom_complet,
    p.whatsapp_number as numero_whatsapp,
    TO_CHAR(i.registration_date, 'DD/MM/YYYY') as date_inscription,
    EXTRACT(DAY FROM (NOW() - i.registration_date)) as jours_ecoules,
    CASE 
        WHEN i.selected_session_id IS NOT NULL 
        THEN TO_CHAR(s.session_date, 'DD/MM/YYYY')
        ELSE 'Aucune session choisie'
    END as session_choisie
FROM inscriptions i
INNER JOIN profiles p ON i.profile_id = p.id
LEFT JOIN sessions s ON i.selected_session_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
)
ORDER BY i.registration_date DESC;


-- ============================================================
-- OPTION 5: FOCUS SUR CEUX QUI ONT CHOISI UNE SESSION
-- (Mais pas passé le test = plus grave)
-- ============================================================

SELECT 
    p.full_name,
    p.whatsapp_number,
    s.session_date,
    TO_CHAR(i.registration_date, 'DD/MM/YYYY HH24:MI') as date_inscription,
    EXTRACT(DAY FROM (NOW() - i.registration_date)) as jours_depuis_inscription,
    CASE 
        WHEN EXTRACT(DAY FROM (NOW() - i.registration_date)) > 7 
        THEN '⚠️ Plus de 7 jours'
        WHEN EXTRACT(DAY FROM (NOW() - i.registration_date)) > 3 
        THEN '⚡ Plus de 3 jours'
        ELSE '✅ Récent'
    END as urgence
FROM inscriptions i
INNER JOIN profiles p ON i.profile_id = p.id
INNER JOIN sessions s ON i.selected_session_id = s.id
WHERE i.selected_session_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
)
ORDER BY i.registration_date ASC;


-- ============================================================
-- OPTION 6: GROUPÉ PAR SESSION
-- (Voir combien ont choisi chaque session mais pas passé le test)
-- ============================================================

SELECT 
    s.session_date,
    s.max_participants,
    s.current_participants as places_reservees,
    COUNT(i.id) as inscriptions_sans_test,
    (s.current_participants - COUNT(i.id)) as places_reellement_confirmees
FROM sessions s
LEFT JOIN inscriptions i ON i.selected_session_id = s.id
    AND NOT EXISTS (
        SELECT 1 FROM tests t 
        WHERE t.inscription_id = i.id AND t.type = 'PRE'
    )
GROUP BY s.id, s.session_date, s.max_participants, s.current_participants
HAVING COUNT(i.id) > 0
ORDER BY s.session_date;


-- ============================================================
-- OPTION 7: EXPORT CSV COMPLET
-- (Pour analyse externe ou envoi email)
-- ============================================================

SELECT 
    i.id as "ID Inscription",
    p.full_name as "Nom Complet",
    au.email as "Email",
    p.whatsapp_number as "WhatsApp",
    p.gender as "Genre",
    i.field_of_study as "Domaine d'étude",
    i.education_level as "Niveau d'études",
    TO_CHAR(i.registration_date, 'DD/MM/YYYY HH24:MI:SS') as "Date d'inscription",
    CASE 
        WHEN i.selected_session_id IS NOT NULL 
        THEN TO_CHAR(s.session_date, 'DD/MM/YYYY')
        ELSE 'Non choisie'
    END as "Session choisie",
    i.validated as "Validé",
    EXTRACT(DAY FROM (NOW() - i.registration_date)) as "Jours écoulés"
FROM inscriptions i
INNER JOIN profiles p ON i.profile_id = p.id
INNER JOIN auth.users au ON p.id = au.id
LEFT JOIN sessions s ON i.selected_session_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM tests t 
    WHERE t.inscription_id = i.id AND t.type = 'PRE'
)
ORDER BY i.registration_date DESC;


-- ============================================================
-- NOTES D'UTILISATION
-- ============================================================

/*
CHOIX DE LA REQUÊTE SELON VOS BESOINS:

✅ OPTION 1: Vue d'ensemble simple
   → Tous les inscrits sans test avec leur statut

✅ OPTION 2: Statistiques globales
   → Combien sont dans chaque catégorie

✅ OPTION 3: Avec emails (pour relance email)
   → Liste complète avec adresses email

✅ OPTION 4: Format WhatsApp (pour relance manuelle)
   → Nom + numéro + infos clés

✅ OPTION 5: PRIORITAIRE (session choisie mais pas de test)
   → Ceux qui ont commencé le processus mais pas terminé
   → Avec niveau d'urgence

✅ OPTION 6: Par session
   → Voir l'impact sur chaque session
   → Places "bloquées" par des gens qui n'ont pas testé

✅ OPTION 7: Export CSV complet
   → Pour analyse Excel/Google Sheets


UTILISATION TYPIQUE:

1. Exécuter OPTION 2 pour voir les statistiques
2. Exécuter OPTION 5 pour identifier les prioritaires
3. Exécuter OPTION 4 ou 7 pour exporter et relancer


RELANCE RECOMMANDÉE:

Pour ceux avec session choisie mais pas de test:
"Bonjour [Nom], vous avez réservé la session du [Date].
Pour finaliser votre inscription, merci de compléter le pré-test ici: [Lien]"

Pour ceux sans session:
"Bonjour [Nom], pour finaliser votre inscription,
choisissez votre date de masterclass: [Lien]"
*/
