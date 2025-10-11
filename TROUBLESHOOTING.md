# 🔧 Guide de Dépannage

## Erreur 500 sur la Page d'Accueil

### Cause Probable
L'erreur 500 est généralement causée par :
1. Variables d'environnement manquantes
2. Base de données Supabase non configurée
3. Cache Next.js corrompu

### Solutions

#### 1. Vérifier les Variables d'Environnement

```bash
node scripts/check-env.js
```

Si des variables manquent, vérifiez que `.env.local` contient :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://apqpsyugdmvrzaprugvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
OPENAI_API_KEY=votre_clé_openai
```

#### 2. Nettoyer le Cache Next.js

```bash
# Arrêter le serveur (Ctrl+C)

# Supprimer le cache
rm -rf .next

# Redémarrer
npm run dev
```

#### 3. Vérifier la Base de Données Supabase

La migration SQL doit être appliquée :

1. Aller sur : https://apqpsyugdmvrzaprugvw.supabase.co/project/apqpsyugdmvrzaprugvw/sql
2. Copier le contenu de `supabase/migrations/001_initial_schema.sql`
3. Coller dans "New Query"
4. Cliquer "Run"

#### 4. Redémarrer Complètement

```bash
# Arrêter tous les processus Next.js
pkill -f "next dev"

# Nettoyer
rm -rf .next
rm -rf node_modules/.cache

# Redémarrer
npm run dev
```

---

## Autres Erreurs Courantes

### Erreur : "Cannot find module"

**Solution :**
```bash
npm install
```

### Erreur : "Port 3000 already in use"

**Solution :**
```bash
# Tuer le processus sur le port 3000
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
npm run dev -- -p 3001
```

### Erreur : "Supabase connection failed"

**Solution :**
1. Vérifier que le projet Supabase n'est pas en pause
2. Vérifier les credentials dans `.env.local`
3. Tester la connexion :
```bash
node scripts/test-connection.js
```

### Erreur : "OpenAI API key invalid"

**Solution :**
1. Vérifier la clé API sur https://platform.openai.com
2. Mettre à jour `OPENAI_API_KEY` dans `.env.local`
3. Redémarrer le serveur

### Erreur : "WhatsApp notification failed"

**Solution :**
1. Vérifier le token Whapi sur https://whapi.cloud
2. Mettre à jour `WHAPI_API_TOKEN` dans `.env.local`
3. Note : Les notifications WhatsApp sont optionnelles, l'app fonctionne sans

---

## Vérifications Rapides

### ✅ Checklist de Démarrage

- [ ] `.env.local` existe et contient les bonnes variables
- [ ] Migration SQL appliquée sur Supabase
- [ ] `npm install` exécuté
- [ ] Pas d'autre processus sur le port 3000
- [ ] Connexion internet active

### 🧪 Tests de Fonctionnement

```bash
# 1. Vérifier les variables d'environnement
node scripts/check-env.js

# 2. Tester la connexion Supabase
node scripts/test-connection.js

# 3. Build de production
npm run build

# 4. Démarrer en dev
npm run dev
```

---

## Logs de Débogage

### Activer les Logs Détaillés

Ajouter dans `.env.local` :
```bash
DEBUG=*
NODE_ENV=development
```

### Voir les Logs du Serveur

Les logs s'affichent dans le terminal où vous avez lancé `npm run dev`.

Cherchez :
- ❌ Erreurs rouges
- ⚠️ Warnings jaunes
- Stack traces avec fichiers et lignes

---

## Support

### Fichiers de Documentation

- `SETUP.md` - Configuration initiale
- `DATABASE_SETUP.md` - Base de données
- `QUICK_START.md` - Démarrage rapide
- `PROJECT_COMPLETE.md` - Vue d'ensemble

### Commandes Utiles

```bash
# Vérifier la version de Node
node --version  # Doit être >= 18

# Vérifier la version de npm
npm --version

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Build de test
npm run build

# Vérifier TypeScript
npm run type-check

# Linter
npm run lint
```

---

## Solution Rapide (Reset Complet)

Si rien ne fonctionne :

```bash
# 1. Arrêter tout
pkill -f "next dev"

# 2. Nettoyer complètement
rm -rf .next
rm -rf node_modules
rm -rf .turbo

# 3. Réinstaller
npm install

# 4. Vérifier l'environnement
node scripts/check-env.js

# 5. Redémarrer
npm run dev
```

---

## Problèmes Connus

### 1. Erreur "punycode deprecated"

**Impact :** Aucun, c'est juste un warning
**Solution :** Peut être ignoré en toute sécurité

### 2. Middleware qui boucle

**Symptôme :** Page qui charge indéfiniment
**Solution :** Vérifier que le matcher dans `middleware.ts` exclut bien les fichiers statiques

### 3. RLS Policies qui bloquent

**Symptôme :** Erreur "permission denied"
**Solution :** Vérifier que les policies RLS sont bien créées dans Supabase

---

**Si le problème persiste, vérifiez les logs du serveur de développement pour plus de détails.**
