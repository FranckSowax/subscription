import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Vérifier le token et récupérer le profile_id
    const { data: authToken } = await supabase
      .from('student_auth_tokens')
      .select('profile_id, expires_at')
      .eq('token', token)
      .single();

    if (!authToken || new Date(authToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Récupérer les informations de l'étudiant
    const { data: dashboard } = await supabase
      .from('student_dashboard')
      .select('session_date, post_test_id, post_test_available')
      .eq('profile_id', authToken.profile_id)
      .single();

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Données non trouvées' },
        { status: 404 }
      );
    }

    // Vérifier si le test POST est disponible
    const available = dashboard.post_test_available && !dashboard.post_test_id;

    return NextResponse.json({
      success: true,
      available,
      session_date: dashboard.session_date,
      already_taken: !!dashboard.post_test_id,
      message: available 
        ? 'Test POST disponible'
        : dashboard.post_test_id
        ? 'Test POST déjà passé'
        : 'Test POST non encore disponible (masterclass non passée)',
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
