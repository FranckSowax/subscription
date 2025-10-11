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

    // Get test IDs
    const { data: preTestData } = await supabase
      .from('tests')
      .select('id')
      .eq('inscription_id', inscriptionId)
      .eq('type', 'PRE')
      .single();

    const { data: postTestData } = await supabase
      .from('tests')
      .select('id')
      .eq('inscription_id', inscriptionId)
      .eq('type', 'POST')
      .single();

    // Get email from auth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (inscription as any).profiles;
    const { data: authUser } = await supabase.auth.admin.getUserById(inscription.profile_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = sessionBooking ? (sessionBooking as any).sessions : null;

    // Check if POST test should be available
    // POST test is available only after 15:00 on the session date
    let postTestAvailable = false;
    let postTestUnlocksAt: string | null = null;

    if (preTest && !postTest && session?.session_date) {
      const sessionDate = new Date(session.session_date);
      // Set session end time to 15:00 (3 PM)
      sessionDate.setHours(15, 0, 0, 0);
      postTestUnlocksAt = sessionDate.toISOString();
      
      const now = new Date();
      postTestAvailable = now >= sessionDate;
    }

    const dashboardData = {
      full_name: profile?.full_name || 'N/A',
      email: authUser?.user?.email || 'N/A',
      inscription_date: inscription.registration_date,
      session_date: session?.session_date || null,
      pre_test_id: preTestData?.id || null,
      pre_test_score: preTest?.score || null,
      pre_test_max_score: preTest?.max_score || null,
      pre_test_date: preTest?.taken_at || null,
      post_test_id: postTestData?.id || null,
      post_test_score: postTest?.score || null,
      post_test_max_score: postTest?.max_score || null,
      post_test_date: postTest?.taken_at || null,
      post_test_available: postTestAvailable,
      post_test_unlocks_at: postTestUnlocksAt,
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
