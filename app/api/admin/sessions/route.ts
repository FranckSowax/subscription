import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all sessions with their bookings
    const { data: sessions, error: sessionsError } = await supabase
      .from('masterclass_sessions')
      .select(`
        id,
        session_date,
        max_participants,
        current_participants
      `)
      .order('session_date', { ascending: true });

    if (sessionsError) {
      console.error('Sessions error:', sessionsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des sessions' },
        { status: 500 }
      );
    }

    // For each session, get the participants
    const sessionsWithParticipants = await Promise.all(
      sessions.map(async (session) => {
        const { data: bookings } = await supabase
          .from('session_bookings')
          .select(`
            inscription_id,
            inscriptions (
              id,
              profile_id,
              registration_date,
              validated,
              profiles (
                full_name,
                whatsapp_number
              )
            )
          `)
          .eq('session_id', session.id);

        // Get test scores for each inscription
        const participants = await Promise.all(
          (bookings || []).map(async (booking) => {
            const inscription = booking?.inscriptions;
            if (!inscription || !inscription.id) return null;

            // Get PRE test score
            const { data: preTest } = await supabase
              .from('tests')
              .select('score')
              .eq('inscription_id', inscription.id as string)
              .eq('type', 'PRE')
              .single();

            // Get email from auth.users
            const { data: authUser } = await supabase.auth.admin.getUserById(
              inscription.profile_id as string
            );

            return {
              full_name: inscription.profiles?.full_name || 'N/A',
              email: authUser?.user?.email || 'N/A',
              whatsapp_number: inscription.profiles?.whatsapp_number || 'N/A',
              registration_date: inscription.registration_date,
              pre_test_score: preTest?.score || null,
              validated: inscription.validated,
            };
          })
        );

        return {
          ...session,
          participants: participants.filter(p => p !== null),
        };
      })
    );

    return NextResponse.json({
      sessions: sessionsWithParticipants,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
