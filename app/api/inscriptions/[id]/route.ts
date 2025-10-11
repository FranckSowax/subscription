import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: inscription, error } = await supabase
      .from('inscriptions')
      .select(`
        *,
        profiles (
          full_name,
          date_of_birth,
          whatsapp_number
        ),
        masterclasses (
          id,
          title,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error || !inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ inscription });
  } catch (error) {
    console.error('Get inscription error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
