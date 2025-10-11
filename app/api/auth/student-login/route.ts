import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Find user by email in auth
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cet email. Veuillez d\'abord vous inscrire.' },
        { status: 404 }
      );
    }

    // Get inscription for this user
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('id, validated')
      .eq('profile_id', user.id)
      .single();

    if (inscriptionError || !inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée. Veuillez d\'abord vous inscrire.' },
        { status: 404 }
      );
    }

    // Check if user has completed PRE test
    const { data: preTest } = await supabase
      .from('tests')
      .select('id, score')
      .eq('inscription_id', inscription.id)
      .eq('type', 'PRE')
      .single();

    if (!preTest) {
      return NextResponse.json(
        { error: 'Vous devez d\'abord passer le test PRE pour accéder à votre profil.' },
        { status: 403 }
      );
    }

    // Return success with inscription ID
    return NextResponse.json({
      message: 'Connexion réussie',
      inscription_id: inscription.id,
      email: user.email,
    });

  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
