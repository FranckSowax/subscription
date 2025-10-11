import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Vérifier si l'étudiant existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        inscriptions (
          id,
          validated,
          created_at
        )
      `)
      .eq('email', email.toLowerCase())
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cet email. Veuillez vous inscrire d\'abord.' },
        { status: 404 }
      );
    }

    // Vérifier qu'il y a au moins une inscription
    if (!profile.inscriptions || profile.inscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Aucune inscription trouvée. Veuillez vous inscrire d\'abord.' },
        { status: 404 }
      );
    }

    // Générer un token unique
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valide 24h

    // Enregistrer le token
    const { error: tokenError } = await supabase
      .from('student_auth_tokens')
      .insert({
        profile_id: profile.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error creating token:', tokenError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du token' },
        { status: 500 }
      );
    }

    // TODO: Envoyer le lien de connexion par email
    // Pour l'instant, on retourne le token directement
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/dashboard?token=${token}`;

    return NextResponse.json({
      success: true,
      message: 'Lien de connexion généré avec succès',
      loginUrl,
      token, // À retirer en production
      profile: {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
