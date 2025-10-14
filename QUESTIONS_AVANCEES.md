# Questions Avancées - Documentation

## 🎯 Objectif

Remplacer les questions basiques actuelles par des **questions avancées** avec un contexte gabonais, axées sur la **compréhension critique** et l'**application pratique** de l'Intelligence Artificielle.

---

## 📊 Comparaison : Anciennes vs Nouvelles Questions

### **Anciennes Questions (Niveau Débutant)**
- Questions très simples et génériques
- Peu de contexte local
- Focus sur des définitions basiques
- Exemples : "Que signifie IA ?", "Quel outil est un exemple d'IA générative ?"

### **Nouvelles Questions (Niveau Avancé)**
- Questions orientées vers la **pensée critique**
- **Contexte gabonais** intégré (Libreville, Port-Gentil, culture fang, entrepreneuriat local)
- Focus sur l'**éthique**, les **biais** et l'**usage responsable**
- Scénarios pratiques pour étudiants et entrepreneurs

---

## 📝 Structure des Nouveaux Questionnaires

### **TEST PRÉ-INSCRIPTION** (10 questions)
**Thèmes couverts :**
- ✅ Compréhension de ce qu'est l'IA (approche statistique vs conscience)
- ✅ Usage critique de ChatGPT dans le contexte académique
- ✅ Construction de prompts efficaces
- ✅ IA et entrepreneuriat au Gabon
- ✅ Biais et limites de l'IA
- ✅ Contexte culturel gabonais (Libreville, Port-Gentil)
- ✅ Outils d'IA pour la création visuelle (Canva)

**Exemples de questions :**
1. "Si un étudiant gabonais utilise ChatGPT pour trouver un sujet de mémoire, il :"
2. "L'IA pourrait favoriser l'entrepreneuriat au Gabon en :"
3. "Si une IA confond Libreville et Port-Gentil dans une réponse, cela illustre :"

### **TEST POST-MASTERCLASS** (10 questions)
**Thèmes couverts :**
- ✅ Maîtrise des prompts avancés (contexte, rôle, objectif)
- ✅ Vérification des sources et fact-checking
- ✅ Éthique et usage responsable de l'IA
- ✅ Applications entrepreneuriales locales
- ✅ Limites culturelles et linguistiques de l'IA (proverbes fang)
- ✅ IA académique (génération de plans, reformulation)
- ✅ Biais dans les données et résultats

**Exemples de questions :**
1. "Quel est le meilleur prompt pour obtenir une idée d'entreprise adaptée au Gabon ?"
2. "Si une IA traduit mal un proverbe fang, cela montre :"
3. "Quelle est la limite principale de l'IA générative dans le contexte gabonais ?"

---

## 🔄 Migration Appliquée

### Fichier : `011_update_advanced_questions.sql`

**Actions effectuées :**
1. ✅ Suppression de toutes les anciennes questions
2. ✅ Insertion de 10 nouvelles questions PRÉ-INSCRIPTION
3. ✅ Insertion de 10 nouvelles questions POST-MASTERCLASS
4. ✅ Vérification du nombre de questions par type

**Structure SQL :**
```sql
-- Exemple de question
INSERT INTO questions (masterclass_id, question_text, choices, correct_choice, test_type)
VALUES
(v_masterclass_id,
 'L''intelligence artificielle cherche avant tout à :',
 '{"A": "...", "B": "...", "C": "...", "D": "..."}',
 'B',
 'PRE');
```

---

## 🎓 Pédagogie et Pertinence

### **Contexte Gabonais Intégré**
Les nouvelles questions incluent :
- 🇬🇦 **Villes** : Libreville, Port-Gentil
- 🇬🇦 **Culture** : Proverbes fang, contexte local
- 🇬🇦 **Entrepreneuriat** : Opportunités pour jeunes entrepreneurs gabonais
- 🇬🇦 **Académie** : Scénarios d'étudiants gabonais utilisant l'IA

### **Approche Critique**
- ⚠️ Identification des **biais** de l'IA
- ⚠️ Reconnaissance des **limites** (données manquantes, contexte culturel)
- ⚠️ **Éthique** : usage responsable vs dépendance excessive
- ⚠️ **Fact-checking** : vérification des sources

