import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const supabase = await createClient();

    // Vérifier token
    const { data: authToken } = await supabase
      .from('student_auth_tokens')
      .select('profile_id, expires_at')
      .eq('token', token)
      .single();

    if (!authToken || new Date(authToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer dashboard
    const { data: dashboard } = await supabase
      .from('student_dashboard')
      .select('*')
      .eq('profile_id', authToken.profile_id)
      .single();

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
