# Frontend Guideline Document

Ce document fournit une vision claire et pratique de l’architecture, des principes de design et des technologies utilisées sur la plateforme d’inscription et d’évaluation pour la masterclass IA. Il s’adresse à toute personne (développeur·se, designer, chef de projet) même sans bagage technique approfondi.

## 1. Frontend Architecture

### 1.1 Technologies principales
- **Next.js 14 (App Router)** : base de l’application, gère le rendu côté serveur (SSR) et côté client (CSR), facilite le routage et l’optimisation.
- **TypeScript** : typage statique pour éviter les erreurs courantes et rendre le code plus lisible.
- **Tailwind CSS** : framework utilitaire pour construire rapidement des interfaces cohérentes sans CSS surchargé.
- **shadcn UI** : bibliothèque de composants préconçus (boutons, formulaires, modales) basée sur Tailwind.
- **Supabase** : authentification, base de données, stockage, avec client JavaScript intégré.

### 1.2 Comment l’architecture répond aux besoins
- **Scalabilité** : structure par dossier (pages, components, api) et composants réutilisables. Une nouvelle masterclass se déploie en ajoutant un PDF et quelques réglages.
- **Maintenabilité** : séparation claire entre logique (hooks, services), présentation (composants) et styles (utilitaires Tailwind). Le typage TypeScript guide et documente l’API.
- **Performance** : rendu côté serveur pour la première connexion, optimisation automatique des bundles, lazy loading et code splitting.

## 2. Design Principles

### 2.1 Principes clés
- **Simplicité et clarté** : chaque page se concentre sur une seule action (inscription, test, tableau de bord).
- **Accessibilité** : respect des contrastes couleurs (WCAG AA), balises ARIA sur les composants interactifs.
- **Responsivité** : l’interface s’adapte sur mobile et desktop, avec des points de rupture mobiles-first.
- **Cohérence visuelle** : mêmes espacements, typographies et styles de boutons sur toute la plateforme.

### 2.2 Application sur l’UI
- Boutons et liens clairement identifiés (couleur verte pour confirmer, grisée pour désactivé).
- Feedbacks utilisateurs visibles (validation de champ, messages d’erreur, loader lors des appels réseau).
- Navigation intuitive : barres de progression, en-têtes et menus identiques sur chaque page.

## 3. Styling and Theming

### 3.1 Approche de styling
- **Utility-first avec Tailwind CSS** : classes utilitaires directement dans le JSX (p-4, text-lg, bg-blue-800).
- **Composants shadcn** : wrappers autour de Tailwind pour un look professionnel avec un minimum de configuration.

### 3.2 Thématisation et cohérence
- Les couleurs et polices sont définies une fois dans le fichier `tailwind.config.js` : shareable et modifiable.
- Variables CSS personnalisées pour le thème (« primary », « success », etc.) facilitent les changements globaux.

### 3.3 Style général
- Style : **moderne & épuré**, légèrement inspiré du flat design avec des ombres douces.
- Effet subtil de **glassmorphism** sur certaines cartes (Dashboard, cartes d’activité) pour un rendu haut de gamme.

### 3.4 Palette de couleurs
- Bleu foncé (Primary) : #1E3A8A
- Blanc (Background) : #FFFFFF
- Vert validation (Accent) : #10B981
- Gris clair (Fond secondaire) : #F3F4F6
- Gris foncé (Texte) : #374151

### 3.5 Typographie
- Police principale : **Inter** (sans-serif), lisible et contemporaine.
- Hiérarchie : titres en 600 (semi-bold), corps de texte en 400 (regular).

## 4. Component Structure

### 4.1 Organisation des composants
- Dossier `components/` : un sous-dossier par fonctionnalité (Form, Quiz, Dashboard, Table, Modal).
- Chaque composant contient obligatoirement son fichier JSX/TSX et un fichier de tests.
- Composants atomiques (boutons, champs de saisie) séparés des composants complexes (QCM, tableau de bord).

