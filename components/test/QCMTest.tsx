'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

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

interface QCMTestProps {
  questions: Question[];
  testType: 'PRE' | 'POST';
  inscriptionId: string;
}

export function QCMTest({ questions, testType, inscriptionId }: QCMTestProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerSelect = (questionId: string, choice: string) => {
    setAnswers({ ...answers, [questionId]: choice });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Veuillez répondre à toutes les questions (${unanswered.length} restantes)`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inscription_id: inscriptionId,
          test_type: testType,
          answers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la soumission du test');
      }

      // For PRE test, redirect to dashboard after submission
      // For POST test, redirect to results page
      if (testType === 'PRE') {
        router.push(`/student/dashboard?test_completed=true`);
      } else {
        router.push(`/test/results/${result.test_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} sur {questions.length}
          </span>
          <span className="text-muted-foreground">
            {answeredCount}/{questions.length} réponses
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl">
              {currentQuestion + 1}. {question.question_text}
            </CardTitle>
            {answers[question.id] && (
              <Badge className="bg-accent text-accent-foreground shrink-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Répondu
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Answer Choices */}
          {(['A', 'B', 'C', 'D'] as const).map((choice) => (
            <button
              key={choice}
              onClick={() => handleAnswerSelect(question.id, choice)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                answers[question.id] === choice
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                    answers[question.id] === choice
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  }`}
                >
                  {choice}
                </div>
                <p className="flex-1 pt-1">{question.choices[choice]}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          Précédent
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Prenez votre temps</span>
        </div>

        {currentQuestion < questions.length - 1 ? (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < questions.length}
            size="lg"
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              'Soumettre le test'
            )}
          </Button>
        )}
      </div>

      {/* Info */}
      <Alert>
        <AlertDescription className="text-sm">
          💡 <strong>Important :</strong> Vous ne pouvez passer ce test qu&apos;une seule fois.
          Assurez-vous de vos réponses avant de soumettre.
        </AlertDescription>
      </Alert>
    </div>
  );
}