### **Application Pratique**
- 💼 **Entrepreneuriat** : création de business plans, analyse de marché
- 📚 **Académique** : rédaction de mémoires, recherche documentaire
- 🎨 **Création** : Canva pour supports visuels
- 🤖 **Prompts** : construction de commandes efficaces

---

## 🚀 Application de la Migration

### **Méthode 1 : Via Supabase Dashboard**
1. Connectez-vous à [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une **New Query**
5. Copiez-collez le contenu de `011_update_advanced_questions.sql`
6. Cliquez sur **Run** (ou `Ctrl + Enter`)

### **Méthode 2 : Via Supabase CLI**
```bash
cd /path/to/windsurf-project
npx supabase migration up
```

---

## ✅ Vérification Post-Migration

### Requête de vérification :
```sql
-- Compter les questions par type
SELECT 
  test_type,
  COUNT(*) as nombre_questions
FROM questions
GROUP BY test_type
ORDER BY test_type;
```

**Résultat attendu :**
```
test_type | nombre_questions
----------|------------------
POST      | 10
PRE       | 10
```

### Vérifier le contenu d'une question :
```sql
-- Exemple : Voir les questions PRÉ
SELECT 
  question_text,
  choices,
  correct_choice
FROM questions
WHERE test_type = 'PRE'
LIMIT 3;
```

---

## 📊 Impact sur l'Expérience Utilisateur

### **Avant (Questions Basiques)**
- Niveau trop facile pour certains étudiants
- Peu de contexte local
- Questions génériques sans profondeur

### **Après (Questions Avancées)**
- ✅ **Challenge intellectuel** : Questions qui font réfléchir
- ✅ **Pertinence locale** : Contexte gabonais omniprésent
- ✅ **Préparation concrète** : Scénarios réalistes d'usage de l'IA
- ✅ **Éthique et responsabilité** : Sensibilisation aux limites et biais
- ✅ **Entrepreneuriat** : Focus sur l'application en contexte africain

---

## 🎯 Objectifs Pédagogiques Atteints

### **Test PRÉ-INSCRIPTION**
- ✅ Évaluer la **perception initiale** de l'IA
- ✅ Identifier les **idées reçues** et **biais** des étudiants
- ✅ Mesurer la **conscience critique** avant formation

### **Test POST-MASTERCLASS**
- ✅ Vérifier la **maîtrise des prompts avancés**
- ✅ Confirmer la **compréhension éthique**
- ✅ Valider la capacité d'**application pratique**
- ✅ Mesurer la **progression** depuis le test PRÉ

---

## 📈 Metrics de Réussite

Les nouvelles questions permettent de mesurer :

1. **Compréhension technique** : Différence entre IA statistique et conscience
2. **Pensée critique** : Capacité à identifier biais et limites
3. **Application contextuelle** : Usage adapté au Gabon
4. **Éthique** : Conscience des enjeux de responsabilité
5. **Créativité** : Construction de prompts efficaces

---

## 🔄 Rollback (Si Nécessaire)

Pour revenir aux anciennes questions :
```sql
-- Utiliser la migration 005 (questions basiques)
-- Ou 004 (questions très faciles)
```

---

## 📞 Notes Importantes

⚠️ **ATTENTION** : 
- Les tests déjà passés **ne seront pas affectés** (historique préservé)
- Seuls les **nouveaux tests** utiliseront les nouvelles questions
- Les étudiants avec inscription en cours devront passer le test avec les nouvelles questions

💡 **RECOMMANDATION** :
- Appliquer cette migration **avant** une nouvelle session de masterclass
- Informer les tuteurs du changement de niveau des questions
- Adapter le contenu de la masterclass si nécessaire pour couvrir tous les thèmes

---

## ✨ Conclusion

Cette migration transforme l'évaluation de basique à **avancée**, avec un focus sur le **contexte gabonais** et l'**application pratique**. Les questions sont conçues pour préparer réellement les étudiants à un usage **critique**, **éthique** et **entrepreneurial** de l'Intelligence Artificielle.

**Date de migration** : 14 octobre 2025  
**Version** : 011_update_advanced_questions.sql  
**Statut** : ✅ Prêt pour déploiement