### 4.2 Réutilisation et cohérence
- Standardisation des boutons (`<PrimaryButton>`, `<SecondaryButton>`).
- Système de cartes pour afficher les scores, l’historique et les widgets avec même gabarit.
- Props claires : chaque composant expose un ensemble limité de propriétés pour éviter les cas d’usage imprévus.

### 4.3 Avantages du component-based
- Isolation : on peut travailler simultanément sur deux composants sans conflit.
- Tests ciblés : chaque composant s’intègre facilement dans des tests unitaires.
- Maintenance facilitée : un bug visuel dans un bouton se corrige une seule fois.

## 5. State Management

### 5.1 Approche générale
- **Local State** avec React `useState` et `useReducer` pour les interactions simples (changement d’onglet, formulaire).
- **Global State** léger avec React Context (session utilisateur, informations de quiz en cours).
- Appels réseau directs via le client Supabase (`supabase-js`), pas de surcharge avec Redux.

### 5.2 Partage de l’état
- Le contexte `AuthContext` expose l’utilisateur connecté et les méthodes de connexion/déconnexion.
- Le contexte `QuizContext` (avant/après masterclass) stocke la liste des questions et les réponses sélectionnées.
- Les données persistantes (inscriptions, résultats) sont toujours relues depuis Supabase à chaque chargement de page.

## 6. Routing and Navigation

- **File-based routing** de Next.js App Router : chaque page correspond à un dossier sous `app/`.
- Pages publiques : `/`, `/inscription`, `/test/pre`, `/test/post`, `/confirmation`.
- Pages privées (Dashboard) : `/dashboard`, `/dashboard/students`, `/dashboard/questions`, protégées par un middleware qui vérifie l’Auth Supabase.
- **Link prefetch** : Next.js précharge automatiquement les pages liées pour accélérer la navigation.
- Menu latéral dans le dashboard pour passer d’une section à l’autre sans rechargement complet.

## 7. Performance Optimization

- **Server-Side Rendering (SSR)** pour la page d’accueil et le dashboard, garantissant un premier affichage rapide.
- **Static Site Generation (SSG)** ou **Incremental Static Regeneration (ISR)** pour le contenu statique (termes légaux, mentions légales).
- **Code splitting** et **lazy loading** des composants lourds (éditeur de questions, charts).
- Optimisation automatique des images via le composant `<Image>` de Next.js.
- Mise en cache des requêtes Supabase côté navigateur (cache-control) pour éviter les appels redondants.

## 8. Testing and Quality Assurance

### 8.1 Tests unitaires
- **Jest** + **React Testing Library** : tester le rendu des composants isolés, les interactions (click, input).
- Structure des tests : dossier `__tests__` ou fichier `ComponentName.test.tsx` à côté du composant.

### 8.2 Tests d’intégration
- Vérifier le flux complet de l’inscription au QCM (simuler un utilisateur, remplir le formulaire, soumettre).
- Mock du client Supabase et des appels Whapi.

### 8.3 Tests End-to-End
- **Cypress** (ou **Playwright**) pour automatiser la navigation en tant qu’étudiant et administrateur.
- Cas clés : inscription, pré-test, notification WhatsApp, connexion admin, export CSV.

### 8.4 Qualité de code
- **ESLint** avec règles spécifiques TypeScript + Tailwind pour garantir une base cohérente.
- **Prettier** pour le formatage automatique.
- **CI/CD** sur GitHub Actions : lint, tests unitaires et E2E exécutés à chaque PR.

## 9. Conclusion et Synthèse Frontend

Cette plateforme repose sur une base solide et modulaire : Next.js pour l’infrastructure, Tailwind et shadcn UI pour le style, Supabase pour la donnée, et un design épuré et accessible. Les composants réutilisables, le typage TypeScript et les tests à tous les niveaux garantissent une maintenance aisée et une évolution rapide vers d’autres masterclasses. Chaque principe — simplicité, performance, accessibilité — est appliqué de bout en bout pour offrir à l’étudiant un parcours fluide et aux administrateurs un outil clair, sécurisé et performant.

En suivant ces guidelines, toute personne intervenant sur le projet disposera d’une feuille de route précise pour développer, tester et faire évoluer le frontend sans friction ni ambiguïté.
