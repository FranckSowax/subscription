import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { registrationSchema } from '@/lib/validations/registration';

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { full_name, email, whatsapp_number } = validationResult.data;

    // Check if email already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const emailExists = existingUser?.users.some((user) => user.email === email);

    if (emailExists) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé. Veuillez utiliser une autre adresse.' },
        { status: 409 }
      );
    }

    // Create auth user with a random password (students don't need to login)
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
      },
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name,
      whatsapp_number,
    });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Get or create default masterclass
    let { data: masterclass } = await supabase
      .from('masterclasses')
      .select('id')
      .limit(1)
      .single();

    // If no masterclass exists, create a default one
    if (!masterclass) {
      const { data: newMasterclass, error: masterclassError } = await supabase
        .from('masterclasses')
        .insert({
          title: 'Introduction à l\'Intelligence Artificielle',
          description: 'Masterclass d\'introduction aux concepts fondamentaux de l\'IA',
        })
        .select()
        .single();

      if (masterclassError) {
        console.error('Masterclass error:', masterclassError);
        return NextResponse.json(
          { error: 'Erreur lors de la création de l\'inscription.' },
          { status: 500 }
        );
      }
      masterclass = newMasterclass;
    }

    // Create inscription
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .insert({
        profile_id: authData.user.id,
        masterclass_id: masterclass!.id,
        validated: false, // Will be validated after pre-test
      })
      .select()
      .single();

    if (inscriptionError) {
      console.error('Inscription error:', inscriptionError);
      // Rollback
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erreur lors de l\'inscription. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Send WhatsApp confirmation
    try {
      const { sendWhatsAppMessage, WhatsAppTemplates } = await import('@/lib/whatsapp/whapi');
      await sendWhatsAppMessage({
        to: whatsapp_number,
        body: WhatsAppTemplates.registration(full_name),
      });
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      // Don't fail registration if WhatsApp fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Inscription réussie!',
        data: {
          user_id: authData.user.id,
          inscription_id: inscription.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
