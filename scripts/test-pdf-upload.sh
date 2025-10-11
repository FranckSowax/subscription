#!/bin/bash

echo "🧪 Test de l'upload PDF et génération de questions"
echo ""

# Créer un PDF de test simple
cat > /tmp/test.txt << 'EOF'
Introduction à l'Intelligence Artificielle

L'Intelligence Artificielle (IA) est une branche de l'informatique qui vise à créer des systèmes capables de réaliser des tâches nécessitant normalement l'intelligence humaine.

Les principaux domaines de l'IA incluent:
- L'apprentissage automatique (Machine Learning)
- Le traitement du langage naturel (NLP)
- La vision par ordinateur
- Les systèmes experts

Le Machine Learning permet aux ordinateurs d'apprendre à partir de données sans être explicitement programmés. Les réseaux de neurones artificiels sont inspirés du fonctionnement du cerveau humain.

Les applications de l'IA sont nombreuses: reconnaissance vocale, véhicules autonomes, recommandations personnalisées, diagnostic médical, etc.
EOF

echo "📄 Fichier de test créé: /tmp/test.txt"
echo ""

# Obtenir le masterclass_id
echo "🔍 Récupération du masterclass_id..."
MASTERCLASS_ID=$(curl -s http://localhost:3000/api/masterclass/default | python3 -c "import sys, json; print(json.load(sys.stdin)['masterclass']['id'])")

echo "✓ Masterclass ID: $MASTERCLASS_ID"
echo ""

echo "⚠️  Note: Ce test nécessite un vrai fichier PDF."
echo "   Le fichier texte ne fonctionnera pas car l'API attend un PDF."
echo ""
echo "📋 Pour tester manuellement:"
echo "   1. Allez sur http://localhost:3000/admin/questions"
echo "   2. Uploadez un fichier PDF"
echo "   3. Vérifiez les logs du serveur dans le terminal"
echo ""
echo "🔑 Vérification de la clé OpenAI..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY n'est pas définie dans l'environnement"
    echo "   Vérifiez votre fichier .env.local"
else
    echo "✓ OPENAI_API_KEY est définie"
fi
