-- ============================================================
-- NETTOYAGE DES DONNÉES ORPHELINES
-- Après suppression de profiles/comptes auth
-- ============================================================

-- ÉTAPE 1: IDENTIFIER LES INSCRIPTIONS ORPHELINES
-- (inscriptions dont le profile_id n'existe plus)

SELECT 
    i.id as inscription_id,
    i.profile_id,
    i.validated,
    i.registration_date,
    COUNT(sb.id) as session_bookings_count,
    COUNT(t.id) as tests_count
FROM inscriptions i
LEFT JOIN profiles p ON i.profile_id = p.id
LEFT JOIN session_bookings sb ON i.id = sb.inscription_id
LEFT JOIN tests t ON i.id = t.inscription_id
WHERE p.id IS NULL  -- Profile n'existe plus
GROUP BY i.id, i.profile_id, i.validated, i.registration_date
ORDER BY i.registration_date DESC;

-- RÉSULTAT ATTENDU:
-- Liste des inscriptions dont le profile a été supprimé
-- avec le nombre de bookings et tests associés


-- ============================================================
-- ÉTAPE 2: NETTOYER LES SESSION_BOOKINGS ORPHELINS
-- ============================================================

DO $$
DECLARE
    v_deleted_bookings INTEGER;
    v_updated_sessions INTEGER;
    booking_record RECORD;
BEGIN
    -- Créer une table temporaire avec les bookings à supprimer
    CREATE TEMP TABLE temp_orphan_bookings AS
    SELECT 
        sb.id as booking_id,
        sb.session_id,
        sb.inscription_id,
        i.profile_id
    FROM session_bookings sb
    INNER JOIN inscriptions i ON sb.inscription_id = i.id
    LEFT JOIN profiles p ON i.profile_id = p.id
    WHERE p.id IS NULL;  -- Profile n'existe plus

    -- Décrémenter current_participants pour chaque session
    FOR booking_record IN 
        SELECT DISTINCT session_id, COUNT(*) as bookings_count
        FROM temp_orphan_bookings
        GROUP BY session_id
    LOOP
        UPDATE sessions
        SET current_participants = GREATEST(0, current_participants - booking_record.bookings_count)
        WHERE id = booking_record.session_id;
        
        RAISE NOTICE 'Session % : décrémenté de % participants', 
            booking_record.session_id, booking_record.bookings_count;
    END LOOP;

    GET DIAGNOSTICS v_updated_sessions = ROW_COUNT;

    -- Supprimer les bookings orphelins
    DELETE FROM session_bookings
    WHERE id IN (SELECT booking_id FROM temp_orphan_bookings);

    GET DIAGNOSTICS v_deleted_bookings = ROW_COUNT;

    -- Afficher le résultat
    RAISE NOTICE '====================================';
    RAISE NOTICE 'NETTOYAGE TERMINÉ:';
    RAISE NOTICE '- Bookings supprimés: %', v_deleted_bookings;
    RAISE NOTICE '- Sessions mises à jour: %', v_updated_sessions;
    RAISE NOTICE '====================================';

    -- Nettoyer la table temporaire
    DROP TABLE temp_orphan_bookings;
END $$;


-- ============================================================
-- ÉTAPE 3: NETTOYER LES TESTS ORPHELINS
-- ============================================================

DO $$
DECLARE
    v_deleted_tests INTEGER;
BEGIN
    -- Supprimer les tests dont l'inscription n'a plus de profile
    DELETE FROM tests
    WHERE inscription_id IN (
        SELECT i.id
        FROM inscriptions i
        LEFT JOIN profiles p ON i.profile_id = p.id
        WHERE p.id IS NULL
    );

    GET DIAGNOSTICS v_deleted_tests = ROW_COUNT;

    RAISE NOTICE '====================================';
    RAISE NOTICE 'Tests orphelins supprimés: %', v_deleted_tests;
    RAISE NOTICE '====================================';
END $$;


-- ============================================================
-- ÉTAPE 4: NETTOYER LES INSCRIPTIONS ORPHELINES
-- ============================================================

DO $$
DECLARE
    v_deleted_inscriptions INTEGER;
BEGIN
    -- Supprimer les inscriptions dont le profile n'existe plus
    DELETE FROM inscriptions
    WHERE id IN (
        SELECT i.id
        FROM inscriptions i
        LEFT JOIN profiles p ON i.profile_id = p.id
        WHERE p.id IS NULL
    );

    GET DIAGNOSTICS v_deleted_inscriptions = ROW_COUNT;

    RAISE NOTICE '====================================';
    RAISE NOTICE 'Inscriptions orphelines supprimées: %', v_deleted_inscriptions;
    RAISE NOTICE '====================================';
END $$;


-- ============================================================
-- ÉTAPE 5: VÉRIFICATION FINALE
-- ============================================================

-- Vérifier qu'il ne reste plus de données orphelines
SELECT 
    'Inscriptions sans profile' as type,
    COUNT(*) as count
FROM inscriptions i
LEFT JOIN profiles p ON i.profile_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Bookings sans profile' as type,
    COUNT(*) as count
FROM session_bookings sb
INNER JOIN inscriptions i ON sb.inscription_id = i.id
LEFT JOIN profiles p ON i.profile_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Tests sans profile' as type,
    COUNT(*) as count
FROM tests t
INNER JOIN inscriptions i ON t.inscription_id = i.id
LEFT JOIN profiles p ON i.profile_id = p.id
WHERE p.id IS NULL;

-- RÉSULTAT ATTENDU: Tous les counts devraient être 0


-- ============================================================
-- ÉTAPE 6: VÉRIFIER LES COMPTEURS DE SESSIONS
-- ============================================================

-- Comparer current_participants avec le nombre réel de bookings
SELECT 
    s.id,
    s.session_date,
    s.start_time,
    s.current_participants as compteur_actuel,
    COUNT(sb.id) as bookings_reels,
    (s.current_participants - COUNT(sb.id)) as difference
FROM sessions s
LEFT JOIN session_bookings sb ON s.id = sb.session_id
GROUP BY s.id, s.session_date, s.start_time, s.current_participants
HAVING s.current_participants != COUNT(sb.id)
ORDER BY s.session_date, s.start_time;

-- Si différence > 0 : Des bookings ont été supprimés mais compteur pas mis à jour
-- Si différence < 0 : Des bookings existent mais ne sont pas comptés


-- ============================================================
-- BONUS: CORRIGER LES COMPTEURS DE PARTICIPANTS
-- (Si vous constatez des différences à l'étape 6)
-- ============================================================

DO $$
DECLARE
    session_record RECORD;
    v_updated_count INTEGER := 0;
BEGIN
    FOR session_record IN 
        SELECT 
            s.id,
            COUNT(sb.id) as real_count,
            s.current_participants as old_count
        FROM sessions s
        LEFT JOIN session_bookings sb ON s.id = sb.session_id
        GROUP BY s.id, s.current_participants
        HAVING s.current_participants != COUNT(sb.id)
    LOOP
        UPDATE sessions
        SET current_participants = session_record.real_count
        WHERE id = session_record.id;
        
        v_updated_count := v_updated_count + 1;
        
        RAISE NOTICE 'Session % : % -> % participants', 
            session_record.id, 
            session_record.old_count, 
            session_record.real_count;
    END LOOP;

    RAISE NOTICE '====================================';
    RAISE NOTICE 'Sessions corrigées: %', v_updated_count;
    RAISE NOTICE '====================================';
END $$;


-- ============================================================
-- NOTES IMPORTANTES
-- ============================================================

/*
ORDRE D'EXÉCUTION RECOMMANDÉ:

1. ÉTAPE 1 (SELECT) : Identifier les données orphelines
   → Examiner les résultats pour confirmer

2. ÉTAPE 2 : Nettoyer les session_bookings
   → Décrémente automatiquement current_participants

3. ÉTAPE 3 : Nettoyer les tests

4. ÉTAPE 4 : Nettoyer les inscriptions

5. ÉTAPE 5 (SELECT) : Vérification finale
   → Tous les counts = 0 = succès

6. ÉTAPE 6 (SELECT) : Vérifier cohérence compteurs
   → Si problème, exécuter BONUS

7. BONUS (optionnel) : Corriger les compteurs
   → Recalcule current_participants = nombre réel de bookings


CASCADE ON DELETE:
- Si vous supprimez une inscription, les bookings/tests sont supprimés auto
- Si vous supprimez un profile, l'inscription RESTE (pas de cascade)
- Ce script nettoie les inscriptions orphelines restantes


PRÉVENTION FUTURE:
Pour éviter ce problème, toujours supprimer les profiles via:
  DELETE FROM profiles WHERE id = 'xxx';
Au lieu de supprimer directement dans auth.users

Ou ajouter un trigger qui cascade la suppression.
*/
