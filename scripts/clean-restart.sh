#!/bin/bash

echo "🧹 Nettoyage et redémarrage du projet..."
echo ""

# Arrêter les processus Next.js
echo "1️⃣ Arrêt des processus Next.js..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Nettoyer les caches
echo "2️⃣ Nettoyage des caches..."
rm -rf .next
rm -rf .turbo
rm -rf node_modules/.cache

# Vérifier les variables d'environnement
echo "3️⃣ Vérification des variables d'environnement..."
node scripts/check-env.js

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Erreur : Variables d'environnement manquantes!"
  echo "Veuillez configurer .env.local avant de continuer."
  exit 1
fi

echo ""
echo "✅ Nettoyage terminé!"
echo ""
echo "🚀 Pour démarrer le serveur, exécutez:"
echo "   npm run dev"
echo ""
