'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, LogIn, Home, Loader2 } from 'lucide-react';
import { LoginButton } from '@/components/ui/LoginButton';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-end gap-4">
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Success Message */}
          <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-500 p-3">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-700">
                Test PRE Complété avec Succès !
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Félicitations ! Vous avez terminé votre test de pré-évaluation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Vos résultats sont disponibles
                </h3>
                <p className="text-muted-foreground mb-4">
                  Votre inscription a été validée. Vous pouvez maintenant accéder à votre profil pour :
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-6 list-disc">
                  <li>Consulter vos résultats détaillés</li>
                  <li>Voir la date de votre masterclass</li>
                  <li>Télécharger votre confirmation en PDF</li>
                  <li>Accéder au test POST après la masterclass</li>
                </ul>
              </div>

              {email && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-blue-600" />
                    Comment accéder à votre profil ?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Pour vous reconnecter et accéder à votre profil à tout moment :
                  </p>
                  <div className="bg-white p-4 rounded-md border mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      1. Cliquez sur le bouton <strong>&quot;Se connecter&quot;</strong> en haut à droite de la page
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      2. Entrez votre email d&apos;inscription :
                    </p>
                    <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                      {email}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      3. Cliquez sur <strong>&quot;Accéder à mon profil&quot;</strong>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Vous pouvez accéder à votre profil depuis n&apos;importe quelle page en utilisant ce bouton
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l&apos;accueil
                  </Button>
                </Link>
                <div className="flex-1 flex justify-center">
                  <LoginButton />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Prochaines Étapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Consultation des résultats</h4>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous pour voir votre score détaillé et les corrections
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Masterclass IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Participez à la masterclass à la date choisie (9h00 - 15h00)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Test POST</h4>
                  <p className="text-sm text-muted-foreground">
                    Après la masterclass, passez le test POST pour mesurer vos progrès
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default function TestConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
