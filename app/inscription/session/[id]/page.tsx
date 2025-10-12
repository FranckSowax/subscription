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
              📝 Finalisation de votre Inscription
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vos informations ont été enregistrées. Pour finaliser votre inscription, vous devez :
              <br />
              <strong className="text-primary">1. Choisir votre date de masterclass</strong>
              <br />
              <strong className="text-primary">2. Passer le test d&apos;évaluation (score minimum : 50%)</strong>
              <br />
              <span className="text-sm">⚠️ Votre inscription ne sera validée qu&apos;après la réussite du test.</span>
            </p>
          </div>

          {/* Session Selector */}
          <SessionSelector 
            inscriptionId={id}
            onSuccess={handleSuccess}
          />

          {/* Info */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 text-center">
            <p className="text-sm text-orange-900">
              ⚠️ <strong>Important :</strong> Après avoir choisi votre date, vous devrez passer un test d&apos;évaluation de 10 questions (30 secondes par question). Un score minimum de 50% est requis pour valider définitivement votre inscription.
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
