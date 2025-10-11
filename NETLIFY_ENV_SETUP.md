# 🔐 Configuration des Variables d'Environnement Netlify

## ❌ Erreur Rencontrée

```
Error: Missing required environment variable `supabaseUrl`
Build failed during stage 'building site'
```

**Cause :** Les variables d'environnement Supabase ne sont pas configurées dans Netlify.

---

## ✅ Solution : Configurer les Variables d'Environnement

### 1. **Accéder aux Paramètres Netlify**

1. Aller sur [Netlify Dashboard](https://app.netlify.com)
2. Sélectionner votre site (subscription)
3. Aller dans **Site settings** → **Environment variables**

---

### 2. **Variables Requises**

#### Variables Supabase (OBLIGATOIRES)

```bash
# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://apqpsyugdmvrzaprugvw.supabase.co

# Clé anonyme publique (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici

# Clé de service (service role key) - SENSIBLE
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

#### Variables Optionnelles

```bash
# OpenAI (pour génération de questions - optionnel)
OPENAI_API_KEY=votre_openai_key_ici

# WhatsApp API (désactivé dans l'app)
# WHAPI_API_TOKEN=votre_whapi_token_ici

# URL de l'application
NEXT_PUBLIC_APP_URL=https://votre-site.netlify.app
```

---

### 3. **Où Trouver vos Clés Supabase**

#### Option A : Via le Dashboard Supabase

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet : **apqpsyugdmvrzaprugvw**
3. Aller dans **Settings** → **API**
4. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (cliquer "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

#### Option B : Via votre fichier local

Si vous avez déjà configuré l'app localement, vos clés sont dans `.env.local` :

```bash
# Afficher les variables (sans révéler les valeurs sensibles)
cat .env.local
```

---

### 4. **Ajouter les Variables dans Netlify**

#### Méthode 1 : Via l'Interface Web

1. Dans Netlify Dashboard → **Site settings** → **Environment variables**
2. Cliquer **Add a variable**
3. Pour chaque variable :
   - **Key** : Nom de la variable (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Values** : Valeur de la variable
   - **Scopes** : Sélectionner **All scopes** ou **Production**
4. Cliquer **Create variable**

#### Méthode 2 : Via Netlify CLI (si installé)

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Lier le projet
netlify link

# Ajouter les variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://apqpsyugdmvrzaprugvw.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "votre_anon_key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "votre_service_role_key"
```

---

### 5. **Vérifier la Configuration**

#### Checklist des Variables

```
✅ NEXT_PUBLIC_SUPABASE_URL
   Format : https://[project-id].supabase.co
   Exemple : https://apqpsyugdmvrzaprugvw.supabase.co

✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   Format : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Longueur : ~200+ caractères

✅ SUPABASE_SERVICE_ROLE_KEY
   Format : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Longueur : ~200+ caractères
   ⚠️ SENSIBLE - Ne jamais exposer publiquement
```

---

### 6. **Redéployer l'Application**

#### Option A : Redéploiement Automatique

Après avoir ajouté les variables, Netlify peut redéployer automatiquement.

#### Option B : Redéploiement Manuel

1. Dans Netlify Dashboard → **Deploys**
2. Cliquer **Trigger deploy** → **Clear cache and deploy site**

#### Option C : Via Git Push

```bash
# Faire un commit vide pour forcer le redéploiement
git commit --allow-empty -m "Trigger Netlify redeploy with env vars"
git push
```

---

## 🔒 Sécurité des Variables

### Variables Publiques (NEXT_PUBLIC_*)

- ✅ Exposées dans le code client
- ✅ Visibles dans le navigateur
- ✅ Peuvent être partagées
- Exemples : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Variables Privées

- ⚠️ **NE JAMAIS** exposer publiquement
- ⚠️ Utilisées uniquement côté serveur
- ⚠️ Ne pas committer dans Git
- Exemples : `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`

---

## 📋 Template de Configuration Netlify

### Variables Minimales Requises

```bash
# Copier-coller dans Netlify Environment Variables

# 1. URL Supabase
NEXT_PUBLIC_SUPABASE_URL=https://apqpsyugdmvrzaprugvw.supabase.co

# 2. Anon Key Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=[VOTRE_ANON_KEY_ICI]

# 3. Service Role Key Supabase
SUPABASE_SERVICE_ROLE_KEY=[VOTRE_SERVICE_ROLE_KEY_ICI]
```

### Variables Optionnelles

```bash
# OpenAI (si génération de questions activée)
OPENAI_API_KEY=[VOTRE_OPENAI_KEY_ICI]

# URL de l'app
NEXT_PUBLIC_APP_URL=https://[votre-site].netlify.app
```

---

## 🧪 Tester la Configuration

### 1. Vérifier les Variables dans Netlify

```bash
# Via Netlify CLI
netlify env:list
```

### 2. Vérifier le Build

Après avoir configuré les variables :

1. Aller dans **Deploys**
2. Vérifier les logs du dernier build
3. Chercher : `✓ Compiled successfully`

### 3. Tester l'Application Déployée

```bash
# Ouvrir l'app déployée
https://[votre-site].netlify.app

# Tester :
- Page d'accueil
- Inscription
- Connexion étudiant
```

---

## ❌ Problèmes Courants

### Erreur : "supabaseUrl is required"

**Cause :** Variable `NEXT_PUBLIC_SUPABASE_URL` manquante ou vide

**Solution :**
```bash
# Vérifier que la variable existe
netlify env:list | grep SUPABASE_URL

# Si manquante, l'ajouter
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://apqpsyugdmvrzaprugvw.supabase.co"
```

### Erreur : "supabaseAnonKey is required"

**Cause :** Variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` manquante ou vide

**Solution :**
```bash
# Ajouter la clé anon
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "votre_anon_key"
```

### Build Réussit mais App ne Fonctionne Pas

**Cause :** Variables mal configurées ou clés incorrectes

**Solution :**
1. Vérifier que les clés sont correctes dans Supabase Dashboard
2. Vérifier qu'il n'y a pas d'espaces avant/après les valeurs
3. Redéployer après correction

---

## 📊 Ordre de Configuration

### Étape par Étape

```
1. ✅ Récupérer les clés Supabase
   └─> Dashboard Supabase → Settings → API

2. ✅ Ajouter les variables dans Netlify
   └─> Site settings → Environment variables

3. ✅ Vérifier la configuration
   └─> netlify env:list

4. ✅ Redéployer
   └─> Trigger deploy ou git push

5. ✅ Vérifier le build
   └─> Deploys → Logs

6. ✅ Tester l'application
   └─> Ouvrir l'URL Netlify
```

---

## 🎯 Résumé

### Variables Obligatoires

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Supabase Dashboard → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme | Supabase Dashboard → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé de service (privée) | Supabase Dashboard → API (Reveal) |

### Après Configuration

- ✅ Variables ajoutées dans Netlify
- ✅ Build redéployé
- ✅ Application fonctionnelle

---

## 🔗 Liens Utiles

- **Netlify Dashboard** : https://app.netlify.com
- **Supabase Dashboard** : https://supabase.com/dashboard
- **Votre Projet Supabase** : https://supabase.com/dashboard/project/apqpsyugdmvrzaprugvw
- **Documentation Netlify Env Vars** : https://docs.netlify.com/environment-variables/overview/

---

## ✅ Checklist Finale

- [ ] Récupérer les 3 clés Supabase
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_URL` dans Netlify
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Netlify
- [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans Netlify
- [ ] Vérifier les variables (netlify env:list)
- [ ] Redéployer l'application
- [ ] Vérifier les logs de build
- [ ] Tester l'application déployée

---

**Une fois les variables configurées, le déploiement devrait réussir ! 🎉**
