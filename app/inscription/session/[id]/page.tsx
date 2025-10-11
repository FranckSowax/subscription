'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SessionSelector } from '@/components/test/SessionSelector';
import { useRouter } from 'next/navigation';

export default function SessionSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const handleSuccess = () => {
    // Rediriger vers le test après la réservation
    setTimeout(() => {
      router.push(`/test/pre?inscription_id=${id}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="text-2xl font-semibold text-primary">Masterclass IA</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              🎉 Inscription Réussie !
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Félicitations ! Votre inscription a été enregistrée avec succès.
              <br />
              <strong>Choisissez maintenant votre date de masterclass</strong>, puis vous passerez le test d&apos;évaluation.
            </p>
          </div>

          {/* Session Selector */}
          <SessionSelector 
            inscriptionId={id}
            onSuccess={handleSuccess}
          />

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-sm text-blue-800">
              💡 <strong>Prochaine étape :</strong> Après avoir réservé votre date, vous passerez un test d&apos;évaluation rapide (10 questions) pour nous aider à adapter le contenu de la masterclass à votre niveau.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Masterclass IA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
