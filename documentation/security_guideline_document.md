# Security Guidelines for the AI Masterclass Platform

Cette section décrit les principes et pratiques de sécurité à appliquer dès la conception jusqu’à l’exploitation de la plateforme d’inscription et d’évaluation des étudiants.

## 1. Security by Design & Governance

- Intégrer la sécurité dès l’analyse des besoins et la conception (Threat Modeling).
- Documenter les principaux actifs (données personnelles, PDF de cours, clés API) et leurs risques (confidentialité, intégrité, disponibilité).  
- Mettre en place des revues de sécurité régulières (code review, architecture review, pentests légers).  
- Former l’équipe aux bonnes pratiques (OWASP Top 10, Supabase RLS, sécurité front-end Next.js).  

## 2. Authentication & Authorization

### 2.1. Gestion des utilisateurs et rôles
- Utiliser Supabase Auth pour gérer trois rôles : **étudiant**, **tuteur/formateur**, **administrateur**.  
- Implémenter des politiques RLS (Row Level Security) sur les tables `inscriptions`, `questions`, `résultats` : les étudiants ne voient que leurs propres données ; les tuteurs voient les résultats sans pouvoir modifier les utilisateurs ; les admins ont accès en lecture/écriture.  

### 2.2. Robustesse de l’authentification
- Exiger des mots de passe complexes (longueur ≥ 12 caractères, mélange de lettres, chiffres, symboles).  
- Hacher les mots de passe avec bcrypt/Argon2 (Supabase gère cela en standard).  
- Activer MFA (TOTP) pour les comptes tutor/admin.  
- Protéger contre le credential stuffing et les force brute : activer le verrouillage temporaire de compte après X tentatives échouées.  

### 2.3. Gestion de session
- Valider et renouveler les JWT (exp) côté serveur à chaque requête.  
- Définir une durée de vie raisonnable (~30 min d’inactivité, 24 h max).  
- Forcer la déconnexion sur changement de mot de passe ou révocation de token.  

## 3. Input Handling & Processing

### 3.1. Validation côté client et serveur
- Toutes les entrées (formulaires, fichiers PDF, QCM) sont considérées non fiables.  
- Valider la longueur, le format (regex) et la typologie (whatsapp : `+241[0-9]{8}`) sur le frontend et le backend.  

### 3.2. Prévention des injections
- Utiliser les ORM/PostgREST fournis par Supabase et éviter les requêtes SQL concaténées.  
- Échapper et encoder tout contenu dynamique injecté dans le DOM (XSS).  
- Scanner les fichiers PDF : limiter la taille (< 5 Mo) et rejeter les contenus suspects (scripts, macros).  

### 3.3. Traitement IA et PDF
- Nettoyer et normaliser le texte extrait du PDF avant de l’envoyer à GPT-4o.  
- Ne pas exposer directement le prompt utilisateur à l’IA pour éviter l’injection de prompts malveillants.  
- Valider côté serveur les questions générées : longueur, format JSON strict.  

## 4. Data Protection & Privacy

### 4.1. Chiffrement
- Transfert des données : forcer HTTPS/TLS 1.2+ (Next.js et Supabase configurés en HTTPS).  
- Données au repos : s’appuyer sur le chiffrement natif Supabase (PostgreSQL).  

### 4.2. Gestion des secrets
- Stocker les clés API (Supabase, GPT-4o, Whapi) dans des variables d’environnement chiffrées (Vercel Secrets, GitHub Secrets).  
- Ne pas hardcoder de secrets dans le code ou le dépôt.  

### 4.3. Confidentialité et RGPD local
- Réduire la collecte aux données strictement nécessaires (principe de minimisation).  
- Mettre à disposition la politique de confidentialité conforme au cadre gabonais.  
- Prévoir des mécanismes de suppression ou d’anonymisation sur demande (droit à l’effacement).  
- Ne pas exposer les adresses e-mail ou WhatsApp des étudiants dans les logs ou les exports publics.  

## 5. API & Service Security

- Restreindre les origines CORS aux domaines de production et de staging.  
- Mettre en place un throttling / rate limiting (Next.js Middleware ou Supabase Edge Functions) pour limiter les abus (QCM, IA, Whapi).  
- Valider côté serveur chaque appel à l’API (CSRF token pour form submissions si nécessaire).  
- Versionner les endpoints API (`/api/v1/...`) et appliquer des contrôles d’accès.  

## 6. Web Application Security Hygiene

- **Headers de sécurité** dans Next.js (`next.config.js`):  
  - Content-Security-Policy : restreindre les sources de script/styles.  
  - X-Frame-Options: DENY.  
  - Referrer-Policy: no-referrer-when-downgrade.  
  - X-Content-Type-Options: nosniff.  
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload.  

- **Cookies**: `Secure`, `HttpOnly`, `SameSite=Strict`.  
- **Anti-CSRF**: utiliser le pattern synchronizer token pour les requêtes de mutation.  

## 7. Infrastructure & Configuration Management

- Hébergement Frontend sur Vercel (ou autre) avec TLS.  
- Supabase en région compatible Gabon ou zone francophone proche.  
- Désactiver les modes debug/verbose en production (`NODE_ENV=production`).  
- Restreindre les ports/services exposés au minimum (HTTPS uniquement).  
- Automatiser les mises à jour de dépendances et de sécurité (Dependabot, Renovate).  
- Auditer régulièrement les logs et mettre en place une alerte SRE (Slack ou e-mail).  

## 8. Dependency Management

- Maintenir un `package-lock.json` ou `yarn.lock`.  
- Scanner les vulnérabilités (npm audit, Snyk, GitHub Advanced Security).  
- Supprimer les dépendances non utilisées pour réduire la surface d’attaque.  

## 9. Surveillance & Réponse aux incidents

- Mettre en place un plan de réponse aux incidents (notifications, rollback).  
- Surveiller les logs d’accès et d’erreurs (Sentry, Datadog).  
- Tester les procédures de restauration de base de données et de secrets.  

---

En appliquant ces recommandations, vous garantissez une plateforme résiliente, conforme aux exigences RGPD gabonaises et sécurisée tout au long de son cycle de vie.