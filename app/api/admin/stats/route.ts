import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all profiles with inscriptions and tests
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        whatsapp_number,
        gender,
        created_at
      `);

    if (error) {
      console.error('Profiles error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    }

    // Get all inscriptions
    const { data: inscriptions } = await supabase
      .from('inscriptions')
      .select('id, profile_id, validated, registration_date');

    // Get all tests
    const { data: tests } = await supabase
      .from('tests')
      .select('inscription_id, type, score');

    // Calculate statistics
    const totalStudents = profiles.length;
    const maleCount = profiles.filter(p => p.gender === 'Homme').length;
    const femaleCount = profiles.filter(p => p.gender === 'Femme').length;

    const validatedInscriptions = inscriptions?.filter(i => i.validated).length || 0;
    const pendingInscriptions = (inscriptions?.length || 0) - validatedInscriptions;

    const preTests = tests?.filter(t => t.type === 'PRE') || [];
    const postTests = tests?.filter(t => t.type === 'POST') || [];
    
    const avgPreScore = preTests.length > 0
      ? preTests.reduce((sum, t) => sum + t.score, 0) / preTests.length
      : 0;
    
    const avgPostScore = postTests.length > 0
      ? postTests.reduce((sum, t) => sum + t.score, 0) / postTests.length
      : 0;

    // Get students by gender with their info
    const studentsByGender = profiles.map(profile => {
      const inscription = inscriptions?.find(i => i.profile_id === profile.id);
      const preTest = inscription 
        ? tests?.find(t => t.inscription_id === inscription.id && t.type === 'PRE')
        : null;

      return {
        id: profile.id,
        full_name: profile.full_name,
        whatsapp_number: profile.whatsapp_number,
        gender: profile.gender,
        registration_date: inscription?.registration_date || profile.created_at,
        validated: inscription?.validated || false,
        pre_test_score: preTest?.score || null,
      };
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        maleCount,
        femaleCount,
        malePercentage: totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 0,
        femalePercentage: totalStudents > 0 ? Math.round((femaleCount / totalStudents) * 100) : 0,
        validatedInscriptions,
        pendingInscriptions,
        totalPreTests: preTests.length,
        totalPostTests: postTests.length,
        avgPreScore: Math.round(avgPreScore * 10) / 10,
        avgPostScore: Math.round(avgPostScore * 10) / 10,
      },
      studentsByGender,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
