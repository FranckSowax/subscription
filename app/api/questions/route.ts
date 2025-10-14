import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types pour les questions
interface QuestionChoices {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface Question {
  id: string;
  masterclass_id: string;
  question_text: string;
  choices: QuestionChoices;
  correct_choice: 'A' | 'B' | 'C' | 'D';
  test_type: 'PRE' | 'POST';
  created_at: string;
}

// Fonction pour mélanger les choix d'une question
function shuffleChoices(question: Question): Question {
  const choices = question.choices;
  const correctChoice = question.correct_choice;
  
  // Créer un tableau des choix avec leurs lettres
  const choicesArray = [
    { letter: 'A' as const, text: choices.A },
    { letter: 'B' as const, text: choices.B },
    { letter: 'C' as const, text: choices.C },
    { letter: 'D' as const, text: choices.D },
  ];
  
  // Mélanger l'ordre des choix (Fisher-Yates shuffle)
  for (let i = choicesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choicesArray[i], choicesArray[j]] = [choicesArray[j], choicesArray[i]];
  }
  
  // Reconstruire les choix dans le nouvel ordre
  const shuffledChoices: QuestionChoices = { A: '', B: '', C: '', D: '' };
  let newCorrectChoice: 'A' | 'B' | 'C' | 'D' = 'A';
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  
  choicesArray.forEach((choice, index) => {
    shuffledChoices[letters[index]] = choice.text;
    // Trouver où est passée la bonne réponse
    if (choice.letter === correctChoice) {
      newCorrectChoice = letters[index];
    }
  });
  
  return {
    ...question,
    choices: shuffledChoices,
    correct_choice: newCorrectChoice,
  };
}

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

    // Mélanger les choix pour chaque question
    const shuffledQuestions = questions?.map(q => shuffleChoices(q)) || [];

    return NextResponse.json({ questions: shuffledQuestions });
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
