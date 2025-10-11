import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratedQuestion {
  question_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_choice: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const masterclassId = formData.get('masterclass_id') as string;

    console.log('📤 Upload request received');
    console.log('File:', file ? `${file.name} (${file.size} bytes)` : 'null');
    console.log('Masterclass ID:', masterclassId);

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'Aucun fichier PDF fourni' },
        { status: 400 }
      );
    }

    if (!masterclassId) {
      console.error('❌ No masterclass_id provided');
      return NextResponse.json(
        { error: 'ID de masterclass requis' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Le fichier doit être au format PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'Le fichier ne doit pas dépasser 5 Mo' },
        { status: 400 }
      );
    }

    console.log('✓ File validation passed');

    // Convert file to buffer for PDF parsing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📄 PDF converted to buffer, ready for parsing');

    // Note: GPT-4o with vision can't directly read PDFs via API
    // We'll use a simpler approach: extract text using a basic method
    // For production, consider using a dedicated PDF parsing service
    
    let pdfText: string;
    try {
      console.log('📖 Attempting to parse PDF...');
      // Try to extract text - if it fails, we'll generate generic questions
      const pdfParse = await import('pdf-parse');
      // @ts-ignore - pdf-parse is a CommonJS module
      const pdfParseFunc = pdfParse.default || pdfParse;
      const data = await pdfParseFunc(buffer);
      pdfText = data.text || '';
      console.log(`✓ PDF parsed: ${pdfText.length} characters`);
    } catch (error) {
      console.warn('⚠️  PDF parsing failed, will generate generic AI questions');
      console.error('PDF parse error details:', error);
      // If PDF parsing fails, use a generic prompt
      pdfText = 'Document sur l\'Intelligence Artificielle - contenu non extrait';
    }

    // Truncate text if too long
    const maxChars = 10000;
    const truncatedText = pdfText.length > maxChars 
      ? pdfText.substring(0, maxChars) + '...' 
      : pdfText;

    const prompt = `Tu es un expert en création de questions à choix multiples (QCM) pour des DÉBUTANTS COMPLETS en Intelligence Artificielle.

${pdfText.length > 100 ? `Voici le contenu d'un document de cours :\n\n${truncatedText}\n\n` : ''}Génère exactement 10 questions à choix multiples (QCM) TRÈS FACILES sur l'Intelligence Artificielle${pdfText.length > 100 ? ' basées sur ce contenu' : ' (concepts de base, exemples du quotidien, applications courantes)'}. 

IMPORTANT - Les questions doivent être :
- TRÈS SIMPLES et accessibles à des personnes sans aucune connaissance technique
- Formulées en langage courant, sans jargon technique
- Basées sur des exemples concrets du quotidien (Siri, Netflix, Facebook, etc.)
- Avec des réponses évidentes pour quelqu'un qui a un minimum de culture générale
- Progressives : commencer par des questions très basiques
- Chaque question doit avoir 4 options de réponse (A, B, C, D)
- Une seule réponse correcte par question

Exemples de questions adaptées :
- "Que signifie IA ?"
- "Quel assistant vocal utilise l'IA ?"
- "Quelle application utilise l'IA pour recommander des films ?"

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{
  "questions": [
    {
      "question_text": "Question ici ?",
      "choices": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct_choice": "A",
      "explanation": "Explication de la réponse correcte"
    }
  ]
}`;

    let generatedQuestions: GeneratedQuestion[];
    try {
      console.log('🤖 Calling OpenAI GPT-4o...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant qui génère des questions QCM au format JSON. Tu réponds UNIQUEMENT avec du JSON valide, sans texte supplémentaire.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('Pas de réponse de GPT-4o');
      }

      console.log('✓ OpenAI response received');
      console.log('Response preview:', responseText.substring(0, 200));

      // Extract JSON from response (GPT might add text before/after)
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON in the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      console.log('Extracted JSON preview:', jsonText.substring(0, 200));

      // Parse JSON response
      const parsed = JSON.parse(jsonText);
      generatedQuestions = parsed.questions;

      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error('Format de réponse invalide');
      }

      console.log(`✓ Generated ${generatedQuestions.length} questions`);
    } catch (error) {
      console.error('❌ OpenAI error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la génération des questions. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Insert questions into database
    const questionsToInsert = generatedQuestions.map((q) => ({
      masterclass_id: masterclassId,
      question_text: q.question_text,
      choices: q.choices,
      correct_choice: q.correct_choice,
    }));

    console.log('💾 Inserting questions into database...');
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement des questions' },
        { status: 500 }
      );
    }

    console.log(`✅ Success! ${insertedQuestions.length} questions saved`);

    return NextResponse.json({
      success: true,
      message: `${insertedQuestions.length} questions générées avec succès`,
      questions: insertedQuestions,
    });
  } catch (error) {
    console.error('❌ Generate questions error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
