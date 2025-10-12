# ⏱️ Timer de 30 Secondes par Question

## ✅ Fonctionnalité Implémentée

Un **timer de 30 secondes** a été ajouté à chaque question des tests PRÉ et POST avec un compteur visuel circulaire et des indicateurs d'urgence.

---

## 🎯 Comportement du Timer

### **Durée**
- ⏱️ **30 secondes par question**

### **Passage Automatique**
- Après 30 secondes, la question suivante s'affiche **automatiquement**
- Le candidat n'a pas besoin de cliquer sur "Suivant"
- Le timer se réinitialise à 30 secondes pour la nouvelle question

### **Dernière Question**
- Si c'est la dernière question ET que toutes les questions ont été répondues
- Le test se soumet **automatiquement** après 30 secondes

### **Boutons de Navigation**
- Les boutons "Précédent" et "Suivant" restent fonctionnels
- Le candidat peut naviguer manuellement avant la fin du timer
- Le timer se réinitialise lors de la navigation manuelle

---

## 🎨 Interface Visuelle

### **1. Carte Timer (Nouvelle)**
```
┌─────────────────────────────────────────────────┐
│  ⏱️ Temps restant                               │
│  ╭─────╮                                        │
│  │ ⏱️  │  Vous avez 30 secondes par question    │
│  │ 30s │                                        │
│  ╰─────╯                                        │
└─────────────────────────────────────────────────┘
```

### **2. Compteur Circulaire**
- **Cercle de progression** qui se vide au fil du temps
- **Icône Timer** au centre
- **Nombre de secondes** en grand

### **3. États Visuels**

#### **État Normal (> 10 secondes)**
- 🟢 Couleur primary (corail)
- Bordure calme
- Message : "⏱️ Temps restant"
- Sous-texte : "Vous avez 30 secondes par question"

#### **État d'Urgence (≤ 10 secondes)**
- 🔴 Couleur destructive (rouge)
- **Animation pulse** sur la carte
- **Badge qui rebondit** avec le compteur
- Message : "⚠️ Temps presque écoulé !"
- Sous-texte : "Dépêchez-vous de répondre !"

---

## 📍 Emplacements

### **Page Test PRÉ**
`/app/test/pre/page.tsx`
- Avertissement avant le test : "⏱️ Attention : Vous avez 30 secondes par question !"

### **Page Test POST**
`/app/test/post/page.tsx`
- Même avertissement que le test PRÉ

### **Composant QCMTest**
`/components/test/QCMTest.tsx`
- Timer circulaire entre la barre de progression et la question
- Compteur dans la barre de navigation
- Information en bas de page

---

## 🔧 Détails Techniques

### **Hook useEffect**
```typescript
useEffect(() => {
  // Reset timer when question changes
  setTimeLeft(TIMER_DURATION);
  
  // Start countdown interval
  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // Auto-advance to next question
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        }
        return TIMER_DURATION;
      }
      return prev - 1;
    });
  }, 1000);
  
  // Cleanup on unmount
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [currentQuestion, isSubmitting]);
```

### **States**
- `timeLeft` : Secondes restantes (30 → 0)
- `timerRef` : Référence à l'interval pour le cleanup
- `isTimerLow` : Boolean (true si ≤ 10s)
- `timerProgress` : Pourcentage pour le cercle (100% → 0%)

---

## 🎨 Design & Animations

### **Compteur Circulaire SVG**
```html
<svg className="absolute w-16 h-16 -rotate-90">
  <!-- Cercle de fond -->
  <circle r="28" stroke="currentColor" strokeWidth="4" />
  
  <!-- Cercle de progression -->
  <circle 
    r="28" 
    strokeDasharray={2 * PI * 28}
    strokeDashoffset={2 * PI * 28 * (1 - progress/100)}
    className="transition-all duration-1000"
  />
</svg>
```

### **Animations**
- ✅ Transition fluide du cercle (1 seconde)
- ✅ Pulse sur la carte (≤ 10s)
- ✅ Bounce sur le badge (≤ 10s)
- ✅ Changement de couleur progressif

