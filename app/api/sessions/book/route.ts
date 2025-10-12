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

    // Vérifier si l'utilisateur a déjà une réservation
    const { data: existingBooking } = await supabase
      .from('session_bookings')
      .select('id')
      .eq('inscription_id', inscription_id)
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Vous avez déjà réservé une session' },
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

    // Créer la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('session_bookings')
      .insert({
        inscription_id,
        session_id,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking error:', bookingError);
      return NextResponse.json(
        { error: 'Erreur lors de la réservation de la session' },
        { status: 500 }
      );
    }

    // Mettre à jour le compteur de participants
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ current_participants: session.current_participants + 1 })
      .eq('id', session_id);

    if (updateError) {
      console.error('Update session participants error:', updateError);
      // Ne pas échouer si la mise à jour échoue, la réservation est déjà créée
    }

    console.log('Booking created successfully:', booking);

    return NextResponse.json({
      success: true,
      message: 'Session réservée avec succès',
      booking,
    });
  } catch (error) {
    console.error('Book session error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
