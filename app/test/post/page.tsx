'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QCMTest } from '@/components/test/QCMTest';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Question {
  id: string;
  question_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

function PostTestContent() {
  const searchParams = useSearchParams();
  const inscriptionId = searchParams.get('inscription_id');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!inscriptionId) {
        setError('ID d\'inscription manquant');
        setIsLoading(false);
        return;
      }

      try {
        // Get masterclass ID from inscription
        const inscriptionResponse = await fetch(`/api/inscriptions/${inscriptionId}`);
        if (!inscriptionResponse.ok) {
          throw new Error('Inscription non trouvée');
        }
        const inscriptionData = await inscriptionResponse.json();
        const masterclassId = inscriptionData.inscription.masterclass_id;

        // Check if inscription is validated
        if (!inscriptionData.inscription.validated) {
          throw new Error('Vous devez d\'abord valider votre inscription avec le test de pré-évaluation');
        }

        // Get POST test questions for this masterclass
        const questionsResponse = await fetch(`/api/questions?masterclass_id=${masterclassId}&test_type=POST`);
        if (!questionsResponse.ok) {
          throw new Error('Erreur lors du chargement des questions');
        }
        const questionsData = await questionsResponse.json();
        
        if (!questionsData.questions || questionsData.questions.length === 0) {
          throw new Error('Aucune question disponible pour ce test');
        }

        // Use all POST questions (already 10 questions)
        setQuestions(questionsData.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [inscriptionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (error || !inscriptionId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Accès non autorisé'}</AlertDescription>
          </Alert>
          <Link href="/" className="block">
            <Button className="w-full">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-primary">Test Post-Masterclass</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center space-y-3">
          <h2 className="text-3xl font-bold">Évaluez vos acquis</h2>
          <p className="text-muted-foreground">
            Répondez aux 10 questions suivantes pour mesurer votre progression
          </p>
          <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-primary flex items-center justify-center gap-2">
              <span className="text-xl">⏱️</span>
              <span>Attention : Vous avez 15 secondes par question !</span>
            </p>
          </div>
        </div>

        <QCMTest 
          questions={questions} 
          testType="POST" 
          inscriptionId={inscriptionId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Masterclass IA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

export default function PostTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <PostTestContent />
    </Suspense>
  );
}
