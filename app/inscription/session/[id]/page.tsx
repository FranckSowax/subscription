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
    // Rediriger vers le pré-test après la sélection de session
    setTimeout(() => {
      router.push(`/test/pre?inscription_id=${id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              📅 Choisissez votre Date de Masterclass
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sélectionnez la date qui vous convient le mieux pour participer à la masterclass :
              <br />
              <strong className="text-primary">Étape 1/2 : Choix de session</strong>
              <br />
              <span className="text-sm">⚠️ Après avoir choisi votre date, vous passerez le pré-test obligatoire pour finaliser votre inscription.</span>
            </p>
          </div>

          {/* Session Selector */}
          <SessionSelector 
            inscriptionId={id}
            onSuccess={handleSuccess}
          />

          {/* Info */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center">
            <p className="text-sm text-blue-900">
              💡 <strong>Important :</strong> Après avoir choisi votre date, vous serez redirigé vers le pré-test (10 questions, 15 secondes par question). Votre réservation sera automatiquement confirmée après avoir réussi le test.
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
