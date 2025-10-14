import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { inscription_id, session_id } = await request.json();

    if (!inscription_id || !session_id) {
      return NextResponse.json(
        { error: 'inscription_id et session_id sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'inscription existe
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('id')
      .eq('id', inscription_id)
      .single();

    if (inscriptionError || !inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si une session a déjà été sélectionnée
    const { data: inscriptionData } = await supabase
      .from('inscriptions')
      .select('selected_session_id')
      .eq('id', inscription_id)
      .single();

    if (inscriptionData?.selected_session_id) {
      return NextResponse.json(
        { error: 'Vous avez déjà sélectionné une session. Passez le pré-test pour finaliser votre inscription.' },
        { status: 400 }
      );
    }

    // Vérifier si la session existe et n'est pas pleine
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    console.log('Session found:', session);
    console.log('Session error:', sessionError);

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    if (session.current_participants >= session.max_participants) {
      return NextResponse.json(
        { error: 'Cette session est complète. Veuillez choisir une autre date.' },
        { status: 400 }
      );
    }

    // Stocker la session sélectionnée dans l'inscription (pas encore de réservation)
    const { error: updateError } = await supabase
      .from('inscriptions')
      .update({ selected_session_id: session_id })
      .eq('id', inscription_id);

    if (updateError) {
      console.error('Update inscription error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la sélection de la session' },
        { status: 500 }
      );
    }

    console.log('Session selected successfully for inscription:', inscription_id);

    return NextResponse.json({
      success: true,
      message: 'Session sélectionnée avec succès. Passez maintenant le pré-test pour finaliser votre inscription.',
      session: {
        id: session.id,
        session_date: session.session_date,
      },
    });
  } catch (error) {
    console.error('Book session error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