### **Classes Conditionnelles**
```typescript
isTimerLow 
  ? 'border-destructive bg-destructive/5 animate-pulse'
  : 'border-primary/30 bg-primary/5'
```

---

## 📊 Affichages du Timer

### **1. Carte Timer (Principal)**
- Grand compteur circulaire (16x16)
- Icône Timer
- Secondes en gros
- Message contextuel

### **2. Barre de Navigation**
- Petit compteur entre les boutons
- Format : "Xs restantes"
- Couleur selon l'urgence

### **3. Alerte Informative**
```
⏱️ Timer : Vous avez 30 secondes par question. 
Passé ce délai, la question suivante s'affichera automatiquement.

💡 Important : Vous ne pouvez passer ce test qu'une seule fois.
```

---

## 🚀 Expérience Utilisateur

### **Avant le Test**
1. Le candidat voit l'avertissement : **"⏱️ Attention : Vous avez 30 secondes par question !"**

### **Pendant le Test**
1. Question s'affiche avec timer à 30s
2. Compteur circulaire se vide progressivement
3. À 10s : carte devient rouge et pulse
4. À 0s : passage automatique à la suivante

### **Navigation Manuelle**
- Cliquer sur "Suivant" ou "Précédent" reset le timer
- Le candidat garde le contrôle

### **Dernière Question**
- Si toutes les questions sont répondues
- Soumission automatique après 30s
- Sinon, reste sur la dernière question

---

## ⚠️ Considérations

### **Points Forts**
- ✅ Encourage des réponses rapides
- ✅ Évite que le candidat reste bloqué
- ✅ Interface visuelle claire
- ✅ Indicateurs d'urgence
- ✅ Garde la navigation manuelle possible

### **Points d'Attention**
- ⚠️ 30 secondes peut être court pour certaines questions complexes
- ⚠️ Pression de temps peut stresser certains candidats
- ✅ Mitigé par la possibilité de répondre plus vite et passer manuellement

---

## 📦 Fichiers Modifiés

```
✅ components/test/QCMTest.tsx
   - Ajout du timer avec useEffect
   - Compteur circulaire SVG
   - États visuels d'urgence
   - Passage automatique
   
✅ app/test/pre/page.tsx
   - Avertissement timer avant le test
   
✅ app/test/post/page.tsx
   - Avertissement timer avant le test
```

---

## 🎯 Configuration

### **Modifier la Durée**
Pour changer la durée du timer, modifier la constante :

```typescript
const TIMER_DURATION = 30; // 30 secondes par question
```

Valeurs recommandées :
- **20s** : Rapide (questions simples)
- **30s** : Standard (équilibré) ✅
- **45s** : Confortable (questions complexes)
- **60s** : Généreux (questions très complexes)

---

## 📸 Aperçu des États

### **État Normal (> 10s)**
```
┌────────────────────────────────────┐
│  ⏱️ Temps restant                  │
│  ╭─────╮                           │
│  │ ⏱️  │  30 secondes par question │
│  │ 25s │                           │
│  ╰─────╯                           │
│  Bordure : Corail                  │
└────────────────────────────────────┘
```

### **État d'Urgence (≤ 10s)**
```
┌────────────────────────────────────┐
│  ⚠️ Temps presque écoulé ! [8s]💥  │
│  ╭─────╮                           │
│  │ ⏱️  │  Dépêchez-vous !          │
│  │  8s │  ⚡                        │
│  ╰─────╯                           │
│  Bordure : Rouge (pulse)           │
└────────────────────────────────────┘
```

---

## ✅ Tests Recommandés

### **Scénarios à Tester**
1. ✅ Timer démarre à 30s
2. ✅ Compte à rebours fonctionne
3. ✅ Passage automatique à 0s
4. ✅ Reset sur navigation manuelle
5. ✅ Animation d'urgence à 10s
6. ✅ Soumission auto dernière question
7. ✅ Timer s'arrête pendant soumission

---

**Timer implémenté et prêt ! ⏱️✨**
