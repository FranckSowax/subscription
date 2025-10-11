'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Award, Home, Loader2 } from 'lucide-react';

interface TestResult {
  test: {
    id: string;
    type: 'PRE' | 'POST';
    score: number;
    max_score: number;
    percentage: number;
    taken_at: string;
    passed: boolean;
  };
  student: {
    name: string;
  };
  inscription_id: string;
  results: Array<{
    question_id: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    question: {
      id: string;
      question_text: string;
      choices: {
        A: string;
        B: string;
        C: string;
        D: string;
      };
    };
  }>;
}

export default function TestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/tests/${id}`);
        if (!response.ok) {
          throw new Error('Résultats non trouvés');
        }
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button>Retour à l&apos;accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { test, student, results } = result;
  const correctCount = results.filter((r) => r.is_correct).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-primary">Résultats du Test</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Score Card */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {test.passed ? (
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <Award className="h-10 w-10 text-accent" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl mb-2">
                {test.passed ? 'Félicitations !' : 'Test non validé'}
              </CardTitle>
              <p className="text-muted-foreground">
                {student.name} - Test {test.type === 'PRE' ? 'de pré-évaluation' : 'post-masterclass'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">{test.score}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">{test.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Réussite</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">{correctCount}/{test.max_score}</p>
                  <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                </div>
              </div>

              {test.type === 'PRE' && (
                <div className="mt-6 p-4 bg-secondary rounded-lg text-center space-y-3">
                  <p className="text-sm">
                    ✅ Merci d&apos;avoir complété le test d&apos;évaluation !
                    <br />
                    Votre session de masterclass a déjà été réservée.
                  </p>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-semibold text-primary">
                      🔐 Pour accéder à votre dashboard :
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Connectez-vous avec votre email sur <strong>/student/login</strong>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Corrections */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Corrections détaillées</h2>
            {results.map((result, index) => (
              <Card
                key={result.question_id}
                className={`border-l-4 ${
                  result.is_correct ? 'border-l-accent' : 'border-l-destructive'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">
                      {index + 1}. {result.question.question_text}
                    </CardTitle>
                    {result.is_correct ? (
                      <Badge className="bg-accent text-accent-foreground shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="shrink-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Show all choices */}
                  {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                    const isUserAnswer = choice === result.user_answer;
                    const isCorrectAnswer = choice === result.correct_answer;

                    return (
                      <div
                        key={choice}
                        className={`p-3 rounded-lg border-2 ${
                          isCorrectAnswer
                            ? 'border-accent bg-accent/5'
                            : isUserAnswer
                            ? 'border-destructive bg-destructive/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                              isCorrectAnswer
                                ? 'border-accent bg-accent text-accent-foreground'
                                : isUserAnswer
                                ? 'border-destructive bg-destructive text-destructive-foreground'
                                : 'border-border'
                            }`}
                          >
                            {choice}
                          </div>
                          <div className="flex-1">
                            <p className="pt-1">{result.question.choices[choice]}</p>
                            {isCorrectAnswer && (
                              <p className="text-sm text-accent mt-1">✓ Bonne réponse</p>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <p className="text-sm text-destructive mt-1">✗ Votre réponse</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-8">
            <Link href="/">
              <Button size="lg">
                <Home className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
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
