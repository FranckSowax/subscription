import Link from 'next/link';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { LoginButton } from '@/components/ui/LoginButton';
import { ArrowLeft } from 'lucide-react';

export default function InscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Inscription à la Masterclass
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complétez votre inscription en quelques minutes. Vous choisirez ensuite votre date de masterclass,
              puis vous passerez un test d&apos;évaluation rapide.
            </p>
          </div>

          {/* Registration Form */}
          <RegistrationForm />

          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-primary text-3xl mb-3">⏱️</div>
              <h3 className="font-semibold mb-2">Rapide et Simple</h3>
              <p className="text-sm text-muted-foreground">
                L&apos;inscription prend moins de 5 minutes
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-primary text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Vos données sont protégées et confidentielles
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-primary text-3xl mb-3">📅</div>
              <h3 className="font-semibold mb-2">Choisissez Votre Date</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez la date qui vous convient
              </p>
            </div>
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
