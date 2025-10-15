# Guide de Nettoyage des Données Orphelines

## 🎯 Situation

Vous avez supprimé des profils dans :
- Table `profiles` de Supabase
- Section Authentication de Supabase

**Problème :** Les inscriptions, tests et session_bookings associés sont restés orphelins.

---

## 📋 Ce qui va être nettoyé

1. ✅ **Session bookings** des profils supprimés
2. ✅ **Tests** (PRE et POST) des profils supprimés  
3. ✅ **Inscriptions** sans profil associé
4. ✅ **Compteurs de participants** des sessions (décrémentés)

---

## 🚀 Procédure d'Utilisation

### **Étape 1 : Identifier les Données Orphelines**

Dans le SQL Editor de Supabase, exécutez :

```sql
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
WHERE p.id IS NULL
GROUP BY i.id, i.profile_id, i.validated, i.registration_date
ORDER BY i.registration_date DESC;
```

**Résultat :**
- Liste des inscriptions orphelines
- Nombre de bookings et tests à supprimer

**Exemple de sortie :**
```
inscription_id                        | profile_id  | bookings | tests
abc-123-def                          | xyz-789     | 1        | 1
ghi-456-jkl                          | mno-012     | 1        | 2
```

---

### **Étape 2 : Nettoyer les Session Bookings**

Exécutez cette requête :

```sql
DO $$
DECLARE
    v_deleted_bookings INTEGER;
    booking_record RECORD;
BEGIN
    CREATE TEMP TABLE temp_orphan_bookings AS
    SELECT 
        sb.id as booking_id,
        sb.session_id,
        sb.inscription_id,
        i.profile_id
    FROM session_bookings sb
    INNER JOIN inscriptions i ON sb.inscription_id = i.id
    LEFT JOIN profiles p ON i.profile_id = p.id
    WHERE p.id IS NULL;

    -- Décrémenter current_participants
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

    DELETE FROM session_bookings
    WHERE id IN (SELECT booking_id FROM temp_orphan_bookings);

    GET DIAGNOSTICS v_deleted_bookings = ROW_COUNT;

    RAISE NOTICE 'Bookings supprimés: %', v_deleted_bookings;

    DROP TABLE temp_orphan_bookings;
END $$;
```

**Résultat attendu :**
```
NOTICE: Session abc-123 : décrémenté de 2 participants
NOTICE: Session def-456 : décrémenté de 1 participant
NOTICE: Bookings supprimés: 3
```

---

### **Étape 3 : Nettoyer les Tests**

```sql
DO $$
DECLARE
    v_deleted_tests INTEGER;
BEGIN
    DELETE FROM tests
    WHERE inscription_id IN (
        SELECT i.id
        FROM inscriptions i
        LEFT JOIN profiles p ON i.profile_id = p.id
        WHERE p.id IS NULL
    );

    GET DIAGNOSTICS v_deleted_tests = ROW_COUNT;
    RAISE NOTICE 'Tests orphelins supprimés: %', v_deleted_tests;
END $$;
```

**Résultat attendu :**
```
NOTICE: Tests orphelins supprimés: 5
```

---

### **Étape 4 : Nettoyer les Inscriptions**

```sql
DO $$
DECLARE
    v_deleted_inscriptions INTEGER;
BEGIN
    DELETE FROM inscriptions
    WHERE id IN (
        SELECT i.id
        FROM inscriptions i
        LEFT JOIN profiles p ON i.profile_id = p.id
        WHERE p.id IS NULL
    );

    GET DIAGNOSTICS v_deleted_inscriptions = ROW_COUNT;
    RAISE NOTICE 'Inscriptions orphelines supprimées: %', v_deleted_inscriptions;
END $$;
```

**Résultat attendu :**
```
NOTICE: Inscriptions orphelines supprimées: 3
```

---

### **Étape 5 : Vérification Finale**

```sql
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
```

**Résultat attendu :**
```
type                           | count
-------------------------------+-------
Inscriptions sans profile      | 0
Bookings sans profile          | 0
Tests sans profile             | 0
```

✅ **Tous les counts = 0 → Nettoyage réussi !**

---

