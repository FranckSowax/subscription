-- Script pour déboguer les réservations de sessions
-- Vérifier si les sessions sont correctement enregistrées

-- ================================================
-- 1. VÉRIFIER LES RÉSERVATIONS EXISTANTES
-- ================================================

-- Voir toutes les réservations avec détails
SELECT 
  sb.id as booking_id,
  sb.inscription_id,
  sb.session_id,
  sb.created_at as booking_date,
  s.session_date,
  s.max_participants,
  s.current_participants,
  p.full_name as student_name,
  i.validated as inscription_validated
FROM session_bookings sb
LEFT JOIN sessions s ON sb.session_id = s.id
LEFT JOIN inscriptions i ON sb.inscription_id = i.id
LEFT JOIN profiles p ON i.profile_id = p.id
ORDER BY sb.created_at DESC;

-- ================================================
-- 2. VÉRIFIER LES INSCRIPTIONS SANS RÉSERVATION
-- ================================================

-- Inscriptions qui n'ont PAS de session réservée
SELECT 
  i.id as inscription_id,
  p.full_name,
  i.registration_date,
  i.validated
FROM inscriptions i
LEFT JOIN session_bookings sb ON sb.inscription_id = i.id
LEFT JOIN profiles p ON i.profile_id = p.id
WHERE sb.id IS NULL
ORDER BY i.registration_date DESC;

-- ================================================
-- 3. VÉRIFIER LES SESSIONS DISPONIBLES
-- ================================================

-- Sessions avec places disponibles
SELECT 
  id,
  session_date,
  max_participants,
  current_participants,
  (max_participants - current_participants) as places_restantes,
  CASE 
    WHEN current_participants >= max_participants THEN '🔴 COMPLET'
    WHEN current_participants >= max_participants * 0.8 THEN '🟠 PRESQUE PLEIN'
    WHEN current_participants >= max_participants * 0.5 THEN '🟡 MOITIÉ'
    ELSE '🟢 DISPONIBLE'
  END as statut
FROM sessions
ORDER BY session_date;

-- ================================================
-- 4. STATISTIQUES GLOBALES
-- ================================================

SELECT 
  COUNT(DISTINCT sb.id) as total_reservations,
  COUNT(DISTINCT i.id) as total_inscriptions,
  COUNT(DISTINCT i.id) - COUNT(DISTINCT sb.id) as inscriptions_sans_session
FROM inscriptions i
LEFT JOIN session_bookings sb ON sb.inscription_id = i.id;

-- ================================================
-- 5. TESTER UNE RÉSERVATION SPÉCIFIQUE
-- ================================================

-- Remplacez <INSCRIPTION_ID> par votre ID d'inscription
-- SELECT 
--   i.id as inscription_id,
--   p.full_name,
--   sb.id as booking_id,
--   s.session_date,
--   s.max_participants,
--   s.current_participants
-- FROM inscriptions i
-- LEFT JOIN profiles p ON i.profile_id = p.id
-- LEFT JOIN session_bookings sb ON sb.inscription_id = i.id
-- LEFT JOIN sessions s ON sb.session_id = s.id
-- WHERE i.id = '<INSCRIPTION_ID>';

-- ================================================
-- 6. CRÉER UNE RÉSERVATION MANUELLEMENT (SI BESOIN)
-- ================================================

-- Si une inscription n'a pas de session, vous pouvez en créer une :
-- 
-- INSERT INTO session_bookings (inscription_id, session_id)
-- VALUES ('<INSCRIPTION_ID>', '<SESSION_ID>');
-- 
-- Puis mettre à jour le compteur :
-- 
-- UPDATE sessions 
-- SET current_participants = current_participants + 1
-- WHERE id = '<SESSION_ID>';
