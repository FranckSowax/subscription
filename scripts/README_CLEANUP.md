# Résolution Erreur "Failed to fetch (api.supabase.com)"

## 🔴 Problème

Erreur lors de l'exécution du script SQL dans Supabase :
```
Error: Failed to fetch (api.supabase.com)
```

---

## ✅ Solution 1 : Dashboard Supabase (Recommandé)

### **Étapes :**

1. **Ouvrir le Dashboard**
   - Allez sur [https://app.supabase.com](https://app.supabase.com)
   - Connectez-vous à votre compte
   - Sélectionnez votre projet

2. **Accéder au SQL Editor**
   - Menu gauche → **SQL Editor**
   - Cliquez sur **New query** (bouton vert)

3. **Copier UNIQUEMENT l'Étape 1**
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

4. **Cliquer sur Run** (▶️ en haut à droite)

5. **Vérifier les résultats**
   - Si aucune ligne → Pas de données orphelines ✅
   - Si des lignes → Continuer avec les étapes suivantes

---

## ✅ Solution 2 : Script Node.js (Si Dashboard ne fonctionne pas)

### **Installation**

```bash
cd /Users/sowax/Desktop/SUBSCRIPTION\ STUDIA\ CCPE/CascadeProjects/windsurf-project
npm install
```

### **Exécution**

```bash
node scripts/cleanup-orphans.js
```

### **Résultat Attendu**
```
🚀 Démarrage du nettoyage des données orphelines

🔍 Identification des inscriptions orphelines...

📊 Inscriptions orphelines trouvées: 3

  - abc-123-def
    Profile: xyz-789
    Bookings: 1, Tests: 2

🧹 Nettoyage des session_bookings orphelins...
  ✅ Session abc: 15 → 14

✅ 3 bookings supprimés
✅ 4 tests supprimés
✅ 3 inscriptions supprimées

🎉 Nettoyage terminé avec succès!
```

---

## ✅ Solution 3 : Vider le Cache Navigateur

### **Chrome / Edge**
1. `Ctrl + Shift + Delete` (Windows) ou `Cmd + Shift + Delete` (Mac)
2. Cocher **Images et fichiers en cache**
3. Cliquer sur **Effacer les données**
4. Redémarrer le navigateur
5. Réessayer

### **Safari**
1. `Cmd + Option + E`
2. Ou menu **Développement** → **Vider les caches**
3. Redémarrer Safari
4. Réessayer

### **Firefox**
1. `Ctrl + Shift + Delete`
2. Sélectionner **Cache**
3. Cliquer sur **Effacer maintenant**
4. Réessayer

---

## ✅ Solution 4 : Mode Incognito / Navigation Privée

1. **Ouvrir fenêtre privée**
   - Chrome : `Ctrl + Shift + N`
   - Safari : `Cmd + Shift + N`
   - Firefox : `Ctrl + Shift + P`

2. **Aller sur Supabase**
   - [https://app.supabase.com](https://app.supabase.com)

3. **Se connecter**

4. **Réessayer le script SQL**

---

## ✅ Solution 5 : Désactiver Extensions

### **Extensions qui peuvent bloquer :**
- AdBlock / uBlock Origin
- Privacy Badger
- VPN (NordVPN, ExpressVPN, etc.)
- Extensions de sécurité

### **Procédure :**
1. Aller dans les paramètres du navigateur
2. Extensions / Add-ons
3. Désactiver temporairement les extensions
4. Réessayer

---

## ✅ Solution 6 : Vérifier le Statut Supabase

1. **Aller sur** [https://status.supabase.com](https://status.supabase.com)

2. **Vérifier l'état des services**
   - Database : ✅ Opérationnel
   - API : ✅ Opérationnel
   - Dashboard : ✅ Opérationnel

3. **Si panne** → Attendre la résolution

---

## 🔧 Diagnostic Avancé

### **Test de Connexion**

Ouvrez la console du navigateur (`F12`) et exécutez :

```javascript
fetch('https://api.supabase.com')
  .then(response => console.log('✅ Connexion OK'))
  .catch(error => console.error('❌ Erreur:', error));
```

**Résultat attendu :**
- `✅ Connexion OK` → Le problème vient d'ailleurs
- `❌ Erreur: CORS` → Problème de configuration
- `❌ Erreur: Network` → Problème réseau/firewall

### **Vérifier les Variables d'Environnement**

Si vous utilisez le script Node.js :

```bash
# Vérifier que les variables existent
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

Si vides, créez un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

---

## 📋 Checklist de Résolution

- [ ] Utiliser Dashboard Supabase Web (pas VSCode)
- [ ] Copier UNIQUEMENT l'Étape 1 (simple SELECT)
- [ ] Vérifier connexion Internet
- [ ] Vider le cache du navigateur
- [ ] Essayer en mode incognito
- [ ] Désactiver extensions (AdBlock, VPN)
- [ ] Vérifier statut Supabase (status.supabase.com)
- [ ] Si tout échoue, utiliser le script Node.js

---

## 🎯 Quelle Méthode Choisir ?

### **Méthode 1 : Dashboard Supabase** (⭐ Recommandé)
✅ Simple et direct  
✅ Pas besoin de code  
✅ Interface visuelle  
❌ Nécessite connexion internet stable

### **Méthode 2 : Script Node.js** (⭐ Si Dashboard ne marche pas)
✅ Fonctionne en local  
✅ Logs détaillés  
✅ Confirmation avant suppression  
❌ Nécessite Node.js installé

---

## 💡 Conseil

**Commencez toujours par l'Étape 1 (SELECT)** pour identifier les données avant de les supprimer. Ne lancez jamais un DELETE sans vérification préalable !

---

## 🆘 Si Rien ne Fonctionne

1. **Contactez le support Supabase**
   - [https://supabase.com/support](https://supabase.com/support)
   - Discord : [https://discord.supabase.com](https://discord.supabase.com)

2. **Vérifiez les logs**
   - Dashboard Supabase → Logs → Database
   - Cherchez les erreurs récentes

3. **Essayez un autre réseau**
   - WiFi différent
   - Partage de connexion mobile
   - VPN d'entreprise pourrait bloquer

---

Bonne chance ! 🚀
