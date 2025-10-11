import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Vérifier le token
    const { data: authToken, error: tokenError } = await supabase
      .from('student_auth_tokens')
      .select('*, profiles(*)')
      .eq('token', token)
      .single();

    if (tokenError || !authToken) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Vérifier l'expiration
    const expiresAt = new Date(authToken.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token expiré. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    // Mettre à jour last_used_at
    await supabase
      .from('student_auth_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', authToken.id);

    return NextResponse.json({
      success: true,
      profile: {
        id: authToken.profiles.id,
        name: authToken.profiles.full_name,
        email: authToken.profiles.email,
        whatsapp: authToken.profiles.whatsapp,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
