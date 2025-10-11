import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get a single question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !question) {
      return NextResponse.json(
        { error: 'Question non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

// PUT - Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { question_text, choices, correct_choice } = body;

    // Validate at least one field to update
    if (!question_text && !choices && !correct_choice) {
      return NextResponse.json(
        { error: 'Au moins un champ doit être fourni pour la mise à jour' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (question_text) updateData.question_text = question_text;
    if (choices) {
      // Validate choices structure
      if (!choices.A || !choices.B || !choices.C || !choices.D) {
        return NextResponse.json(
          { error: 'Les 4 choix (A, B, C, D) sont requis' },
          { status: 400 }
        );
      }
      updateData.choices = choices;
    }
    if (correct_choice) {
      // Validate correct_choice
      if (!['A', 'B', 'C', 'D'].includes(correct_choice)) {
        return NextResponse.json(
          { error: 'La réponse correcte doit être A, B, C ou D' },
          { status: 400 }
        );
      }
      updateData.correct_choice = correct_choice;
    }

    const { data: question, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question mise à jour avec succès',
      question,
    });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question supprimée avec succès',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
