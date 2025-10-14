'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, Timer } from 'lucide-react';

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

interface ShuffledQuestion extends Question {
  choiceMapping: Record<string, string>; // nouvelle lettre -> ancienne lettre
}

interface QCMTestProps {
  questions: Question[];
  testType: 'PRE' | 'POST';
  inscriptionId: string;
}

const TIMER_DURATION = 15; // 15 secondes par question

// Fonction pour mélanger les choix d'une question
function shuffleQuestionChoices(question: Question): ShuffledQuestion {
  const choices = question.choices;
  
  // Créer un tableau des choix avec leurs lettres originales
  const choicesArray = [
    { originalLetter: 'A', text: choices.A },
    { originalLetter: 'B', text: choices.B },
    { originalLetter: 'C', text: choices.C },
    { originalLetter: 'D', text: choices.D },
  ];
  
  // Mélanger l'ordre (Fisher-Yates shuffle)
  for (let i = choicesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choicesArray[i], choicesArray[j]] = [choicesArray[j], choicesArray[i]];
  }
  
  // Reconstruire les choix et créer le mapping
  const shuffledChoices: { A: string; B: string; C: string; D: string } = {
    A: '', B: '', C: '', D: ''
  };
  const choiceMapping: Record<string, string> = {};
  const letters = ['A', 'B', 'C', 'D'];
  
  choicesArray.forEach((choice, index) => {
    const newLetter = letters[index];
    shuffledChoices[newLetter as keyof typeof shuffledChoices] = choice.text;
    choiceMapping[newLetter] = choice.originalLetter;
  });
  
  return {
    ...question,
    choices: shuffledChoices,
    choiceMapping,
  };
}

export function QCMTest({ questions, testType, inscriptionId }: QCMTestProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mélanger les questions une seule fois au chargement
  const [shuffledQuestions] = useState<ShuffledQuestion[]>(() => 
    questions.map(q => shuffleQuestionChoices(q))
  );

  // Timer effect
  useEffect(() => {
    // Reset timer when question changes
    setTimeLeft(TIMER_DURATION);
    
    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Don't start timer if submitting
    if (isSubmitting) return;

    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up! Move to next question automatically
          if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
          } else {
            // Last question - auto submit if all answered
            const allAnswered = shuffledQuestions.every((q) => answers[q.id]);
            if (allAnswered) {
              handleSubmit();
            }
          }
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, isSubmitting]);

  const handleAnswerSelect = (questionId: string, choice: string) => {
    setAnswers({ ...answers, [questionId]: choice });
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(TIMER_DURATION);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTimeLeft(TIMER_DURATION);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = shuffledQuestions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Veuillez répondre à toutes les questions (${unanswered.length} restantes)`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convertir les réponses mélangées en réponses originales
      const originalAnswers: Record<string, string> = {};
      Object.keys(answers).forEach((questionId) => {
        const shuffledQuestion = shuffledQuestions.find(q => q.id === questionId);
        if (shuffledQuestion) {
          const shuffledChoice = answers[questionId]; // ex: "C"
          const originalChoice = shuffledQuestion.choiceMapping[shuffledChoice]; // ex: "B"
          originalAnswers[questionId] = originalChoice;
        }
      });

      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inscription_id: inscriptionId,
          test_type: testType,
          answers: originalAnswers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la soumission du test');
      }

      // For PRE test, redirect to confirmation page
      // For POST test, redirect to results page
      if (testType === 'PRE') {
        const email = result.email || '';
        router.push(`/test/confirmation?email=${encodeURIComponent(email)}`);
      } else {
        router.push(`/test/results/${result.test_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  const question = shuffledQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const timerProgress = (timeLeft / TIMER_DURATION) * 100;
  const isTimerLow = timeLeft <= 10;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} sur {shuffledQuestions.length}
          </span>
          <span className="text-muted-foreground">
            {answeredCount}/{shuffledQuestions.length} réponses
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary via-accent to-primary h-3 rounded-full transition-all duration-300 shadow-lg shadow-primary/30"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timer Display */}
      <Card className={`border-2 transition-all duration-300 ${
        isTimerLow 
          ? 'border-destructive bg-destructive/5 shadow-lg shadow-destructive/20 animate-pulse' 
          : 'border-primary/30 bg-primary/5'
      }`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`relative flex items-center justify-center w-16 h-16 rounded-full ${
                isTimerLow ? 'bg-destructive/10' : 'bg-primary/10'
              }`}>
                {/* Circular progress */}
                <svg className="absolute w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className={isTimerLow ? 'text-destructive/20' : 'text-primary/20'}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerProgress / 100)}`}
                    className={`transition-all duration-1000 ${
                      isTimerLow ? 'text-destructive' : 'text-primary'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="relative flex flex-col items-center">
                  <Timer className={`h-5 w-5 ${isTimerLow ? 'text-destructive' : 'text-primary'}`} />
                  <span className={`text-lg font-bold ${
                    isTimerLow ? 'text-destructive' : 'text-primary'
                  }`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
              <div>
                <p className={`font-semibold text-sm ${
                  isTimerLow ? 'text-destructive' : 'text-foreground'
                }`}>
                  {isTimerLow ? '⚠️ Temps presque écoulé !' : '⏱️ Temps restant'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isTimerLow 
                    ? 'Dépêchez-vous de répondre !' 
                    : 'Vous avez 15 secondes par question'
                  }
                </p>
              </div>
            </div>
            {isTimerLow && (
              <Badge variant="destructive" className="animate-bounce">
                {timeLeft}s
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 shadow-lg bg-gradient-to-br from-white via-primary/5 to-accent/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
              className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                answers[question.id] === choice
                  ? 'border-primary bg-gradient-to-r from-primary/10 to-accent/10 shadow-md shadow-primary/20'
                  : 'border-border hover:border-primary/50 bg-gradient-to-r from-white to-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 font-semibold ${
                    answers[question.id] === choice
                      ? 'border-primary bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30'
                      : 'border-border bg-white'
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

        <div className={`flex items-center gap-2 text-sm font-medium ${
          isTimerLow ? 'text-destructive' : 'text-primary'
        }`}>
          <Clock className="h-4 w-4" />
          <span>{timeLeft}s restantes</span>
        </div>

        {currentQuestion < shuffledQuestions.length - 1 ? (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < shuffledQuestions.length}
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
        <AlertDescription className="text-sm space-y-1">
          <p>
            ⏱️ <strong>Timer :</strong> Vous avez 15 secondes par question. Passé ce délai, la question suivante s&apos;affichera automatiquement.
          </p>
          <p>
            💡 <strong>Important :</strong> Vous ne pouvez passer ce test qu&apos;une seule fois. Assurez-vous de vos réponses.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
