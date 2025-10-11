import { NextResponse } from 'next/server';
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
}

export async function POST() {
  try {
    console.log('🧪 Testing OpenAI connection...');

    // Get default masterclass
    const { data: masterclass } = await supabase
      .from('masterclasses')
      .select('*')
      .limit(1)
      .single();

    if (!masterclass) {
      return NextResponse.json(
        { error: 'Aucune masterclass trouvée' },
        { status: 404 }
      );
    }

    const prompt = `Génère exactement 10 questions à choix multiples (QCM) TRÈS FACILES sur l'Intelligence Artificielle pour des DÉBUTANTS COMPLETS. 

IMPORTANT - Les questions doivent être :
- TRÈS SIMPLES et accessibles à des personnes sans aucune connaissance technique
- Formulées en langage courant, sans jargon technique
- Basées sur des exemples concrets du quotidien (Siri, Alexa, Netflix, Facebook, Google Photos, etc.)
- Avec des réponses évidentes pour quelqu'un qui a un minimum de culture générale
- Progressives : commencer par des questions très basiques

Exemples de questions adaptées :
- "Que signifie IA ?"
- "Quel assistant vocal utilise l'IA : Siri, Excel, Paint ou Bloc-notes ?"
- "Quelle application utilise l'IA pour recommander des films : Netflix, Word, Calculatrice ou Horloge ?"

Chaque question doit :
- Avoir 4 options de réponse (A, B, C, D)
- Avoir une seule réponse correcte très évidente

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{
  "questions": [
    {
      "question_text": "Qu'est-ce que l'Intelligence Artificielle ?",
      "choices": {
        "A": "Un programme informatique",
        "B": "Une branche de l'informatique simulant l'intelligence humaine",
        "C": "Un robot",
        "D": "Un algorithme"
      },
      "correct_choice": "B"
    }
  ]
}`;

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
    const generatedQuestions: GeneratedQuestion[] = parsed.questions;

    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      throw new Error('Format de réponse invalide');
    }

    console.log(`✓ Generated ${generatedQuestions.length} questions`);

    // Insert questions into database
    const questionsToInsert = generatedQuestions.map((q) => ({
      masterclass_id: masterclass.id,
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
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Une erreur est survenue: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
