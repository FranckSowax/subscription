import Link from "next/link";
import Image from "next/image";
import { FlipLogo } from "@/components/ui/FlipLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <FlipLogo />
          <h1 className="text-2xl font-semibold text-primary">Masterclass IA</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Bienvenue à la Masterclass d&apos;Introduction à l&apos;IA
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoignez notre programme de formation en Intelligence Artificielle. 
            Inscrivez-vous dès maintenant et passez votre test de pré-évaluation.
          </p>

          {/* Image Hero */}
          <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/replicate-prediction-7848ym82kxrm80cstebtj26dkc.jpeg"
              alt="Masterclass IA"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>

          <div className="flex justify-center items-center pt-8">
            <Link
              href="/inscription"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              S&apos;inscrire maintenant
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-accent text-4xl mb-4">📝</div>
              <h3 className="font-semibold text-lg mb-2">Inscription Rapide</h3>
              <p className="text-muted-foreground">
                Processus d&apos;inscription simple et rapide en quelques minutes
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-accent text-4xl mb-4">🎯</div>
              <h3 className="font-semibold text-lg mb-2">Évaluation Immédiate</h3>
              <p className="text-muted-foreground">
                Test de pré-évaluation avec résultats et corrections instantanés
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-accent text-4xl mb-4">🔐</div>
              <h3 className="font-semibold text-lg mb-2">Connexion Simple</h3>
              <p className="text-muted-foreground">
                Accédez à votre dashboard avec votre email d&apos;inscription
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
