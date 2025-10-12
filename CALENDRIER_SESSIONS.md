# 📅 Calendrier des Sessions - Masterclass IA 2025

## 🎯 Résumé

- **Total Sessions :** 12
- **Total Places :** 300 (25 places par session)
- **Période :** 21 Octobre - 6 Novembre 2025
- **Horaires :** 9h00 - 15h00

---

## 📆 Octobre 2025 (8 sessions)

| Date | Jour | Places | Horaire |
|------|------|--------|---------|
| **21 Octobre** | Mardi | 25 | 9h00 - 15h00 |
| **22 Octobre** | Mercredi | 25 | 9h00 - 15h00 |
| **23 Octobre** | Jeudi | 25 | 9h00 - 15h00 |
| **24 Octobre** | Vendredi | 25 | 9h00 - 15h00 |
| **27 Octobre** | Lundi | 25 | 9h00 - 15h00 |
| **28 Octobre** | Mardi | 25 | 9h00 - 15h00 |
| **29 Octobre** | Mercredi | 25 | 9h00 - 15h00 |
| **30 Octobre** | Jeudi | 25 | 9h00 - 15h00 |

**Total Octobre :** 200 places

---

## 📆 Novembre 2025 (4 sessions)

| Date | Jour | Places | Horaire |
|------|------|--------|---------|
| **3 Novembre** | Lundi | 25 | 9h00 - 15h00 |
| **4 Novembre** | Mardi | 25 | 9h00 - 15h00 |
| **5 Novembre** | Mercredi | 25 | 9h00 - 15h00 |
| **6 Novembre** | Jeudi | 25 | 9h00 - 15h00 |

**Total Novembre :** 100 places

---

## ✅ Calendrier Mis à Jour Dans

1. ✅ `QUICK_FIX_SESSIONS.sql` (migration rapide)
2. ✅ `supabase/migrations/008_create_sessions_table.sql` (migration officielle)

---

## 🚀 Comment Appliquer

### Méthode Rapide : Utiliser QUICK_FIX_SESSIONS.sql

1. Ouvrez `QUICK_FIX_SESSIONS.sql`
2. Sélectionnez TOUT (Cmd+A / Ctrl+A)
3. Copiez (Cmd+C / Ctrl+C)
4. Allez sur **Supabase Dashboard** → **SQL Editor**
5. Créez une nouvelle requête
6. Collez (Cmd+V / Ctrl+V)
7. Cliquez sur **"Run"**

---

## 📊 Résultat Attendu

Après l'exécution, vous verrez dans Supabase :

```sql
SELECT 
  session_date,
  to_char(session_date, 'Day') as jour,
  max_participants,
  current_participants
FROM sessions
ORDER BY session_date;
```

**Résultat :**

```
session_date | jour      | max_participants | current_participants
-------------|-----------|------------------|---------------------
2025-10-20   | Monday    | 25              | 0
2025-10-21   | Tuesday   | 25              | 0
2025-10-22   | Wednesday | 25              | 0
2025-10-23   | Thursday  | 25              | 0
2025-10-27   | Monday    | 25              | 0
2025-10-28   | Tuesday   | 25              | 0
2025-10-29   | Wednesday | 25              | 0
2025-10-30   | Thursday  | 25              | 0
2025-11-03   | Monday    | 25              | 0
2025-11-04   | Tuesday   | 25              | 0
2025-11-05   | Wednesday | 25              | 0
2025-11-06   | Thursday  | 25              | 0
```

**Total : 12 sessions × 25 places = 300 places**

---

## ⏰ Timeline des Tests POST

Le test POST sera disponible après 15h00 le jour de la session.

**Exemples :**
- Session du 20 Oct → Test POST dispo le 20 Oct à 15h00
- Session du 3 Nov → Test POST dispo le 3 Nov à 15h00

---

## 🎓 Flux Complet

1. **Inscription** → Étudiant remplit le formulaire
2. **Sélection de session** → Choix parmi les 12 dates
3. **Test PRÉ** → 10 questions (obligatoire)
4. **Validation admin** → L'admin valide l'inscription
5. **Masterclass** → 9h00 - 15h00 à la date choisie
6. **Test POST** → Disponible après 15h00 le même jour

---

**Les dates sont maintenant correctement configurées ! 🎉**
