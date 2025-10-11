# Plateforme d'Inscription et d'Évaluation - Masterclass IA

## Configuration Initiale

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de Supabase

1. Créez un projet Supabase sur [supabase.com](https://supabase.com)
2. Copiez `.env.example` vers `.env.local`
3. Remplissez les variables d'environnement Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de votre projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme de votre projet
   - `SUPABASE_SERVICE_ROLE_KEY`: Clé de rôle de service (pour les opérations admin)

### 3. Création du schéma de base de données

Exécutez le fichier de migration SQL dans l'éditeur SQL de Supabase:

```bash
# Copiez le contenu de supabase/migrations/001_initial_schema.sql
# et exécutez-le dans l'éditeur SQL de Supabase Dashboard
```

Ou utilisez la CLI Supabase:

```bash
# Installez la CLI Supabase
npm install -g supabase

# Liez votre projet
supabase link --project-ref your-project-ref

# Appliquez les migrations
supabase db push
```

### 4. Configuration des API externes

#### OpenAI (GPT-4o)
- Obtenez une clé API sur [platform.openai.com](https://platform.openai.com)
- Ajoutez `OPENAI_API_KEY` dans `.env.local`

#### Whapi (WhatsApp)
- Créez un compte sur [whapi.cloud](https://whapi.cloud)
- Obtenez votre token API
- Ajoutez `WHAPI_API_TOKEN` dans `.env.local`

### 5. Lancement du projet

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start
```

Le projet sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
├── app/                    # Pages et routes Next.js (App Router)
├── components/             # Composants React réutilisables
├── lib/                    # Utilitaires et configurations
│   └── supabase/          # Configuration Supabase
├── types/                  # Types TypeScript
├── supabase/              # Migrations et configuration Supabase
│   └── migrations/        # Fichiers de migration SQL
└── documentation/          # Documentation du projet
```

## Fonctionnalités Principales

1. **Inscription des étudiants** - Formulaire avec validation
2. **QCM Pré-Masterclass** - 10 questions, une tentative
3. **QCM Post-Masterclass** - Évaluation après la formation
4. **Génération de questions** - Via GPT-4o à partir de PDF
5. **Notifications WhatsApp** - Confirmations et rappels automatiques
6. **Dashboard Admin/Tuteur** - Gestion et visualisation des données

## Technologies Utilisées

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **IA**: OpenAI GPT-4o
- **Notifications**: Whapi WhatsApp API
- **Hébergement**: Vercel (recommandé)

## Prochaines Étapes

Consultez le fichier `documentation/tasks.json` pour voir les tâches d'implémentation détaillées.