### **Étape 6 : Vérifier les Compteurs de Sessions**

```sql
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
```

**Résultat attendu :**
- **Aucune ligne** = Tout est cohérent ✅
- **Lignes retournées** = Incohérence à corriger

**Exemple d'incohérence :**
```
session_date | compteur_actuel | bookings_reels | difference
-------------+-----------------+----------------+-----------
2025-10-20   | 15              | 12             | 3
2025-10-21   | 8               | 10             | -2
```

---

### **Bonus : Corriger les Compteurs (Si nécessaire)**

Si l'étape 6 montre des différences :

```sql
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

    RAISE NOTICE 'Sessions corrigées: %', v_updated_count;
END $$;
```

---

## 📊 Résumé Visuel du Nettoyage

### **Avant**
```
Profile (SUPPRIMÉ)
  ↓ (orphelin)
Inscription abc-123
  ├── session_booking xyz (session 1) ❌
  ├── test PRE ❌
  └── test POST ❌

Session 1
  current_participants: 15 (incorrect)
  bookings réels: 12
```

### **Après**
```
Inscription abc-123 → SUPPRIMÉE ✅
  ├── session_booking → SUPPRIMÉ ✅
  ├── test PRE → SUPPRIMÉ ✅
  └── test POST → SUPPRIMÉ ✅

Session 1
  current_participants: 12 (corrigé) ✅
  bookings réels: 12 ✅
```

---

## ⚠️ Avertissements

### **1. Ordre d'Exécution**
Respectez l'ordre des étapes :
1. Bookings (pour décrémenter les compteurs)
2. Tests
3. Inscriptions
4. Vérifications

### **2. Backup Recommandé**
Avant de lancer le nettoyage complet, faites un backup de vos tables :
- `session_bookings`
- `tests`
- `inscriptions`
- `sessions`

### **3. Production**
Sur un environnement de production :
- Testez d'abord sur une copie
- Exécutez en heures creuses
- Vérifiez chaque étape

---

## 🔧 Script Complet Automatique

Si vous voulez tout exécuter d'un coup, utilisez le fichier :

```
supabase/CLEANUP_ORPHAN_DATA.sql
```

Copiez-collez TOUT le contenu dans le SQL Editor de Supabase et exécutez.

⚠️ **Attention :** Cela exécute toutes les étapes automatiquement. Préférez l'exécution étape par étape pour la première fois.

---

## 🛡️ Prévention Future

### **Méthode Correcte pour Supprimer un Profil**

**❌ NE PAS FAIRE :**
```sql
-- Supprimer directement dans auth.users
DELETE FROM auth.users WHERE id = 'xxx';
```

**✅ FAIRE :**
```sql
-- 1. Supprimer le profil (cascade sur inscriptions)
DELETE FROM profiles WHERE id = 'profile-id';

-- 2. Ensuite supprimer l'utilisateur auth
-- Via Supabase Dashboard > Authentication > Users > Delete
```

### **Ou créer un Trigger Cascade**

```sql
CREATE OR REPLACE FUNCTION delete_profile_on_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM profiles WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_profile_on_user_delete
AFTER DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION delete_profile_on_user_delete();
```

---

## ✅ Checklist de Vérification

Après le nettoyage, vérifiez :

- [ ] Étape 1 : Identifié X inscriptions orphelines
- [ ] Étape 2 : Supprimé X bookings, décrémenté Y sessions
- [ ] Étape 3 : Supprimé X tests
- [ ] Étape 4 : Supprimé X inscriptions
- [ ] Étape 5 : Tous les counts = 0
- [ ] Étape 6 : Compteurs de sessions cohérents
- [ ] Bonus (si nécessaire) : Corrigé X sessions

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs dans le SQL Editor
2. Vérifiez les contraintes de clés étrangères
3. Assurez-vous d'avoir les permissions nécessaires

---

## 🎉 Résultat Final

Après ce nettoyage :
✅ Base de données propre  
✅ Pas de données orphelines  
✅ Compteurs corrects  
✅ Liste admin cohérente  
✅ Export CSV fiable  

**Votre base de données est maintenant clean !** 🧹✨
