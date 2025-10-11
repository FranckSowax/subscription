# 🎓 Masterclass IA - Système d'Inscription & Évaluation

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

Application moderne et responsive pour gérer les inscriptions, sessions et évaluations d'une masterclass en Intelligence Artificielle.

## ✨ Fonctionnalités

### 🎯 Pour les Étudiants
- ✅ **Inscription rapide** avec validation de formulaire
- ✅ **Sélection de session** parmi 12 dates disponibles
- ✅ **Test PRE-inscription** (10 questions pré-définies)
- ✅ **Dashboard personnel** avec historique complet
- ✅ **Test POST-masterclass** (disponible après la session)
- ✅ **Authentification par email** simple et sécurisée
- ✅ **Notifications WhatsApp** pour les détails importants

### 👨‍💼 Pour les Administrateurs
- ✅ **Dashboard admin** avec statistiques
- ✅ **Gestion des étudiants** et inscriptions
- ✅ **Gestion des questions** PRE/POST
- ✅ **Suivi des sessions** et réservations
- ✅ **Export des données** et rapports

## 🎨 Design Moderne

**Palette Windsurf :**
- 🔴 Corail Vif `#FF6B57` - Boutons & accents
- 🔵 Bleu Clair `#E8F3F8` - Arrière-plans
- ⚪ Blanc Pur `#FFFFFF` - Cards & conteneurs
- ⚫ Noir Profond `#222222` - Titres
- 🔘 Gris Moyen `#666666` - Texte secondaire

**Caractéristiques :**
- Mobile-first & ultra-responsive
- Coins arrondis & ombres douces
- Animations fluides (300ms)
- Typographie sans-serif moderne
- Hiérarchie visuelle claire

## 🚀 Stack Technique

### Frontend
- **Next.js 14** (App Router)
- **React 18** avec TypeScript
- **Tailwind CSS v4** (design system)
- **shadcn/ui** (composants)

### Backend
- **Supabase** (PostgreSQL)
- **Row Level Security** (RLS)
- **Authentication** (email-based)
- **Storage** (PDF uploads)

### Intégrations
- **WhatsApp API** (notifications)
- **Vercel** (déploiement)

## 📦 Installation

### Prérequis
```bash
Node.js 18+
npm ou yarn
Compte Supabase
```

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/FranckSowax/subscription.git
cd subscription
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**
```bash
cp .env.example .env.local
```

Remplir les variables :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WHAPI_TOKEN=your_whapi_token
```

4. **Migrations SQL**
```bash
# Appliquer les migrations dans Supabase SQL Editor
# Voir supabase/migrations/
```

5. **Lancer l'application**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [**SETUP.md**](./SETUP.md) - Guide d'installation détaillé
- [**PREDEFINED_QUESTIONS_SYSTEM.md**](./PREDEFINED_QUESTIONS_SYSTEM.md) - Système de questions
- [**MODERN_DESIGN.md**](./MODERN_DESIGN.md) - Guide du design
- [**DATABASE_SETUP.md**](./DATABASE_SETUP.md) - Structure de la base de données
- [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) - Résolution de problèmes

## 🗄️ Structure du Projet

```
subscription/
├── app/                          # Pages Next.js (App Router)
│   ├── page.tsx                  # Page d'accueil
│   ├── inscription/              # Inscription & session
│   ├── test/                     # Tests PRE/POST
│   ├── student/                  # Dashboard étudiant
│   ├── admin/                    # Dashboard admin
│   └── api/                      # API routes
├── components/                   # Composants React
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Formulaires
│   ├── test/                     # Composants de test
│   └── admin/                    # Composants admin
├── lib/                          # Utilitaires
│   ├── supabase/                 # Client Supabase
│   ├── validations/              # Schémas Zod
│   └── whatsapp/                 # API WhatsApp
├── supabase/                     # Migrations SQL
│   └── migrations/               # Fichiers .sql
├── public/                       # Assets statiques
└── types/                        # Types TypeScript
```

## 🔐 Sécurité

- ✅ Row Level Security (RLS) activé
- ✅ Validation côté serveur (Zod)
- ✅ Tokens d'authentification sécurisés
- ✅ Variables d'environnement protégées
- ✅ HTTPS obligatoire en production

## 🌐 Déploiement

### Vercel (Recommandé)

1. **Connecter le dépôt GitHub**
2. **Configurer les variables d'environnement**
3. **Déployer automatiquement**

```bash
vercel --prod
```

### Variables d'environnement requises
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
WHAPI_TOKEN
```

## 📊 Base de Données

### Tables Principales
- `profiles` - Profils utilisateurs
- `masterclasses` - Masterclasses
- `masterclass_sessions` - Sessions (12 dates)
- `inscriptions` - Inscriptions étudiants
- `session_bookings` - Réservations de sessions
- `questions` - Questions PRE/POST
- `tests` - Résultats des tests
- `student_auth_tokens` - Tokens d'authentification

### Vues
- `student_dashboard` - Dashboard étudiant complet

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

**Franck Sowax**
- GitHub: [@FranckSowax](https://github.com/FranckSowax)

## 🙏 Remerciements

- Next.js team
- Supabase team
- shadcn/ui
- Tailwind CSS

---

**Fait avec ❤️ pour la Masterclass IA**
