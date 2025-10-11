// WhatsApp API integration using Whapi.cloud

const WHAPI_API_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
const WHAPI_API_TOKEN = process.env.WHAPI_API_TOKEN;

interface SendMessageParams {
  to: string;
  body: string;
}

export async function sendWhatsAppMessage({ to, body }: SendMessageParams): Promise<boolean> {
  if (!WHAPI_API_TOKEN) {
    console.error('WHAPI_API_TOKEN not configured');
    return false;
  }

  try {
    // Format phone number (remove + if present, Whapi expects format like 241XXXXXXXXX)
    const formattedPhone = to.replace(/^\+/, '');

    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        typing_time: 0,
        to: formattedPhone,
        body: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whapi error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

// Message templates
export const WhatsAppTemplates = {
  registration: (name: string) => `
🎓 *Bienvenue à la Masterclass IA !*

Bonjour ${name},

Votre inscription a été enregistrée avec succès ! 

Vous allez maintenant passer le test de pré-évaluation (10 questions).

Score minimum requis : 50%

Bonne chance ! 🍀
  `.trim(),

  preTestPassed: (name: string, score: number, percentage: number) => `
✅ *Test de Pré-Évaluation Réussi !*

Félicitations ${name} !

Votre score : ${score}/10 (${percentage}%)

Votre inscription est maintenant validée. Vous recevrez bientôt les détails de la masterclass.

À très bientôt ! 🎉
  `.trim(),

  preTestFailed: (name: string, score: number, percentage: number) => `
❌ *Test de Pré-Évaluation Non Validé*

Bonjour ${name},

Votre score : ${score}/10 (${percentage}%)

Score minimum requis : 50%

Veuillez contacter l'administrateur pour plus d'informations.
  `.trim(),

  masterclassReminder: (name: string, date: string, time: string) => `
📅 *Rappel : Masterclass IA*

Bonjour ${name},

Rappel : La masterclass aura lieu le ${date} à ${time}.

Lien de connexion : [À compléter]

Préparez vos questions ! 💡
  `.trim(),

  postTestReminder: (name: string) => `
📝 *Test Post-Masterclass Disponible*

Bonjour ${name},

Merci d'avoir participé à la masterclass !

Le test post-masterclass est maintenant disponible pour évaluer vos acquis.

Accédez au test via votre lien personnel.

Bonne chance ! 🎯
  `.trim(),

  postTestCompleted: (name: string, score: number, percentage: number, improvement: number) => `
🎓 *Test Post-Masterclass Terminé*

Félicitations ${name} !

Votre score : ${score}/10 (${percentage}%)
${improvement > 0 ? `Progression : +${improvement}%` : ''}

Merci d'avoir participé à notre masterclass !

Continuez à apprendre ! 🚀
  `.trim(),
};
