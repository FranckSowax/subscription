import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'json' or 'csv'

    // Get all inscriptions with related data
    const { data: inscriptions, error } = await supabase
      .from('inscriptions')
      .select(`
        id,
        validated,
        registration_date,
        field_of_study,
        education_level,
        profiles (
          id,
          full_name,
          date_of_birth,
          whatsapp_number,
          gender
        ),
        masterclasses (
          title
        )
      `)
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des étudiants' },
        { status: 500 }
      );
    }

    // Get test results for each inscription
    const studentsWithTests = await Promise.all(
      inscriptions.map(async (inscription) => {
        const { data: tests } = await supabase
          .from('tests')
          .select('type, score, max_score, taken_at')
          .eq('inscription_id', inscription.id);

        const preTest = tests?.find((t) => t.type === 'PRE');
        const postTest = tests?.find((t) => t.type === 'POST');

        const profile = Array.isArray(inscription.profiles) ? inscription.profiles[0] : inscription.profiles;
        const masterclass = Array.isArray(inscription.masterclasses) ? inscription.masterclasses[0] : inscription.masterclasses;

        // Get email from auth
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileId = (profile as any)?.id;
        const { data: authUser } = await supabase.auth.admin.getUserById(profileId);
        const email = authUser?.user?.email || 'N/A';

        return {
          id: inscription.id,
          full_name: profile?.full_name || 'N/A',
          email,
          date_of_birth: profile?.date_of_birth || 'N/A',
          whatsapp_number: profile?.whatsapp_number || 'N/A',
          gender: profile?.gender || 'N/A',
          field_of_study: (inscription as any).field_of_study || null,
          education_level: (inscription as any).education_level || null,
          masterclass: masterclass?.title || 'N/A',
          validated: inscription.validated,
          registration_date: inscription.registration_date,
          pre_test_score: preTest ? `${preTest.score}/${preTest.max_score}` : 'Non passé',
          pre_test_percentage: preTest ? Math.round((preTest.score / preTest.max_score) * 100) : 0,
          pre_test_date: preTest?.taken_at || null,
          post_test_score: postTest ? `${postTest.score}/${postTest.max_score}` : 'Non passé',
          post_test_percentage: postTest ? Math.round((postTest.score / postTest.max_score) * 100) : 0,
          post_test_date: postTest?.taken_at || null,
          improvement: preTest && postTest
            ? Math.round((postTest.score / postTest.max_score) * 100) - Math.round((preTest.score / preTest.max_score) * 100)
            : null,
        };
      })
    );

    // Return CSV format if requested
    if (format === 'csv') {
      const csv = generateCSV(studentsWithTests);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="etudiants_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json({ students: studentsWithTests });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

interface StudentCSV {
  full_name: string;
  date_of_birth: string;
  whatsapp_number: string;
  field_of_study: string | null;
  education_level: string | null;
  masterclass: string;
  validated: boolean;
  registration_date: string;
  pre_test_score: string;
  pre_test_percentage: number;
  pre_test_date: string | null;
  post_test_score: string;
  post_test_percentage: number;
  post_test_date: string | null;
  improvement: number | null;
}

function generateCSV(students: StudentCSV[]): string {
  const headers = [
    'Nom Complet',
    'Date de Naissance',
    'WhatsApp',
    'Filière',
    'Niveau',
    'Masterclass',
    'Validé',
    'Date Inscription',
    'Score Pré-Test',
    'Pourcentage Pré-Test',
    'Date Pré-Test',
    'Score Post-Test',
    'Pourcentage Post-Test',
    'Date Post-Test',
    'Progression (%)',
  ];

  const rows = students.map((student) => [
    student.full_name,
    student.date_of_birth,
    student.whatsapp_number,
    student.field_of_study || 'N/A',
    student.education_level || 'N/A',
    student.masterclass,
    student.validated ? 'Oui' : 'Non',
    new Date(student.registration_date).toLocaleDateString('fr-FR'),
    student.pre_test_score,
    student.pre_test_percentage || 'N/A',
    student.pre_test_date ? new Date(student.pre_test_date).toLocaleDateString('fr-FR') : 'N/A',
    student.post_test_score,
    student.post_test_percentage || 'N/A',
    student.post_test_date ? new Date(student.post_test_date).toLocaleDateString('fr-FR') : 'N/A',
    student.improvement !== null ? student.improvement : 'N/A',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
