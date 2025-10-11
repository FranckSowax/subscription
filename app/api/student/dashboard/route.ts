import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inscriptionId = searchParams.get('inscription_id');

    if (!inscriptionId) {
      return NextResponse.json(
        { error: 'ID d\'inscription requis' },
        { status: 400 }
      );
    }

    // Get inscription with profile and session info
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select(`
        id,
        validated,
        registration_date,
        profile_id,
        profiles (
          full_name,
          whatsapp_number,
          gender
        )
      `)
      .eq('id', inscriptionId)
      .single();

    if (inscriptionError || !inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      );
    }

    // Get session booking
    const { data: sessionBooking } = await supabase
      .from('session_bookings')
      .select(`
        sessions (
          session_date,
          max_participants
        )
      `)
      .eq('inscription_id', inscriptionId)
      .single();

    // Get tests
    const { data: tests } = await supabase
      .from('tests')
      .select('type, score, max_score, taken_at')
      .eq('inscription_id', inscriptionId);

    const preTest = tests?.find(t => t.type === 'PRE');
    const postTest = tests?.find(t => t.type === 'POST');

    // Get email from auth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (inscription as any).profiles;
    const { data: authUser } = await supabase.auth.admin.getUserById(inscription.profile_id);

    const dashboardData = {
      full_name: profile?.full_name || 'N/A',
      email: authUser?.user?.email || 'N/A',
      whatsapp_number: profile?.whatsapp_number || 'N/A',
      gender: profile?.gender || 'N/A',
      validated: inscription.validated,
      registration_date: inscription.registration_date,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session_date: sessionBooking ? (sessionBooking as any).sessions?.session_date : null,
      pre_test_score: preTest ? `${preTest.score}/${preTest.max_score}` : null,
      pre_test_percentage: preTest ? Math.round((preTest.score / preTest.max_score) * 100) : null,
      post_test_score: postTest ? `${postTest.score}/${postTest.max_score}` : null,
      post_test_percentage: postTest ? Math.round((postTest.score / postTest.max_score) * 100) : null,
      can_take_post_test: preTest && !postTest,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
