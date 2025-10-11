import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Try to get existing masterclass
    let { data: masterclass } = await supabase
      .from('masterclasses')
      .select('*')
      .limit(1)
      .single();

    // If no masterclass exists, create a default one
    if (!masterclass) {
      const { data: newMasterclass, error } = await supabase
        .from('masterclasses')
        .insert({
          title: 'Introduction à l\'Intelligence Artificielle',
          description: 'Masterclass d\'introduction aux concepts fondamentaux de l\'IA',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating masterclass:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la création de la masterclass' },
          { status: 500 }
        );
      }

      masterclass = newMasterclass;
    }

    return NextResponse.json({ masterclass });
  } catch (error) {
    console.error('Get masterclass error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
