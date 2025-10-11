import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get test with inscription details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select(`
        *,
        inscriptions (
          id,
          profiles (
            full_name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test non trouvé' },
        { status: 404 }
      );
    }

    // Get questions with full details
    const responses = test.responses as Array<{
      question_id: string;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
    }>;

    const questionIds = responses.map((r) => r.question_id);
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    // Combine questions with user answers
    const detailedResults = responses.map((response) => {
      const question = questions?.find((q) => q.id === response.question_id);
      return {
        ...response,
        question,
      };
    });

    return NextResponse.json({
      test: {
        id: test.id,
        type: test.type,
        score: test.score,
        max_score: test.max_score,
        percentage: Math.round((test.score / test.max_score) * 100),
        taken_at: test.taken_at,
        passed: test.type === 'PRE' ? test.score >= test.max_score * 0.5 : true,
      },
      student: {
        name: test.inscriptions?.profiles?.full_name || 'Étudiant',
      },
      inscription_id: test.inscription_id,
      results: detailedResults,
    });
  } catch (error) {
    console.error('Get test error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
