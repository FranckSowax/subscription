import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Récupérer toutes les sessions avec le nombre de participants
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des sessions' },
        { status: 500 }
      );
    }

    // Calculer les statistiques globales
    const totalCapacity = sessions?.reduce((sum, s) => sum + s.max_participants, 0) || 0;
    const totalBooked = sessions?.reduce((sum, s) => sum + (s.current_participants || 0), 0) || 0;
    const availableSpots = totalCapacity - totalBooked;

    return NextResponse.json({
      sessions: sessions || [],
      stats: {
        totalCapacity,
        totalBooked,
        availableSpots,
        totalSessions: sessions?.length || 0,
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
