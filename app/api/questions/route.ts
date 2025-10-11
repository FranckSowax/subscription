import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const masterclassId = searchParams.get('masterclass_id');
    const testType = searchParams.get('test_type'); // 'PRE' or 'POST'

    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (masterclassId) {
      query = query.eq('masterclass_id', masterclassId);
    }

    if (testType) {
      query = query.eq('test_type', testType);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

// POST - Create a new question manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { masterclass_id, question_text, choices, correct_choice } = body;

    // Validate required fields
    if (!masterclass_id || !question_text || !choices || !correct_choice) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validate choices structure
    if (!choices.A || !choices.B || !choices.C || !choices.D) {
      return NextResponse.json(
        { error: 'Les 4 choix (A, B, C, D) sont requis' },
        { status: 400 }
      );
    }

    // Validate correct_choice
    if (!['A', 'B', 'C', 'D'].includes(correct_choice)) {
      return NextResponse.json(
        { error: 'La réponse correcte doit être A, B, C ou D' },
        { status: 400 }
      );
    }

    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        masterclass_id,
        question_text,
        choices,
        correct_choice,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la question' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question créée avec succès',
        question,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
