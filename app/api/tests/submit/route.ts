import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inscription_id, test_type, answers } = body;

    // Validate input
    if (!inscription_id || !test_type || !answers) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    if (!['PRE', 'POST'].includes(test_type)) {
      return NextResponse.json(
        { error: 'Type de test invalide' },
        { status: 400 }
      );
    }

    // Check if inscription exists
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('*, masterclasses(id), profiles(id)')
      .eq('id', inscription_id)
      .single();

    if (inscriptionError || !inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      );
    }

    // Get user email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileId = (inscription as any).profiles?.id;
    const { data: authUser } = await supabase.auth.admin.getUserById(profileId);
    const userEmail = authUser?.user?.email || '';

    // Check if test already taken
    const { data: existingTest } = await supabase
      .from('tests')
      .select('id')
      .eq('inscription_id', inscription_id)
      .eq('type', test_type)
      .single();

    if (existingTest) {
      return NextResponse.json(
        { error: `Vous avez déjà passé le test ${test_type === 'PRE' ? 'de pré-évaluation' : 'post-masterclass'}` },
        { status: 409 }
      );
    }

    // Get questions with correct answers
    const questionIds = Object.keys(answers);
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_choice')
      .in('id', questionIds);

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des questions' },
        { status: 500 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const detailedAnswers = questions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_choice;
      if (isCorrect) correctCount++;

      return {
        question_id: question.id,
        user_answer: userAnswer,
        correct_answer: question.correct_choice,
        is_correct: isCorrect,
      };
    });

    const score = correctCount;
    const maxScore = questions.length;

    // Save test result
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        inscription_id,
        type: test_type,
        score,
        max_score: maxScore,
        responses: detailedAnswers,
      })
      .select()
      .single();

    if (testError) {
      console.error('Test insert error:', testError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du test' },
        { status: 500 }
      );
    }

    // If PRE test and score is sufficient, validate inscription
    if (test_type === 'PRE' && score >= maxScore * 0.5) {
      await supabase
        .from('inscriptions')
        .update({ validated: true })
        .eq('id', inscription_id);
    }

    // Note: WhatsApp notifications are disabled
    // Students will see their results on the dashboard

    return NextResponse.json({
      success: true,
      test_id: test.id,
      score,
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      passed: test_type === 'PRE' ? score >= maxScore * 0.5 : true,
      email: userEmail,
    });
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
